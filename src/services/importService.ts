import { Job, ImportLog, AcademicSectionKey, EducationLevelKey, ProfessionalCategoryKey, SectorType, JobType } from '../types';
import { LocalStore } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RawImportRecord {
  title?: string;
  organization?: string;
  company?: string;
  description?: string;
  academicSection?: string;
  educationLevel?: string;
  professionalCategory?: string;
  sector?: string;
  jobType?: string;
  governorates?: string | string[];
  location?: string;
  requiredSkills?: string | string[];
  vacanciesCount?: number | string;
  publicationDate?: string;
  applicationDeadline?: string;
  sourceUrl?: string;
  applicationUrl?: string;
}

export interface ImportResult {
  log: ImportLog;
  importedJobs: Job[];
  duplicates: RawImportRecord[];
  errors: { item: RawImportRecord; reason: string }[];
}

/**
 * Deduplication Engine
 * Compares exact application URLs and fuzzy composite tokens:
 * (normalized title + organization/company + publication date)
 */
export const isDuplicateJob = (incoming: Partial<Job>, existingJobs: Job[]): boolean => {
  if (!incoming.title) return false;

  const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
  const incomingTitleNorm = normalizeStr(incoming.title);
  const incomingOrgNorm = normalizeStr(incoming.organization || incoming.company || '');
  const incomingAppUrl = incoming.applicationUrl ? incoming.applicationUrl.trim().toLowerCase() : '';

  return existingJobs.some(existing => {
    // 1. Direct application URL match
    if (incomingAppUrl && existing.applicationUrl && existing.applicationUrl.trim().toLowerCase() === incomingAppUrl) {
      return true;
    }

    // 2. Direct source URL match
    if (incoming.sourceUrl && existing.sourceUrl && existing.sourceUrl.trim().toLowerCase() === incoming.sourceUrl.trim().toLowerCase()) {
      return true;
    }

    // 3. Normalized Title + Organization match
    const existingTitleNorm = normalizeStr(existing.title);
    const existingOrgNorm = normalizeStr(existing.organization || existing.company || '');

    const titleExact = existingTitleNorm === incomingTitleNorm || 
      (existingTitleNorm.length > 15 && incomingTitleNorm.length > 15 && 
       (existingTitleNorm.includes(incomingTitleNorm) || incomingTitleNorm.includes(existingTitleNorm)));

    const orgMatch = existingOrgNorm && incomingOrgNorm ? existingOrgNorm === incomingOrgNorm : true;

    if (titleExact && orgMatch) {
      // If published in the same month/year or same deadline
      if (incoming.publicationDate && existing.publicationDate) {
        if (incoming.publicationDate.substring(0, 7) === existing.publicationDate.substring(0, 7)) {
          return true;
        }
      }
      return true;
    }

    return false;
  });
};

/**
 * Normalizes raw incoming data from heterogeneous sources
 */
export const normalizeRawRecord = (
  raw: RawImportRecord, 
  sourceId?: string,
  sourceName?: string
): Partial<Job> | null => {
  if (!raw.title || !raw.description || (!raw.applicationUrl && !raw.sourceUrl)) {
    return null;
  }

  // Parse Governorates array
  let govs: string[] = ['Tunis'];
  if (Array.isArray(raw.governorates)) {
    govs = raw.governorates.length > 0 ? raw.governorates : ['Tunis'];
  } else if (typeof raw.governorates === 'string') {
    govs = raw.governorates.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    if (govs.length === 0) govs = ['Tunis'];
  }

  // Parse Skills array
  let skills: string[] = [];
  if (Array.isArray(raw.requiredSkills)) {
    skills = raw.requiredSkills;
  } else if (typeof raw.requiredSkills === 'string') {
    skills = raw.requiredSkills.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }

  // Vacancies count
  let vacancies = 1;
  if (raw.vacanciesCount) {
    const parsed = parseInt(String(raw.vacanciesCount), 10);
    if (!isNaN(parsed) && parsed > 0) vacancies = parsed;
  }

  // Dates
  const pubDate = raw.publicationDate ? raw.publicationDate.split('T')[0] : new Date().toISOString().split('T')[0];
  const deadline = raw.applicationDeadline ? raw.applicationDeadline.split('T')[0] : null;

  // Determine Sector & Category
  let sector: SectorType = 'private';
  if (raw.sector === 'public' || raw.sector === 'teaching' || raw.sector === 'other') {
    sector = raw.sector;
  } else if (raw.organization && (raw.organization.toLowerCase().includes('minist') || raw.organization.toLowerCase().includes('direction') || raw.organization.toLowerCase().includes('national'))) {
    sector = 'public';
  }

  let profCategory: ProfessionalCategoryKey = (raw.professionalCategory as ProfessionalCategoryKey) || 'other';
  if (sector === 'teaching') profCategory = 'teaching';

  return {
    title: raw.title.trim(),
    organization: raw.organization ? raw.organization.trim() : null,
    company: raw.company ? raw.company.trim() : null,
    description: raw.description.trim(),
    academicSection: (raw.academicSection as AcademicSectionKey) || 'other',
    educationLevel: (raw.educationLevel as EducationLevelKey) || 'licence',
    professionalCategory: profCategory,
    sector,
    jobType: (raw.jobType as JobType) || (sector === 'public' ? 'civil_service' : 'full_time'),
    governorates: govs,
    location: raw.location ? raw.location.trim() : null,
    requiredSkills: skills,
    vacanciesCount: vacancies,
    publicationDate: pubDate,
    applicationDeadline: deadline,
    status: 'active',
    verificationStatus: 'verified',
    sourceId: sourceId || null,
    sourceName: sourceName || 'Importation Officielle',
    sourceUrl: raw.sourceUrl || raw.applicationUrl || 'https://www.concours.gov.tn',
    applicationUrl: raw.applicationUrl || raw.sourceUrl || 'https://www.concours.gov.tn'
  };
};

/**
 * Executes a batch ingestion with deduplication and logging
 */
export const runImportBatch = async (
  records: RawImportRecord[],
  sourceId?: string,
  sourceName?: string,
  importType: 'json' | 'csv' | 'rss' | 'api' | 'manual' = 'json'
): Promise<ImportResult> => {
  const existingJobs = LocalStore.getJobs();
  const importedJobs: Job[] = [];
  const duplicates: RawImportRecord[] = [];
  const errors: { item: RawImportRecord; reason: string }[] = [];

  const batchId = 'batch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  for (const raw of records) {
    const normalized = normalizeRawRecord(raw, sourceId, sourceName);
    if (!normalized) {
      errors.push({ item: raw, reason: 'Champs obligatoires manquants (titre, description, ou URL officielle)' });
      continue;
    }

    if (isDuplicateJob(normalized, [...existingJobs, ...importedJobs])) {
      duplicates.push(raw);
      continue;
    }

    const newJob: Job = {
      id: 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      ...(normalized as any),
      importBatchId: batchId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    importedJobs.push(newJob);
  }

  // Persist imported jobs
  if (importedJobs.length > 0) {
    LocalStore.saveJobsBatch(importedJobs);

    // If Supabase is connected, sync to PostgreSQL
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('jobs').insert(importedJobs.map(j => ({
          id: j.id,
          title: j.title,
          organization: j.organization,
          company: j.company,
          description: j.description,
          academic_section: j.academicSection,
          education_level: j.educationLevel,
          professional_category: j.professionalCategory,
          sector: j.sector,
          job_type: j.jobType,
          governorates: j.governorates,
          location: j.location,
          required_skills: j.requiredSkills,
          vacancies_count: j.vacanciesCount,
          publication_date: j.publicationDate,
          application_deadline: j.applicationDeadline,
          status: j.status,
          verification_status: j.verificationStatus,
          source_id: j.sourceId,
          source_url: j.sourceUrl,
          application_url: j.applicationUrl,
          import_batch_id: j.importBatchId
        })));
      } catch (err) {
        console.warn('Supabase sync warning on import batch', err);
      }
    }
  }

  // Create Audit Log
  const log: ImportLog = LocalStore.addImportLog({
    sourceId: sourceId || null,
    sourceName: sourceName || 'Import Direct',
    importType,
    itemsFound: records.length,
    itemsImported: importedJobs.length,
    duplicatesDetected: duplicates.length,
    errorsCount: errors.length,
    errorDetails: errors.length > 0 ? errors.map(e => e.reason) : null,
    status: errors.length === records.length ? 'failed' : (errors.length > 0 ? 'partial' : 'completed')
  });

  return {
    log,
    importedJobs,
    duplicates,
    errors
  };
};

/**
 * Parser for CSV input format
 */
export const parseRecruitmentCSV = (csvContent: string): RawImportRecord[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const records: RawImportRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple regex for CSV splitting preserving quoted commas
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const cleanValues = values.map(v => v.trim().replace(/^["']|["']$/g, ''));

    const record: any = {};
    headers.forEach((header, idx) => {
      record[header] = cleanValues[idx] || '';
    });

    records.push(record);
  }

  return records;
};
