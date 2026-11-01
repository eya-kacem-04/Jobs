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

// Real page (verified). "التفاصيل" buttons are ASP.NET postbacks, so there is
// no per-concours URL: we always link to the official list page.
const PORTAL_URL = "https://concours.gov.tn/P1/index5.aspx";

// Same id as OFFICIAL_TUNISIAN_SOURCES[0] in tunisiaData.ts
const SOURCE_ID = "a1111111-1111-1111-1111-111111111111";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function cleanText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim();
}

/** Unify Arabic letter variants so matching is reliable. */
function normalizeArabic(text: string): string {
    return text
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // diacritics + tatweel
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ")
        .trim();
}

function hasAny(text: string, words: string[]): boolean {
    return words.some((w) => text.includes(normalizeArabic(w)));
}

/** Accepts YYYY-MM-DD (official format) or DD/MM/YYYY. Returns YYYY-MM-DD. */
function parseDate(value: string): string | null {
    const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

    const dmy = value.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if (dmy) {
        return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Governorates (ids MUST match TUNISIAN_GOVERNORATES[].id in the app)
// ---------------------------------------------------------------------------
const GOVERNORATES: Array<[string, string]> = (
    [
        ["سيدي بوزيد", "Sidi Bouzid"],
        ["بن عروس", "Ben Arous"],
        ["أريانة", "Ariana"],
        ["منوبة", "Manouba"],
        ["نابل", "Nabeul"],
        ["زغوان", "Zaghouan"],
        ["بنزرت", "Bizerte"],
        ["باجة", "Beja"],
        ["جندوبة", "Jendouba"],
        ["الكاف", "Le Kef"],
        ["سليانة", "Siliana"],
        ["سوسة", "Sousse"],
        ["المنستير", "Monastir"],
        ["المهدية", "Mahdia"],
        ["صفاقس", "Sfax"],
        ["القيروان", "Kairouan"],
        ["القصرين", "Kasserine"],
        ["قفصة", "Gafsa"],
        ["توزر", "Tozeur"],
        ["قبلي", "Kebili"],
        ["قابس", "Gabes"],
        ["مدنين", "Medenine"],
        ["تطاوين", "Tataouine"],
        ["تونس", "Tunis"], // last: most generic
    ] as Array<[string, string]>
).map(([ar, id]) => [normalizeArabic(ar), id]);

// Municipalities ("بلدية X") that do not contain their governorate's name.
// Only matched as the exact words "بلدية <name>". Incomplete on purpose:
// anything unknown falls back to ['all_tunisia'].
const MUNICIPALITIES: Array<[string, string]> = (
    [
        // Sousse
        ["القلعة الكبرى", "Sousse"], ["القلعة الصغرى", "Sousse"], ["مساكن", "Sousse"],
        ["أكودة", "Sousse"], ["النفيضة", "Sousse"], ["حمام سوسة", "Sousse"],
        ["زاوية سوسة", "Sousse"], ["قصيبة سوسة", "Sousse"],
        // Manouba
        ["وادي الليل", "Manouba"], ["المرناقية", "Manouba"],
        // Nabeul
        ["الحمامات", "Nabeul"], ["قليبية", "Nabeul"], ["قربة", "Nabeul"],
        ["منزل تميم", "Nabeul"], ["تازركة", "Nabeul"], ["قرنبالية", "Nabeul"],
        // Ben Arous
        ["حمام الأنف", "Ben Arous"], ["المروج", "Ben Arous"], ["رادس", "Ben Arous"],
        ["مقرين", "Ben Arous"], ["المحمدية", "Ben Arous"], ["فوشانة", "Ben Arous"],
        ["حمام الشط", "Ben Arous"], ["مرناق", "Ben Arous"], ["الزهراء", "Ben Arous"],
        ["بومهل البساتين", "Ben Arous"],
        // Tunis
        ["المرسى", "Tunis"], ["قرطاج", "Tunis"], ["سيدي بوسعيد", "Tunis"],
        ["حلق الوادي", "Tunis"], ["باردو", "Tunis"],
        // Ariana
        ["رواد", "Ariana"], ["سكرة", "Ariana"], ["سيدي ثابت", "Ariana"],
        ["المنيهلة", "Ariana"], ["قلعة الأندلس", "Ariana"],
        // Medenine / Kebili / Gabes
        ["جربة", "Medenine"], ["جرجيس", "Medenine"], ["بن قردان", "Medenine"],
        ["دوز", "Kebili"], ["الحامة", "Gabes"], ["مطماطة", "Gabes"],
        // Bizerte / Jendouba / Gafsa
        ["منزل بورقيبة", "Bizerte"], ["ماطر", "Bizerte"], ["منزل جميل", "Bizerte"],
        ["منزل عبد الرحمان", "Bizerte"], ["طبرقة", "Jendouba"], ["المتلوي", "Gafsa"],
        // Monastir
        ["قصر هلال", "Monastir"], ["قصرهلال", "Monastir"], ["المكنين", "Monastir"],
        ["جمال", "Monastir"], ["طبلبة", "Monastir"],
        // Kairouan / Mahdia / Sfax
        ["الوسلاتية", "Kairouan"], ["السبيخة", "Kairouan"], ["الشراردة", "Kairouan"],
        ["بوحجلة", "Kairouan"], ["قصور الساف", "Mahdia"], ["الجم", "Mahdia"],
        ["جبنيانة", "Sfax"], ["الصخيرة", "Sfax"], ["المحرس", "Sfax"],
        ["ساقية الزيت", "Sfax"], ["ساقية الدائر", "Sfax"],
        // Beja / Zaghouan / Siliana
        ["تستور", "Beja"], ["قبلاط", "Beja"], ["تبرسق", "Beja"], ["مجاز الباب", "Beja"],
        ["الفحص", "Zaghouan"], ["الكريب", "Siliana"], ["مكثر", "Siliana"],
        ["الروحية", "Siliana"],
    ] as Array<[string, string]>
).map(([ar, id]) => [normalizeArabic(ar), id]);

function inferGovernorates(organization: string): string[] {
    // Drop every word containing "تونسي" (التونسية, التونسيين...) so
    // "الشركة التونسية للسكر" is NOT mistaken for the Tunis governorate.
    const text = normalizeArabic(organization).replace(/\S*تونسي\S*/g, " ");

    if (text.includes("بلدية")) {
        const padded = `${text} `;
        for (const [name, id] of MUNICIPALITIES) {
            if (padded.includes(`بلدية ${name} `)) return [id];
        }
    }

    for (const [name, id] of GOVERNORATES) {
        if (text.includes(name)) return [id];
    }

    return ["all_tunisia"];
}

// ---------------------------------------------------------------------------
// Section / level (values MUST be keys from ACADEMIC_SECTIONS / EDUCATION_LEVELS)
// ---------------------------------------------------------------------------
function inferAcademicSection(position: string): string {
    const t = normalizeArabic(position);

    if (hasAny(t, ["معلوميات", "اعلامية", "informatique"])) return "computer_science";
    if (hasAny(t, ["معماري"])) return "architecture_design";
    if (hasAny(t, ["مهندس", "هندسة"])) return "engineering";
    if (hasAny(t, ["محاسب", "مالية"])) return "finance_accounting";
    if (hasAny(t, ["متصرف", "تصرف"])) return "management";
    if (hasAny(t, ["قانون", "حقوق", "محامي", "قاضي"])) return "law";
    if (hasAny(t, ["طبيب", "ممرض", "صيدلي", "تمريض", "صحة"])) return "healthcare";
    if (hasAny(t, ["أستاذ", "معلم", "مدرس", "تدريس"])) return "education_sciences";
    if (hasAny(t, ["فلاح", "بيطري", "غابات"])) return "agriculture";

    return "other";
}

function inferEducationLevel(position: string): string {
    const t = normalizeArabic(position);

    if (hasAny(t, ["مهندس"])) return "engineer";
    if (hasAny(t, ["متصرف"])) return "licence";

    // Unknown: the exact requirement is only in the official details page.
    return "other";
}

// ---------------------------------------------------------------------------
// Parsing the official table
// Columns: عدد المناظرة | المرجع | الهيكل | الخطة | عدد الخطط | غلق الترشح | ...
// ---------------------------------------------------------------------------
interface ParsedConcours {
    externalId: string;
    reference: string;
    organization: string;
    position: string;
    vacancies: number;
    deadline: string | null;
}

function parseConcoursPage(html: string): ParsedConcours[] {
    const results = new Map<string, ParsedConcours>();
    const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];

    for (const row of rows) {
        const cells = row.match(/<td[\s\S]*?<\/td>/gi) ?? [];
        if (cells.length < 6) continue;

        const values = cells.map(cleanText);
        const [externalId, reference, organization, position, vacanciesText, deadlineText] = values;

        // The real concours number is numeric: this skips headers, pager rows, filters.
        if (!/^\d+$/.test(externalId)) continue;
        if (!organization || !position) continue;

        const vacancies = Number.parseInt(vacanciesText.replace(/[^\d]/g, ""), 10) || 1;

        results.set(externalId, {
            externalId,
            reference,
            organization,
            position,
            vacancies,
            deadline: parseDate(deadlineText),
        });
    }

    return [...results.values()];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
    // Fail closed: the function URL is reachable with the public anon key,
    // so we require our own secret.
    const provided = req.headers.get("x-import-secret");
    if (!IMPORT_SECRET || provided !== IMPORT_SECRET) {
        return json({ success: false, error: "Unauthorized" }, 401);
    }

    const dryRun = new URL(req.url).searchParams.get("dry") === "1";

    try {
        console.log(`Starting concours.gov.tn import (dryRun=${dryRun})...`);

        const response = await fetch(PORTAL_URL, {
            headers: {
                "User-Agent": "TawdheefTN-RecruitmentImporter/1.0",
                Accept: "text/html,application/xhtml+xml",
            },
            signal: AbortSignal.timeout(20000),
        });

        if (!response.ok) {
            throw new Error(`Source returned HTTP ${response.status}`);
        }

        const html = await response.text();
        const concours = parseConcoursPage(html);
        console.log(`Downloaded ${html.length} chars, found ${concours.length} concours`);

        if (concours.length === 0) {
            return json({
                success: false,
                message: "No concours detected. The source HTML structure may have changed.",
            });
        }

        const today = new Date().toISOString().slice(0, 10);

        const rows = concours.map((c) => {
            const governorates = inferGovernorates(c.organization);
            const expired = c.deadline !== null && c.deadline < today;

            return {
                external_id: c.externalId,

                title: c.position.slice(0, 255),
                company: null,
                organization: c.organization.slice(0, 255),

                description:
                    `${c.reference}\n\n` +
                    `رقم المناظرة بالبوابة الوطنية: ${c.externalId}. ` +
                    `الاختصاص وشروط الترشح: راجع تفاصيل الإعلان على البوابة الرسمية.\n` +
                    `Concours n°${c.externalId} — spécialité et conditions : voir le détail sur le portail officiel.`,

                academic_section: inferAcademicSection(c.position),
                education_level: inferEducationLevel(c.position),
                professional_category: "public_concours",

                sector: "public",
                job_type: "civil_service",

                governorates,
                location: governorates[0] === "all_tunisia" ? null : governorates[0],

                required_skills: [] as string[],
                vacancies_count: c.vacancies,

                publication_date: today,
                application_deadline: c.deadline,

                status: expired ? "expired" : "active",
                verification_status: "verified",

                source_id: SOURCE_ID,
                source_url: PORTAL_URL,
                application_url: PORTAL_URL,
            };
        });

        if (dryRun) {
            return json({ success: true, dryRun: true, found: rows.length, preview: rows });
        }

        // jobs.source_id has a foreign key: make sure the source row exists.
        const { error: sourceError } = await supabase.from("sources").upsert(
            {
                id: SOURCE_ID,
                name: "Portail National des Concours de la Fonction Publique",
                url: "https://www.concours.gov.tn",
                source_type: "official_government",
                active: true,
                requires_verification: false,
                last_checked_at: new Date().toISOString(),
            },
            { onConflict: "id" },
        );
        if (sourceError) throw new Error(`Source upsert failed: ${sourceError.message}`);

        // Existing concours are left untouched (keeps admin edits); only new ones are inserted.
        const { data, error } = await supabase
            .from("jobs")
            .upsert(rows, { onConflict: "source_id,external_id", ignoreDuplicates: true })
            .select("id");

        if (error) throw new Error(`Jobs upsert failed: ${error.message}`);

        const inserted = data?.length ?? 0;

        return json({
            success: true,
            source: "concours.gov.tn",
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