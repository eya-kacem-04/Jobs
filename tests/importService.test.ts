import { describe, it, expect } from 'vitest';
import { isDuplicateJob, normalizeRawRecord, parseRecruitmentCSV } from '../src/services/importService';
import { Job } from '../src/types';

describe('Import & Deduplication Service', () => {
  const existingJob: Job = {
    id: 'job_cni_ing',
    title: 'Ingénieurs Principaux en Informatique',
    organization: 'Centre National de l\'Informatique (CNI)',
    company: null,
    description: 'Concours officiel',
    academicSection: 'computer_science',
    educationLevel: 'engineer',
    professionalCategory: 'engineering',
    sector: 'public',
    jobType: 'civil_service',
    governorates: ['Tunis'],
    requiredSkills: ['Linux', 'DevOps'],
    vacanciesCount: 10,
    publicationDate: '2026-09-10',
    applicationDeadline: '2026-10-10',
    status: 'active',
    verificationStatus: 'verified',
    sourceUrl: 'https://www.cni.tn/concours',
    applicationUrl: 'https://www.concours.gov.tn/cni-2026',
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z'
  };

  it('detects duplicate by exact application URL', () => {
    const isDup = isDuplicateJob(
      { applicationUrl: 'https://www.concours.gov.tn/cni-2026', title: 'Other title' },
      [existingJob]
    );
    expect(isDup).toBe(true);
  });

  it('detects duplicate by fuzzy title and organization matching', () => {
    const isDup = isDuplicateJob(
      {
        title: 'Ingénieurs Principaux en Informatique',
        organization: 'Centre National de l\'Informatique (CNI)',
        publicationDate: '2026-09-15',
        applicationUrl: 'https://other-url.com'
      },
      [existingJob]
    );
    expect(isDup).toBe(true);
  });

  it('does not flag distinct job as duplicate', () => {
    const isDup = isDuplicateJob(
      {
        title: 'Professeur de Français',
        organization: 'Ministère de l\'Éducation',
        publicationDate: '2026-09-15',
        applicationUrl: 'https://www.edunet.tn/concours-fr'
      },
      [existingJob]
    );
    expect(isDup).toBe(false);
  });

  it('correctly parses CSV recruitment entries', () => {
    const csv = `title,organization,description,academicSection,applicationUrl\n"Professeur Math","Ministère Éducation","Description texte","mathematics","https://edunet.tn"`;
    const parsed = parseRecruitmentCSV(csv);
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe('Professeur Math');
    expect(parsed[0].academicSection).toBe('mathematics');
  });

  it('normalizes valid raw record and sets defaults', () => {
    const normalized = normalizeRawRecord({
      title: 'Technicien Électrique',
      description: 'Maintenance',
      applicationUrl: 'https://steg.com.tn',
      governorates: 'Sfax, Sousse',
      academicSection: 'engineering'
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.governorates).toEqual(['Sfax', 'Sousse']);
    expect(normalized?.academicSection).toBe('engineering');
    expect(normalized?.status).toBe('active');
  });
});
