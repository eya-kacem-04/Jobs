import { describe, it, expect } from 'vitest';
import { evaluateJobMatch, calculateInternalMatchingRank, prioritizeJobsForUser } from '../src/services/matchingService';
import { Job, UserProfile } from '../src/types';

describe('Transparent Matching Service', () => {
  const sampleUser: UserProfile = {
    id: 'usr_test',
    email: 'test@tawdheef.tn',
    fullName: 'Test Candidate',
    academicSection: 'mathematics',
    educationLevel: 'master',
    preferredJobCategories: ['teaching'],
    preferredGovernorates: ['Sousse', 'Monastir'],
    professionalInterests: ['Enseignement secondaire'],
    skills: ['Algèbre', 'Analyse'],
    notificationPreferences: { email: false, inApp: true, newMatchingJob: true, deadlineReminder: true },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const matchingJob: Job = {
    id: 'job_math_sousse',
    title: 'Professeur de Mathématiques',
    organization: 'Ministère de l\'Éducation',
    company: null,
    description: 'Concours de recrutement',
    academicSection: 'mathematics',
    educationLevel: 'master',
    professionalCategory: 'teaching',
    sector: 'teaching',
    jobType: 'civil_service',
    governorates: ['Sousse'],
    requiredSkills: ['Algèbre', 'Pédagogie'],
    vacanciesCount: 20,
    publicationDate: '2026-09-01',
    applicationDeadline: '2026-10-01',
    status: 'active',
    verificationStatus: 'verified',
    sourceUrl: 'https://www.edunet.tn',
    applicationUrl: 'https://www.edunet.tn/apply',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  };

  const nonMatchingJob: Job = {
    id: 'job_dev_tunis',
    title: 'Développeur Python',
    organization: null,
    company: 'Tech Corp',
    description: 'Dev backend',
    academicSection: 'computer_science',
    educationLevel: 'engineer',
    professionalCategory: 'it',
    sector: 'private',
    jobType: 'full_time',
    governorates: ['Tunis'],
    requiredSkills: ['Python', 'Django'],
    vacanciesCount: 2,
    publicationDate: '2026-09-01',
    applicationDeadline: '2026-10-01',
    status: 'active',
    verificationStatus: 'verified',
    sourceUrl: 'https://aneti.tn',
    applicationUrl: 'https://techcorp.tn',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  };

  it('correctly identifies matched criteria without arbitrary percentages', () => {
    const evalMath = evaluateJobMatch(matchingJob, sampleUser);
    expect(evalMath.matchesSection).toBe(true);
    expect(evalMath.matchesLevel).toBe(true);
    expect(evalMath.matchesCategory).toBe(true);
    expect(evalMath.matchesGovernorate).toBe(true);
    expect(evalMath.matchedSkills).toContain('Algèbre');
    expect(evalMath.isRecommended).toBe(true);
    expect(evalMath.totalMatchesCount).toBe(5);

    // Verify there is NO arbitrary compatibility score field
    expect((evalMath as any).compatibilityPercentage).toBeUndefined();
    expect((evalMath as any).score).toBeUndefined();
  });

  it('correctly identifies non-matching job', () => {
    const evalDev = evaluateJobMatch(nonMatchingJob, sampleUser);
    expect(evalDev.matchesSection).toBe(false);
    expect(evalDev.matchesCategory).toBe(false);
    expect(evalDev.matchesGovernorate).toBe(false);
    expect(evalDev.isRecommended).toBe(false);
  });

  it('prioritizes matching jobs at the top of recommendations', () => {
    const list = [nonMatchingJob, matchingJob];
    const prioritized = prioritizeJobsForUser(list, sampleUser);
    expect(prioritized[0].id).toBe(matchingJob.id);
  });
});
