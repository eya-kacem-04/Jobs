// ==============================================================================
// TAWDHEEF TN - Core TypeScript Type Definitions
// ==============================================================================

export type AcademicSectionKey =
  | 'computer_science'
  | 'mathematics'
  | 'physics_chemistry'
  | 'life_earth_sciences'
  | 'engineering'
  | 'economics'
  | 'management'
  | 'finance_accounting'
  | 'law'
  | 'literature'
  | 'languages'
  | 'human_social_sciences'
  | 'education_sciences'
  | 'healthcare'
  | 'architecture_design'
  | 'commerce_marketing'
  | 'agriculture'
  | 'other';

export type EducationLevelKey =
  | 'secondary'
  | 'bac'
  | 'bts'
  | 'licence'
  | 'master'
  | 'engineer'
  | 'phd'
  | 'other';

export type ProfessionalCategoryKey =
  | 'teaching'
  | 'public_concours'
  | 'it'
  | 'engineering'
  | 'technician'
  | 'administration'
  | 'finance'
  | 'healthcare'
  | 'sales_marketing'
  | 'hr'
  | 'legal'
  | 'industrial'
  | 'internship'
  | 'other';

export type SectorType = 'public' | 'private' | 'teaching' | 'other';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'civil_service' | 'internship' | 'freelance';

export type JobStatus = 'active' | 'expired' | 'closed' | 'pending_verification';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export type SourceType =
  | 'official_government'
  | 'official_ministry'
  | 'public_competition'
  | 'education_authority'
  | 'company'
  | 'employment_platform'
  | 'api_feed'
  | 'rss_feed'
  | 'manual_verified';

export interface RecruitmentSource {
  id: string;
  name: string;
  url: string;
  sourceType: SourceType;
  active: boolean;
  requiresVerification: boolean;
  lastCheckedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company?: string | null;
  organization?: string | null;
  description: string;
  academicSection: AcademicSectionKey;
  educationLevel: EducationLevelKey;
  professionalCategory: ProfessionalCategoryKey;
  sector: SectorType;
  jobType: JobType;
  governorates: string[];
  location?: string | null;
  requiredSkills: string[];
  vacanciesCount: number;
  publicationDate: string; // ISO or YYYY-MM-DD
  applicationDeadline?: string | null; // ISO or YYYY-MM-DD
  status: JobStatus;
  verificationStatus: VerificationStatus;
  sourceId?: string | null;
  sourceName?: string;
  sourceUrl: string;
  applicationUrl: string;
  importBatchId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  academicSection?: AcademicSectionKey;
  educationLevel?: EducationLevelKey;
  preferredJobCategories: ProfessionalCategoryKey[];
  preferredGovernorates: string[];
  professionalInterests: string[];
  skills: string[];
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    newMatchingJob: boolean;
    deadlineReminder: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  userId: string;
  role: 'admin' | 'moderator' | 'user';
}

export interface Favorite {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  jobId?: string | null;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ImportLog {
  id: string;
  sourceId?: string | null;
  sourceName?: string;
  importType: 'api' | 'rss' | 'json' | 'csv' | 'manual';
  itemsFound: number;
  itemsImported: number;
  duplicatesDetected: number;
  errorsCount: number;
  errorDetails?: any;
  status: 'completed' | 'partial' | 'failed';
  createdAt: string;
}

export interface SearchFilters {
  keyword: string;
  academicSections: AcademicSectionKey[];
  educationLevels: EducationLevelKey[];
  professionalCategories: ProfessionalCategoryKey[];
  sectors: SectorType[];
  governorates: string[];
  jobTypes: JobType[];
  verificationStatus?: VerificationStatus;
  onlyActive: boolean;
  sortBy: 'date' | 'deadline' | 'relevance';
  page: number;
  pageSize: number;
}

/**
 * Transparent Matching Criteria Breakdown
 * Purely factual, transparent, zero arbitrary percentages!
 */
export interface MatchCriteriaResult {
  matchesSection: boolean;
  matchedSectionLabel?: string;
  matchesLevel: boolean;
  matchedLevelLabel?: string;
  matchesCategory: boolean;
  matchedCategoryLabel?: string;
  matchesGovernorate: boolean;
  matchedGovernorateLabels: string[];
  matchedSkills: string[];
  totalMatchesCount: number;
  isRecommended: boolean;
}

export interface Governorate {
  id: string;
  nameFr: string;
  nameAr: string;
  regionFr: string;
  regionAr: string;
}

export interface AcademicSectionOption {
  key: AcademicSectionKey;
  labelFr: string;
  labelAr: string;
  iconName: string;
  descriptionFr: string;
  descriptionAr: string;
}

export interface EducationLevelOption {
  key: EducationLevelKey;
  labelFr: string;
  labelAr: string;
  order: number;
}
