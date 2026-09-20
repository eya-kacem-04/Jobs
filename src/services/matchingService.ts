import { Job, UserProfile, MatchCriteriaResult } from '../types';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES } from '../constants/tunisiaData';

/**
 * Deterministic, Transparent Matching Engine
 * 
 * Rules:
 * 1. ZERO arbitrary scores or misleading percentages are presented to the user.
 * 2. Matches are based strictly on 5 factual criteria:
 *    - Academic section / specialization
 *    - Required education level
 *    - Job category
 *    - Preferred governorate
 *    - Skills and keywords
 * 3. Returns transparent flags indicating exactly which criteria matched.
 * 4. Provides internal sorting rank for recommendation ordering.
 */

// Helper to get education level hierarchy order
const getEducationLevelOrder = (key: string): number => {
  const found = EDUCATION_LEVELS.find(l => l.key === key);
  return found ? found.order : 0;
};

export const evaluateJobMatch = (job: Job, profile: UserProfile | null | undefined): MatchCriteriaResult => {
  if (!profile) {
    return {
      matchesSection: false,
      matchesLevel: false,
      matchesCategory: false,
      matchesGovernorate: false,
      matchedGovernorateLabels: [],
      matchedSkills: [],
      totalMatchesCount: 0,
      isRecommended: false
    };
  }

  // 1. Academic section match
  let matchesSection = false;
  let matchedSectionLabel: string | undefined;
  if (profile.academicSection && job.academicSection === profile.academicSection) {
    matchesSection = true;
    const sectionObj = ACADEMIC_SECTIONS.find(s => s.key === job.academicSection);
    matchedSectionLabel = sectionObj ? sectionObj.labelFr : job.academicSection;
  }

  // 2. Education level match (qualifies if candidate holds the required degree or higher)
  let matchesLevel = false;
  let matchedLevelLabel: string | undefined;
  if (profile.educationLevel) {
    const userOrder = getEducationLevelOrder(profile.educationLevel);
    const jobOrder = getEducationLevelOrder(job.educationLevel);
    // Exact match or qualified with higher level
    if (userOrder >= jobOrder && jobOrder > 0) {
      matchesLevel = true;
      const levelObj = EDUCATION_LEVELS.find(l => l.key === job.educationLevel);
      matchedLevelLabel = levelObj ? levelObj.labelFr : job.educationLevel;
    }
  }

  // 3. Category match
  let matchesCategory = false;
  let matchedCategoryLabel: string | undefined;
  if (profile.preferredJobCategories && profile.preferredJobCategories.length > 0) {
    if (profile.preferredJobCategories.includes(job.professionalCategory)) {
      matchesCategory = true;
      matchedCategoryLabel = job.professionalCategory;
    }
  }

  // 4. Preferred governorates match
  let matchesGovernorate = false;
  const matchedGovernorateLabels: string[] = [];
  if (profile.preferredGovernorates && profile.preferredGovernorates.length > 0) {
    // Check if job includes any of the user's preferred governorates or covers all of Tunisia
    const userGovs = new Set(profile.preferredGovernorates);
    const hasNationwide = job.governorates.includes('all_tunisia') || job.governorates.length === 24;

    if (hasNationwide) {
      matchesGovernorate = true;
      matchedGovernorateLabels.push('Toute la Tunisie');
    } else {
      for (const gov of job.governorates) {
        if (userGovs.has(gov)) {
          matchesGovernorate = true;
          const govObj = TUNISIAN_GOVERNORATES.find(g => g.id === gov);
          matchedGovernorateLabels.push(govObj ? govObj.nameFr : gov);
        }
      }
    }
  }

  // 5. Skills and keywords match
  const matchedSkills: string[] = [];
  const userInterestsAndSkills = [
    ...(profile.skills || []),
    ...(profile.professionalInterests || [])
  ].map(s => s.toLowerCase().trim());

  if (userInterestsAndSkills.length > 0 && job.requiredSkills) {
    for (const jobSkill of job.requiredSkills) {
      const lowerJobSkill = jobSkill.toLowerCase();
      const hasMatch = userInterestsAndSkills.some(userSkill => 
        userSkill.length > 2 && (lowerJobSkill.includes(userSkill) || userSkill.includes(lowerJobSkill))
      );
      if (hasMatch) {
        matchedSkills.push(jobSkill);
      }
    }
  }

  // Total count of verified criteria (0 to 5)
  let count = 0;
  if (matchesSection) count += 1;
  if (matchesLevel) count += 1;
  if (matchesCategory) count += 1;
  if (matchesGovernorate) count += 1;
  if (matchedSkills.length > 0) count += 1;

  // An offer is classified as recommended if it matches the academic section or at least 2 key criteria
  const isRecommended = matchesSection || count >= 2;

  return {
    matchesSection,
    matchedSectionLabel,
    matchesLevel,
    matchedLevelLabel,
    matchesCategory,
    matchedCategoryLabel,
    matchesGovernorate,
    matchedGovernorateLabels,
    matchedSkills,
    totalMatchesCount: count,
    isRecommended
  };
};

/**
 * Calculates an internal rank strictly for sorting matching results.
 * This numeric score is purely internal and NOT shown as an arbitrary compatibility percentage to users.
 */
export const calculateInternalMatchingRank = (job: Job, profile: UserProfile | null | undefined): number => {
  if (!profile) return 0;
  const evaluation = evaluateJobMatch(job, profile);

  let rank = 0;
  // Weighting hierarchy based on prompt specification:
  // 1. Academic section (highest priority)
  if (evaluation.matchesSection) rank += 50;
  // 2. Education level
  if (evaluation.matchesLevel) rank += 30;
  // 3. Job category
  if (evaluation.matchesCategory) rank += 20;
  // 4. Preferred governorate
  if (evaluation.matchesGovernorate) rank += 15;
  // 5. Skills / Keywords
  rank += Math.min(evaluation.matchedSkills.length * 5, 15);

  return rank;
};

/**
 * Sorts jobs by matching criteria relevance
 */
export const prioritizeJobsForUser = (jobs: Job[], profile: UserProfile | null | undefined): Job[] => {
  if (!profile) return jobs;

  return [...jobs].sort((a, b) => {
    const rankA = calculateInternalMatchingRank(a, profile);
    const rankB = calculateInternalMatchingRank(b, profile);
    if (rankB !== rankA) {
      return rankB - rankA;
    }
    // Tie-breaker: newest publication date
    return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
  });
};
