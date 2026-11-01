import { createClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const IMPORT_SECRET = Deno.env.get("IMPORT_SECRET");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

const FEED_URL = "https://www.tunisietravail.net/feed/";

// NEW UUID — this source does not exist yet in OFFICIAL_TUNISIAN_SOURCES.
// Add a matching entry to constants/tunisiaData.ts with this exact id
// before running for real, the same way SOURCE_ID in import-recruitment
// matches OFFICIAL_TUNISIAN_SOURCES[0].
const SOURCE_ID = "a3333333-3333-3333-3333-333333333333";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function decodeEntities(text: string): string {
    return text
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;|&apos;|&rsquo;|&lsquo;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&ndash;/gi, "–")
        .replace(/&mdash;/gi, "—")
        .replace(/\s+/g, " ")
        .trim();
}

function extractTag(block: string, tag: string): string | null {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    if (!m) return null;
    let text = m[1];
    const cdata = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    if (cdata) text = cdata[1];
    return decodeEntities(text.trim());
}

/** WordPress guid looks like ".../?p=107407" — that numeric id is our external_id. */
function extractExternalId(guid: string | null, link: string | null): string | null {
    const source = guid || link || "";
    const m = source.match(/[?&]p=(\d+)/);
    if (m) return m[1];
    const m2 = source.match(/-(\d+)\/?$/);
    return m2 ? m2[1] : null;
}

interface ParsedTitle {
    organization: string | null;
    position: string;
}

/** Best-effort split of "X recrute Y" / "Concours X pour le recrutement de Y" titles. */
function parseTitle(rawTitle: string): ParsedTitle {
    const title = rawTitle.trim();

    let m = title.match(/^(.+?)\s+recrute\s+(.+)$/i);
    if (m) return { organization: m[1].trim(), position: m[2].trim() };

    m = title.match(/^Concours\s+(.+?)\s+pour\s+le\s+recrutement\s+d[e']\s*(.+)$/i);
    if (m) return { organization: m[1].trim(), position: m[2].trim() };

    m = title.match(/^(.+?)\s+pour\s+le\s+recrutement\s+d[e']\s*(.+)$/i);
    if (m) return { organization: m[1].trim(), position: m[2].trim() };

    return { organization: null, position: title };
}

/**
 * French-language academic section guesser. Values MUST stay keys from
 * ACADEMIC_SECTIONS, same set inferAcademicSection() in import-recruitment
 * targets — just matched against French keywords since this feed's titles
 * are French, unlike concours.gov.tn's Arabic table.
 */
function inferAcademicSectionFr(text: string): string {
    const t = text.toLowerCase();

    if (/informatique|développeur|developpeur|data|réseau|reseau/.test(t)) return "computer_science";
    if (/architecte|architecture/.test(t)) return "architecture_design";
    if (/ingénieur|ingenieur|génie|genie|technicien/.test(t)) return "engineering";
    if (/comptable|comptabilité|comptabilite|finance|financier|audit|banque/.test(t)) return "finance_accounting";
    if (/gestion|gestionnaire|administratif|administration|cadre/.test(t)) return "management";
    if (/juriste|droit|avocat|juridique/.test(t)) return "law";
    if (/médecin|medecin|infirmier|pharmacien|santé|sante|hopital|hôpital/.test(t)) return "healthcare";
    if (/enseignant|professeur|instituteur|formateur|scolarité|scolarite/.test(t)) return "education_sciences";
    if (/agricole|agriculture|vétérinaire|veterinaire|forestier/.test(t)) return "agriculture";

    return "other";
}

function inferEducationLevelFr(text: string): string {
    const t = text.toLowerCase();
    if (/ingénieur|ingenieur/.test(t)) return "engineer";
    if (/licence|bac\s*\+\s*3/.test(t)) return "licence";
    if (/doctorat|post-doc|postdoc|phd/.test(t)) return "other"; // no dedicated key confirmed — verify against EDUCATION_LEVELS
    return "other";
}

// jobs.sector allows: 'public' | 'private' | 'teaching' | 'other'
// Most tunisietravail.net listings are private companies ("X recrute Y"),
// so private is the default — public/teaching only apply when the text
// gives a real signal (ministry, hospital, national office, university...).
function inferSectorFr(text: string): "public" | "private" | "teaching" | "other" {
    const t = text.toLowerCase();

    const teachingSignals = /universit|faculté|faculte|institut supérieur|institut superieur|lycée|lycee|école|ecole|enseignant|professeur|scolarité|scolarite/;
    if (teachingSignals.test(t)) return "teaching";

    const publicSignals = /ministère|ministere|fonction publique|\bchu\b|hopital|hôpital|office national|agence nationale|institut national|établissement public|etablissement public|commune de|municipalité|municipalite|gouvernorat|direction régionale|direction generale|\bonas\b|\bsteg\b|\bsonede\b|tunisie telecom|radio tunisienne|télévision tunisienne|television tunisienne/;
    if (publicSignals.test(t)) return "public";

    return "private";
}

// jobs.job_type allows: 'full_time' | 'part_time' | 'contract' | 'civil_service' | 'internship' | 'freelance'
function inferJobTypeFr(text: string, sector: string): string {
    const t = text.toLowerCase();

    if (/\bstage\b|stagiaire/.test(t)) return "internship";
    if (/freelance|indépendant|independant/.test(t)) return "freelance";
    if (/temps partiel|mi-temps/.test(t)) return "part_time";
    if (/\bcdd\b|contrat déterminé|contrat determine/.test(t)) return "contract";
    if (sector === "public" && /concours|fonction publique/.test(t)) return "civil_service";

    return "full_time";
}

// ---------------------------------------------------------------------------
// Feed parsing
// ---------------------------------------------------------------------------
interface ParsedItem {
    externalId: string;
    title: string;
    organization: string | null;
    position: string;
    description: string | null;
    link: string;
    publicationDate: string | null; // YYYY-MM-DD
}

function parseFeed(xml: string): ParsedItem[] {
    const items: ParsedItem[] = [];
    const blocks = xml.split(/<item>/i).slice(1);

    for (const raw of blocks) {
        const block = raw.split(/<\/item>/i)[0];

        const rawTitle = extractTag(block, "title");
        if (!rawTitle) continue;

        // Already-closed listings are excluded, not imported-then-hidden.
        if (/^\s*Clôturé\s*:/i.test(rawTitle)) continue;

        const link = extractTag(block, "link");
        const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
        const guid = guidMatch ? decodeEntities(guidMatch[1].trim()) : null;
        const pubDateRaw = extractTag(block, "pubDate");
        const description = extractTag(block, "description");

        const externalId = extractExternalId(guid, link);
        if (!externalId || !link) continue; // can't dedupe or link back reliably, skip

        const { organization, position } = parseTitle(rawTitle);
        const publicationDate = pubDateRaw
            ? new Date(pubDateRaw).toISOString().slice(0, 10)
            : null;

        items.push({
            externalId,
            title: rawTitle,
            organization,
            position,
            description,
            link,
            publicationDate,
        });
    }

    return items;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
    const provided = req.headers.get("x-import-secret");
    if (!IMPORT_SECRET || provided !== IMPORT_SECRET) {
        return json({ success: false, error: "Unauthorized" }, 401);
    }

    const dryRun = new URL(req.url).searchParams.get("dry") === "1";

    try {
        console.log(`Starting tunisietravail.net import (dryRun=${dryRun})...`);

        const response = await fetch(FEED_URL, {
            headers: {
                "User-Agent": "TawdheefTN-RecruitmentImporter/1.0",
                Accept: "application/rss+xml,text/xml",
            },
            signal: AbortSignal.timeout(20000),
        });

        if (!response.ok) {
            throw new Error(`Source returned HTTP ${response.status}`);
        }

        const xml = await response.text();
        const items = parseFeed(xml);
        console.log(`Downloaded ${xml.length} chars, found ${items.length} listings`);

        if (items.length === 0) {
            return json({
                success: false,
                message: "No listings detected. The feed structure may have changed.",
            });
        }

        const today = new Date().toISOString().slice(0, 10);

        const rows = items.map((item) => {
            const orgText = item.organization ?? "";
            const combinedText = `${item.title} ${item.description ?? ""}`;

            return {
                external_id: item.externalId,

                title: item.position.slice(0, 255),
                company: null,
                organization: orgText ? orgText.slice(0, 255) : null,

                description:
                    (item.description ? `${item.description}\n\n` : "") +
                    `Source : tunisietravail.net — annonce automatique, à vérifier avant publication.\n` +
                    `Titre original : ${item.title}`,

                academic_section: inferAcademicSectionFr(combinedText),
                education_level: inferEducationLevelFr(combinedText),
                professional_category: (() => {
                    const s = inferSectorFr(combinedText);
                    if (s === "public") return "public_concours";
                    if (s === "teaching") return "teaching_position";
                    return "private_recruitment";
                })(),

                sector: inferSectorFr(combinedText),
                job_type: inferJobTypeFr(combinedText, inferSectorFr(combinedText)),

                governorates: ["all_tunisia"],
                location: null,

                required_skills: [] as string[],
                vacancies_count: 1,

                publication_date: item.publicationDate ?? today,
                application_deadline: null, // feed has no deadline field

                status: "active", // "Clôturé :" items are already filtered out above
                verification_status: "pending", // admin reviews before this goes public

                source_id: SOURCE_ID,
                source_url: item.link,
                application_url: item.link,
            };
        });

        if (dryRun) {
            return json({ success: true, dryRun: true, found: rows.length, preview: rows });
        }

        const { error: sourceError } = await supabase.from("sources").upsert(
            {
                id: SOURCE_ID,
                name: "Tunisie Travail",
                url: "https://www.tunisietravail.net",
                source_type: "rss_feed",
                active: true,
                requires_verification: true,
                last_checked_at: new Date().toISOString(),
            },
            { onConflict: "id" },
        );
        if (sourceError) throw new Error(`Source upsert failed: ${sourceError.message}`);

        const { data, error } = await supabase
            .from("jobs")
            .upsert(rows, { onConflict: "source_id,external_id", ignoreDuplicates: true })
            .select("id");

        if (error) throw new Error(`Jobs upsert failed: ${error.message}`);

        const inserted = data?.length ?? 0;

        return json({
            success: true,
            source: "tunisietravail.net",
            found: rows.length,
            inserted,
            skipped: rows.length - inserted,
        });
    } catch (error) {
        console.error("Importer error:", error);
        return json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            500,
        );
    }
});