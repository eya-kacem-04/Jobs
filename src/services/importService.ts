import { Job, ImportLog, AcademicSectionKey, EducationLevelKey, ProfessionalCategoryKey, SectorType, JobType } from '../types';
import { LocalStore } from '../lib/storage';
import { JobRepository } from '../lib/jobRepository';

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
  /** Set when the jobs were valid but Supabase refused to save them. */
  saveError?: string;
}

/** Only accept real web links (blocks things like "javascript:..."). */
const isHttpUrl = (value?: string): boolean => {
  if (!value) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

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
  const appUrl = raw.applicationUrl?.trim();
  const srcUrl = raw.sourceUrl?.trim();

  if (!raw.title || !raw.description || (!appUrl && !srcUrl)) {
    return null;
  }

  // Links must be real http(s) links
  if ((appUrl && !isHttpUrl(appUrl)) || (srcUrl && !isHttpUrl(srcUrl))) {
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
    sourceUrl: srcUrl || appUrl || '',
    applicationUrl: appUrl || srcUrl || ''
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
  const candidates: Job[] = [];
  const duplicates: RawImportRecord[] = [];
  const errors: { item: RawImportRecord; reason: string }[] = [];

  const batchId = crypto.randomUUID();

  for (const raw of records) {
    const normalized = normalizeRawRecord(raw, sourceId, sourceName);
    if (!normalized) {
      errors.push({
        item: raw,
        reason: 'Champs obligatoires manquants ou lien invalide (titre, description, URL officielle en https://)'
      });
      continue;
    }

    if (isDuplicateJob(normalized, [...existingJobs, ...candidates])) {
      duplicates.push(raw);
      continue;
    }

    const newJob: Job = {
      id: crypto.randomUUID(),
      ...(normalized as any),
      importBatchId: batchId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    candidates.push(newJob);
  }

  // Save to Supabase first. Only jobs that were really saved appear on the site.
  let importedJobs: Job[] = [];
  let saveError: string | undefined;

  if (candidates.length > 0) {
    const remote = await JobRepository.saveRemote(candidates, { silent: true });
    if (remote.ok) {
      candidates.forEach(job => JobRepository.upsertLocal(job));
      importedJobs = candidates;
    } else {
      saveError = remote.error || 'Erreur inconnue';
    }
  }

  const totalErrors = errors.length + (saveError ? candidates.length : 0);
  const errorDetails = [
    ...errors.map(e => e.reason),
    ...(saveError ? [`Enregistrement Supabase refusé : ${saveError}`] : [])
  ];

  // Create Audit Log
  const log: ImportLog = LocalStore.addImportLog({
    sourceId: sourceId || null,
    sourceName: sourceName || 'Import Direct',
    importType,
    itemsFound: records.length,
    itemsImported: importedJobs.length,
    duplicatesDetected: duplicates.length,
    errorsCount: totalErrors,
    errorDetails: errorDetails.length > 0 ? errorDetails : null,
    status: importedJobs.length === 0 && totalErrors > 0 ? 'failed' : (totalErrors > 0 ? 'partial' : 'completed')
  });

  return {
    log,
    importedJobs,
    duplicates,
    errors,
    saveError
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