import { Governorate, AcademicSectionOption, EducationLevelOption, RecruitmentSource } from '../types';

export const TUNISIAN_GOVERNORATES: Governorate[] = [
  // Grand Tunis
  { id: 'Tunis', nameFr: 'Tunis', nameAr: 'تونس', regionFr: 'Grand Tunis', regionAr: 'تونس الكبرى' },
  { id: 'Ariana', nameFr: 'Ariana', nameAr: 'أريانة', regionFr: 'Grand Tunis', regionAr: 'تونس الكبرى' },
  { id: 'Ben Arous', nameFr: 'Ben Arous', nameAr: 'بن عروس', regionFr: 'Grand Tunis', regionAr: 'تونس الكبرى' },
  { id: 'Manouba', nameFr: 'Manouba', nameAr: 'منوبة', regionFr: 'Grand Tunis', regionAr: 'تونس الكبرى' },
  // Nord Est
  { id: 'Nabeul', nameFr: 'Nabeul', nameAr: 'نابل', regionFr: 'Nord-Est', regionAr: 'الشمال الشرقي' },
  { id: 'Zaghouan', nameFr: 'Zaghouan', nameAr: 'زغوان', regionFr: 'Nord-Est', regionAr: 'الشمال الشرقي' },
  { id: 'Bizerte', nameFr: 'Bizerte', nameAr: 'بنزرت', regionFr: 'Nord-Est', regionAr: 'الشمال الشرقي' },
  // Nord Ouest
  { id: 'Beja', nameFr: 'Béja', nameAr: 'باجة', regionFr: 'Nord-Ouest', regionAr: 'الشمال الغربي' },
  { id: 'Jendouba', nameFr: 'Jendouba', nameAr: 'جندوبة', regionFr: 'Nord-Ouest', regionAr: 'الشمال الغربي' },
  { id: 'Le Kef', nameFr: 'Le Kef', nameAr: 'الكاف', regionFr: 'Nord-Ouest', regionAr: 'الشمال الغربي' },
  { id: 'Siliana', nameFr: 'Siliana', nameAr: 'سليانة', regionFr: 'Nord-Ouest', regionAr: 'الشمال الغربي' },
  // Centre Est
  { id: 'Sousse', nameFr: 'Sousse', nameAr: 'سوسة', regionFr: 'Centre-Est', regionAr: 'الوسط الشرقي' },
  { id: 'Monastir', nameFr: 'Monastir', nameAr: 'المنستير', regionFr: 'Centre-Est', regionAr: 'الوسط الشرقي' },
  { id: 'Mahdia', nameFr: 'Mahdia', nameAr: 'المهدية', regionFr: 'Centre-Est', regionAr: 'الوسط الشرقي' },
  { id: 'Sfax', nameFr: 'Sfax', nameAr: 'صفاقس', regionFr: 'Centre-Est', regionAr: 'الوسط الشرقي' },
  // Centre Ouest
  { id: 'Kairouan', nameFr: 'Kairouan', nameAr: 'القيروان', regionFr: 'Centre-Ouest', regionAr: 'الوسط الغربي' },
  { id: 'Kasserine', nameFr: 'Kasserine', nameAr: 'القصرين', regionFr: 'Centre-Ouest', regionAr: 'الوسط الغربي' },
  { id: 'Sidi Bouzid', nameFr: 'Sidi Bouzid', nameAr: 'سيدي بوزيد', regionFr: 'Centre-Ouest', regionAr: 'الوسط الغربي' },
  // Sud Ouest
  { id: 'Gafsa', nameFr: 'Gafsa', nameAr: 'قفصة', regionFr: 'Sud-Ouest', regionAr: 'الجنوب الغربي' },
  { id: 'Tozeur', nameFr: 'Tozeur', nameAr: 'توزر', regionFr: 'Sud-Ouest', regionAr: 'الجنوب الغربي' },
  { id: 'Kebili', nameFr: 'Kébili', nameAr: 'قبلي', regionFr: 'Sud-Ouest', regionAr: 'الجنوب الغربي' },
  // Sud Est
  { id: 'Gabes', nameFr: 'Gabès', nameAr: 'قابس', regionFr: 'Sud-Est', regionAr: 'الجنوب الشرقي' },
  { id: 'Medenine', nameFr: 'Médenine', nameAr: 'مدنين', regionFr: 'Sud-Est', regionAr: 'الجنوب الشرقي' },
  { id: 'Tataouine', nameFr: 'Tataouine', nameAr: 'تطاوين', regionFr: 'Sud-Est', regionAr: 'الجنوب الشرقي' },
];

export const ACADEMIC_SECTIONS: AcademicSectionOption[] = [
  {
    key: 'computer_science',
    labelFr: 'Informatique & Technologies',
    labelAr: 'الإعلامية وتكنولوجيات الاتصال',
    iconName: 'Laptop',
    descriptionFr: 'Génie logiciel, réseaux, cybersécurité, IA, systèmes embarqués',
    descriptionAr: 'هندسة البرمجيات، الشبكات، الأمن السيبراني، الذكاء الاصطناعي'
  },
  {
    key: 'mathematics',
    labelFr: 'Mathématiques',
    labelAr: 'الرياضيات',
    iconName: 'Binary',
    descriptionFr: 'Mathématiques fondamentales, appliquées, statistiques, actuariat',
    descriptionAr: 'الرياضيات الأساسية والتطبيقية، الإحصاء، العلوم الاكتوارية'
  },
  {
    key: 'physics_chemistry',
    labelFr: 'Physique & Chimie',
    labelAr: 'العلوم الفيزيائية والكيميائية',
    iconName: 'Atom',
    descriptionFr: 'Physique des matériaux, chimie industrielle, énergétique',
    descriptionAr: 'فيزياء المواد، الكيمياء الصناعية، الطاقات المتجددة'
  },
  {
    key: 'life_earth_sciences',
    labelFr: 'Sciences de la Vie & Terre (SVT)',
    labelAr: 'علوم الحياة والأرض',
    iconName: 'Dna',
    descriptionFr: 'Biologie, géologie, biotechnologie, environnement',
    descriptionAr: 'علم الأحياء، الجيولوجيا، التكنولوجيا الحيوية، البيئة'
  },
  {
    key: 'engineering',
    labelFr: 'Génie & Sciences de l\'Ingénieur',
    labelAr: 'الهندسة والعلوم التطبيقية',
    iconName: 'Cpu',
    descriptionFr: 'Génie civil, électrique, mécanique, mécatronique, textile',
    descriptionAr: 'الهندسة المدنية، الكهربائية، الميكانيكية، الميكاترونيك'
  },
  {
    key: 'economics',
    labelFr: 'Sciences Économiques',
    labelAr: 'العلوم الاقتصادية',
    iconName: 'TrendingUp',
    descriptionFr: 'Économie monétaire, bancaire, développement, commerce international',
    descriptionAr: 'الاقتصاد المالي والبنكي، التنمية، التجارة الدولية'
  },
  {
    key: 'management',
    labelFr: 'Gestion & Management',
    labelAr: 'علوم التصرف وإدارة الأعمال',
    iconName: 'Briefcase',
    descriptionFr: 'Management d\'entreprise, gestion de projets, logistique, RH',
    descriptionAr: 'إدارة الأعمال، تسيير المشاريع، الخدمات اللوجستية، الموارد البشرية'
  },
  {
    key: 'finance_accounting',
    labelFr: 'Finance & Comptabilité',
    labelAr: 'المالية والمحاسبة',
    iconName: 'DollarSign',
    descriptionFr: 'Comptabilité financière, audit, contrôle de gestion, fiscalité',
    descriptionAr: 'المحاسبة المالية، التدقيق، مراقبة التصرف، الجباية'
  },
  {
    key: 'law',
    labelFr: 'Droit & Sciences Juridiques',
    labelAr: 'الحقوق والعلوم القانونية والسياسية',
    iconName: 'Scale',
    descriptionFr: 'Droit public, droit privé, droit des affaires, droit fiscal',
    descriptionAr: 'القانون العام، القانون الخاص، قانون الأعمال، القانون الجبائي'
  },
  {
    key: 'literature',
    labelFr: 'Lettres & Philosophie',
    labelAr: 'الآداب والفلسفة والعلوم الإنسانية',
    iconName: 'BookOpen',
    descriptionFr: 'Lettres arabes, françaises, philosophie, pensée islamique',
    descriptionAr: 'الآداب العربية، الفرنسية، الفلسفة، الفكر الإسلامي'
  },
  {
    key: 'languages',
    labelFr: 'Langues Vivantes & Traduction',
    labelAr: 'اللغات الحية والترجمة',
    iconName: 'Languages',
    descriptionFr: 'Anglais, Italien, Allemand, Espagnol, traduction professionnelle',
    descriptionAr: 'الإنجليزية، الإيطالية، الألمانية، الإسبانية، الترجمة'
  },
  {
    key: 'human_social_sciences',
    labelFr: 'Sciences Humaines & Sociales',
    labelAr: 'العلوم الإنسانية والاجتماعية',
    iconName: 'Users',
    descriptionFr: 'Histoire, géographie, sociologie, psychologie, travail social',
    descriptionAr: 'التاريخ، الجغرافيا، علم الاجتماع، علم النفس، العمل الاجتماعي'
  },
  {
    key: 'education_sciences',
    labelFr: 'Sciences de l\'Éducation & Pédagogie',
    labelAr: 'علوم التربية والبيداغوجيا',
    iconName: 'GraduationCap',
    descriptionFr: 'Didactique, psychopédagogie, enseignement primaire et préscolaire',
    descriptionAr: 'الديداكتيك، علم النفس التربوي، التعليم الابتدائي وما قبل المدرسي'
  },
  {
    key: 'healthcare',
    labelFr: 'Santé & Médecine',
    labelAr: 'الصحة والعلوم الطبية وشبه الطبية',
    iconName: 'HeartPulse',
    descriptionFr: 'Médecine, pharmacie, médecine dentaire, soins infirmiers, anesthésie',
    descriptionAr: 'الطب، الصيدلة، طب الأسنان، التمريض، التبنيج والعلاج الطبيعي'
  },
  {
    key: 'architecture_design',
    labelFr: 'Architecture, Arts & Design',
    labelAr: 'الهندسة المعمارية والفنون والتصميم',
    iconName: 'PenTool',
    descriptionFr: 'Architecture, urbanisme, design d\'espace, arts plastiques, audiovisuel',
    descriptionAr: 'الهندسة المعمارية، التهيئة العمرانية، التصميم، الفنون التشكيلية'
  },
  {
    key: 'commerce_marketing',
    labelFr: 'Commerce & Marketing',
    labelAr: 'التجارة والتسويق والاتصال',
    iconName: 'ShoppingBag',
    descriptionFr: 'Marketing digital, communication d\'entreprise, techniques de vente',
    descriptionAr: 'التسويق الرقمي، الاتصال المؤسساتي، تقنيات البيع والتوزيع'
  },
  {
    key: 'agriculture',
    labelFr: 'Agriculture & Agroalimentaire',
    labelAr: 'الفلاحة والصناعات الغذائية والموارد الطبيعية',
    iconName: 'Wheat',
    descriptionFr: 'Agronomie, génie rural, technologie alimentaire, halieutique',
    descriptionAr: 'العلوم الفلاحية، الهندسة الريفية، الصناعات الغذائية، الصيد البحري'
  },
  {
    key: 'other',
    labelFr: 'Autres Spécialités & Formations',
    labelAr: 'تخصصات وتكوين مهني آخر',
    iconName: 'Layers',
    descriptionFr: 'Formations professionnelles, disciplines pluridisciplinaires',
    descriptionAr: 'التكوين المهني، مجالات متعددة الاختصاصات'
  }
];

export const EDUCATION_LEVELS: EducationLevelOption[] = [
  { key: 'secondary', labelFr: 'Enseignement Secondaire (Niveau Bac)', labelAr: 'المستوى الثانوي (دون بكالوريا أو سنة نهائية)', order: 1 },
  { key: 'bac', labelFr: 'Baccalauréat', labelAr: 'شهادة البكالوريا', order: 2 },
  { key: 'bts', labelFr: 'Brevet de Technicien Supérieur (BTS)', labelAr: 'شهادة مؤهل التقني السامي (BTS / BTP)', order: 3 },
  { key: 'licence', labelFr: 'Licence (Bac+3 / LMD / Maîtrise)', labelAr: 'الإجازة الوطنية (نظام أمد / الأستاذية)', order: 4 },
  { key: 'master', labelFr: 'Master (Bac+5 / Mastère Professionnel ou Recherche)', labelAr: 'الماجستير (مهني أو بحثي)', order: 5 },
  { key: 'engineer', labelFr: 'Diplôme National d\'Ingénieur (Bac+5)', labelAr: 'الشهادة الوطنية لمهندس', order: 6 },
  { key: 'phd', labelFr: 'Doctorat / Diplôme de Spécialité Médicale (Bac+8)', labelAr: 'الدكتوراه / شهادة الاختصاص الطبي', order: 7 },
  { key: 'other', labelFr: 'Autre diplôme / Formation certifiée', labelAr: 'شهادة أخرى / تكوين مهني معتمد', order: 8 }
];

export const OFFICIAL_TUNISIAN_SOURCES: RecruitmentSource[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Portail National des Concours de la Fonction Publique',
    url: 'https://www.concours.gov.tn',
    sourceType: 'official_government',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Portail unifié des avis et concours de recrutement dans les ministères et établissements publics tunisiens.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Ministère de l\'Éducation (Portail Edunet)',
    url: 'https://www.edunet.tn',
    sourceType: 'official_ministry',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Direction générale des concours et recrutements d\'enseignants (primaire, secondaire, techniciens pédagogiques).',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Ministère de l\'Enseignement Supérieur et de la Recherche Scientifique',
    url: 'https://www.mesrs.tn',
    sourceType: 'official_ministry',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Recrutement des enseignants-chercheurs, assistants universitaires et personnel administratif universitaire.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    name: 'Agence Nationale pour l\'Emploi et le Travail Indépendant (ANETI)',
    url: 'https://www.aneti.tn',
    sourceType: 'employment_platform',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Réseau national des bureaux d\'emploi (BETI) et offres vérifiées du secteur privé tunisien.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    name: 'Centre National de l\'Informatique (CNI)',
    url: 'https://www.cni.tn',
    sourceType: 'public_competition',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Avis officiels de recrutement en ingénierie informatique pour l\'administration tunisienne.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    name: 'Société Tunisienne de l\'Électricité et du Gaz (STEG)',
    url: 'https://www.steg.com.tn',
    sourceType: 'company',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Concours de recrutement d\'ingénieurs, techniciens et agents de maîtrise.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a7777777-7777-7777-7777-777777777777',
    name: 'Ministère de la Santé Publique',
    url: 'https://www.santetunisie.rns.tn',
    sourceType: 'official_ministry',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Recrutement des professionnels de santé hospitalo-sanitaires en Tunisie.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'a8888888-8888-8888-8888-888888888888',
    name: 'Ministère de la Justice',
    url: 'https://www.e-justice.tn',
    sourceType: 'official_ministry',
    active: true,
    requiresVerification: false,
    lastCheckedAt: new Date().toISOString(),
    notes: 'Concours de l\'Institut Supérieur de la Magistrature et des greffiers des tribunaux tunisiens.',
    createdAt: '2026-01-01T00:00:00Z'
  }
];
