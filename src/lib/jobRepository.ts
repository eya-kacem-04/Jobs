import { Job, RecruitmentSource } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_SEED_JOBS } from '../data/seedJobs';

/**
 * JobRepository
 *
 * - Jobs live in Supabase (table `jobs`).
 * - They are loaded into an in-memory cache so existing pages
 *   can keep reading jobs synchronously.
 * - Writes go to Supabase.
 * - Source relations are stored through `source_id`.
 */

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value?: string | null): boolean =>
    Boolean(value && UUID_RE.test(value));

// Demo jobs are shown only when VITE_SHOW_DEMO_JOBS=true
const SHOW_DEMO = import.meta.env.VITE_SHOW_DEMO_JOBS === 'true';

let cache: Job[] = [];
let initializedWithoutSupabase = false;

export interface RemoteResult {
    ok: boolean;
    error?: string;
}

/**
 * Tell the UI something went wrong.
 * App.tsx can listen to this event and show an error banner.
 */
const reportError = (message: string, details?: unknown) => {
    console.error('[JobRepository]', message, details);

    try {
        window.dispatchEvent(
            new CustomEvent('tawdheef:sync-error', {
                detail: message,
            })
        );
    } catch {
        // Ignore non-browser environments
    }
};

/**
 * Database row (snake_case) -> Job (camelCase)
 */
const rowToJob = (r: any): Job => ({
    id: r.id,
    title: r.title,
    company: r.company,
    organization: r.organization,
    description: r.description,

    academicSection: r.academic_section,
    educationLevel: r.education_level,
    professionalCategory: r.professional_category,

    sector: r.sector,
    jobType: r.job_type,

    governorates: r.governorates ?? [],
    location: r.location,

    requiredSkills: r.required_skills ?? [],
    vacanciesCount: r.vacancies_count ?? 1,

    publicationDate: r.publication_date,
    applicationDeadline: r.application_deadline,

    status: r.status,
    verificationStatus: r.verification_status,

    // Real source relation
    sourceId: r.source_id,

    sourceName: r.source?.name ?? undefined,
    sourceUrl: r.source_url,
    applicationUrl: r.application_url,

    importBatchId: r.import_batch_id,

    createdAt: r.created_at,
    updatedAt: r.updated_at,
});

/**
 * Job (camelCase) -> Database row (snake_case)
 */
const jobToRow = (job: Job) => ({
    id: job.id,

    title: job.title,

    company: job.company || null,
    organization: job.organization || null,

    description: job.description,

    academic_section: job.academicSection,
    education_level: job.educationLevel,
    professional_category: job.professionalCategory,

    sector: job.sector,
    job_type: job.jobType,

    governorates: job.governorates,

    location: job.location || null,

    required_skills: job.requiredSkills || [],

    vacancies_count: job.vacanciesCount || 1,

    publication_date: job.publicationDate,
    application_deadline: job.applicationDeadline || null,

    status: job.status,
    verification_status: job.verificationStatus,

    // Keep the real relation with public.sources
    source_id: job.sourceId || null,

    source_url: job.sourceUrl,
    application_url: job.applicationUrl,

    import_batch_id: job.importBatchId || null,

    updated_at: new Date().toISOString(),
});


/**
 * Job Repository
 */
export const JobRepository = {

    /**
     * Synchronous read from the cache.
     */
    getAll(): Job[] {
        return cache;
    },


    /**
     * Load jobs from Supabase into the cache.
     *
     * Visitors:
     * - only see jobs allowed by Supabase RLS
     *
     * Admins:
     * - can see/manage all jobs allowed by RLS
     */
    async loadJobs(): Promise<void> {

        // Supabase not configured
        if (!isSupabaseConfigured() || !supabase) {

            if (!initializedWithoutSupabase) {

                cache = SHOW_DEMO
                    ? [...INITIAL_SEED_JOBS]
                    : [];

                initializedWithoutSupabase = true;
            }

            return;
        }


        const { data, error } = await supabase
            .from('jobs')
            .select(`
        *,
        source:sources (
            id,
            name,
            url,
            source_type
        )
    `)
            .order('publication_date', {
                ascending: false,
            })
            .limit(1000);


        if (error) {

            reportError(
                `Impossible de charger les offres : ${error.message}`,
                error
            );

            // Keep previous cache
            return;
        }


        const loaded = (data ?? []).map(rowToJob);


        cache = SHOW_DEMO
            ? [...loaded, ...INITIAL_SEED_JOBS]
            : loaded;
    },


    /**
     * Update cache immediately.
     */
    upsertLocal(job: Job): void {

        const index = cache.findIndex(
            (j) => j.id === job.id
        );


        cache =
            index >= 0
                ? cache.map((j, i) =>
                    i === index
                        ? job
                        : j
                )
                : [job, ...cache];
    },


    /**
     * Remove a job from local cache.
     */
    removeLocal(id: string): void {

        cache = cache.filter(
            (j) => j.id !== id
        );
    },


    /**
     * Save jobs to Supabase.
     */
    async saveRemote(
        jobs: Job[],
        options: { silent?: boolean } = {}
    ): Promise<RemoteResult> {

        // Supabase not configured
        if (!isSupabaseConfigured() || !supabase) {
            return {
                ok: true,
            };
        }


        const { error } = await supabase
            .from('jobs')
            .upsert(
                jobs.map(jobToRow),
                {
                    onConflict: 'id',
                }
            );


        if (error) {

            console.error(
                '[JobRepository] save failed',
                error
            );


            if (!options.silent) {

                reportError(
                    `Échec de l'enregistrement dans Supabase : ${error.message}`,
                    error
                );
            }


            return {
                ok: false,
                error: error.message,
            };
        }


        return {
            ok: true,
        };
    },


    /**
     * Delete a job from Supabase.
     */
    async deleteRemote(
        id: string
    ): Promise<RemoteResult> {

        if (!isSupabaseConfigured() || !supabase) {
            return {
                ok: true,
            };
        }


        const {
            data,
            error,
        } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .select('id');


        if (error) {

            reportError(
                `Échec de la suppression dans Supabase : ${error.message}`,
                error
            );


            return {
                ok: false,
                error: error.message,
            };
        }


        if (!data || data.length === 0) {

            const message =
                'Suppression refusée ou offre introuvable (droits administrateur requis).';


            reportError(message);


            return {
                ok: false,
                error: message,
            };
        }


        return {
            ok: true,
        };
    },
};


/**
 * Synchronize recruitment sources with Supabase.
 *
 * Source of truth:
 * OFFICIAL_TUNISIAN_SOURCES
 *
 * Destination:
 * public.sources
 */
export async function syncSourcesToSupabase(
    sources: RecruitmentSource[]
): Promise<boolean> {

    if (!isSupabaseConfigured() || !supabase) {

        console.warn(
            '[JobRepository] Supabase is not configured.'
        );

        return false;
    }


    const rows = sources.map(
        (source) => ({
            id: source.id,

            name: source.name,

            url: source.url,

            source_type: source.sourceType,

            active: source.active,

            requires_verification:
            source.requiresVerification,

            last_checked_at:
                source.lastCheckedAt || null,

            notes:
                source.notes || null,

            created_at:
            source.createdAt,
        })
    );


    const { error } = await supabase
        .from('sources')
        .upsert(
            rows,
            {
                onConflict: 'id',
            }
        );


    if (error) {

        console.error(
            '[JobRepository] Failed to sync recruitment sources:',
            error
        );

        return false;
    }


    console.log(
        `[JobRepository] ${rows.length} recruitment sources synchronized.`
    );


    return true;
}