# Tawdheef TN (توظيف تونس) 🇹🇳
### Portail National de Recrutement & Concours Publics en Tunisie

*Plateforme multi-sources d'agrégation, de mise en correspondance transparente et de suivi des opportunités de recrutement.*

---

## 🌟 Présentation du Projet

**Tawdheef TN** est une plateforme web moderne et intuitive dédiée à l'emploi et aux concours en Tunisie. Elle vise à résoudre le problème de la dispersion des offres d'emploi et des avis officiels de recrutement en regroupant les opportunités sur une seule plateforme.

La plateforme couvre trois grands domaines :

1. **Les Concours de la Fonction Publique** (*مناظرات الوظيفة العمومية*) : Ministères, directions générales, établissements et entreprises publics (CNI, STEG, Santé, Finances, Justice, etc.).
2. **Les Recrutements de l'Enseignement & de l'Éducation** (*انتداب أساتذة ومعلمي قطاع التربية والتعليم*) : Enseignement primaire, secondaire, supérieur, formation professionnelle et établissements privés.
3. **Les Opportunités du Secteur Privé** : Ingénierie, technologies de l'information, gestion, finance, comptabilité, droit, santé, industrie et agroalimentaire.

La plateforme prend en charge les **24 gouvernorats tunisiens** ainsi que différentes filières d'études universitaires et professionnelles.

---

## 🎯 Fonctionnalités Principales

### 1. Correspondance transparente entre candidats et offres

La plateforme propose un système de recommandation basé sur des critères concrets et vérifiables, sans afficher de pourcentages arbitraires.

La correspondance repose sur cinq critères :

1. **Filière académique / Spécialisation** : Mathématiques, Informatique, Économie, Droit, etc.
2. **Niveau d'études requis** : Secondaire, Bac, BTS, Licence, Master, Ingénieur, Doctorat.
3. **Catégorie de poste souhaitée** : Enseignement, Ingénierie, Administration, Finance, etc.
4. **Gouvernorats préférés** : Sélection parmi les 24 gouvernorats ou offres à portée nationale.
5. **Compétences et mots-clés déclarés**.

Des indicateurs transparents expliquent pourquoi une offre est recommandée au candidat, par exemple :

- ✓ Correspondance avec la filière académique.
- ✓ Niveau d'études requis vérifié.
- ✓ Opportunité disponible dans le gouvernorat souhaité.

Le classement des offres privilégie celles qui répondent au plus grand nombre de critères du candidat.

### 2. Agrégation multi-sources et déduplication

La plateforme est conçue pour centraliser les opportunités de recrutement provenant de différentes sources.

Les sources et connecteurs prévus ou pris en charge comprennent :

- Portail National des Concours : [concours.gov.tn](https://concours.gov.tn/)
- Ministère de l'Éducation : [edunet.tn](https://www.edunet.tn/)
- Ministère de l'Enseignement Supérieur : [mesrs.tn](https://www.mesrs.tn/)
- ANETI : [aneti.tn](https://www.aneti.tn/)
- Flux RSS et formats structurés JSON et CSV.

**Mécanisme de déduplication :**
- Vérification par URL exacte de candidature.
- Détection des doublons à partir d'une empreinte normalisée : Titre + Organisme/Entreprise + Période de publication.

**Gestion des dates limites :**
- Les offres dont la date limite de candidature est dépassée peuvent être automatiquement marquées comme expirées selon les mécanismes configurés.

### 3. Intégrité des données et transparence

Tawdheef TN vise à garantir la fiabilité des informations publiées :

- Conservation de la source originale de chaque offre.
- Référence vers l'URL officielle de candidature.
- Redirection des candidats vers les pages officielles des organismes.
- Distinction entre les offres vérifiées et les offres en attente de validation.

### 4. Interface bilingue et support RTL (Français / العربية)

- Basculement entre le français et l'arabe.
- Prise en charge des directions LTR et RTL.
- Adaptation des alignements, mises en page et éléments de navigation.
- Utilisation de la police Cairo pour une meilleure lisibilité de l'arabe.
- Terminologie administrative et universitaire tunisienne.

### 5. Mode sombre et mode clair

- Interface avec thème sombre et thème clair.
- Détection de la préférence système.
- Conservation locale du thème sélectionné.

### 6. Gestion des utilisateurs et des favoris

- Authentification des utilisateurs.
- Gestion des profils candidats.
- Gestion des rôles et des autorisations.
- Ajout et consultation des offres favorites.
- Protection des données personnelles grâce aux politiques de sécurité RLS.

---

## 🛠️ Stack Technologique

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### Internationalisation
- LanguageContext
- Support natif RTL / LTR
- Français et arabe

### Base de données et Backend
- PostgreSQL
- Supabase
- Supabase Auth
- Row Level Security (RLS)
- Fonctions backend Supabase Edge Functions

### Stockage et mode hors ligne
- Persistance locale via `src/lib/storage.ts`
- Mode démonstration avec stockage local.

### Tests
- Vitest
- Tests unitaires portant sur la correspondance, l'ingestion, la déduplication et l'internationalisation.

---

## 🚀 Démarrage Rapide

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js
- npm ou pnpm
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/eya-kacem-04/Jobs.git
cd Jobs
```

### 2. Installer les dépendances

Avec npm :

```bash
npm install
```

Ou avec pnpm :

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

Remplacez les valeurs par les informations de votre propre projet Supabase.

**Important :** Ne publiez jamais votre fichier `.env` ou vos clés privées sur GitHub.

### 4. Lancer le serveur de développement

Avec npm :

```bash
npm run dev
```

Ou avec pnpm :

```bash
pnpm run dev
```

L'application sera accessible à l'adresse :

```text
http://localhost:5173
```

### 5. Exécuter les tests

```bash
npm run test
```

Ou :

```bash
pnpm test
```

### 6. Générer le build de production

Avec npm :

```bash
npm run build
```

Ou avec pnpm :

```bash
pnpm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

---

## 🔑 Comptes de Démonstration

La plateforme propose différents rôles permettant de découvrir ses fonctionnalités :

- **Administrateur :** Gestion des utilisateurs, validation des offres, importation et administration de la plateforme.
- **Candidat :** Consultation des offres, recherche personnalisée, gestion du profil et des favoris.

Des comptes de démonstration peuvent être configurés dans un environnement de test. Pour des raisons de sécurité, les identifiants et mots de passe ne sont pas publiés dans ce dépôt.

---

## 🗄️ Schéma PostgreSQL (Supabase)

Le dossier `supabase/` contient les scripts et configurations nécessaires à la gestion de la base de données.

Le fichier `supabase/schema.sql` définit notamment :

- `jobs` : Offres d'emploi et opportunités de recrutement.
- `sources` : Sources des offres.
- `profiles` : Profils des utilisateurs.
- `user_roles` : Rôles et autorisations.
- `favorites` : Offres favorites des candidats.
- `notifications` : Notifications des utilisateurs.
- `import_logs` : Historique des opérations d'importation.

### Sécurité et intégrité

Le schéma prévoit notamment :

- Des politiques Row Level Security (RLS) pour contrôler l'accès aux données.
- La protection des profils et des favoris selon l'utilisateur authentifié.
- La visibilité publique des offres répondant aux conditions de publication définies.
- Des mécanismes de gestion de l'expiration des offres.
- La création automatique des profils lors de l'inscription via Supabase Auth.

### Configuration d'un projet Supabase distant

1. Créer un projet sur [Supabase](https://supabase.com/).
2. Ouvrir l'éditeur SQL de Supabase.
3. Exécuter le script `supabase/schema.sql`.
4. Exécuter ensuite `supabase/seed.sql` pour initialiser les données prévues.
5. Configurer les variables d'environnement dans le fichier `.env`.

---

## 🌐 Déploiement

Le frontend peut être déployé sur différentes plateformes d'hébergement :

### Vercel
- Connecter le dépôt GitHub.
- Commande de build : `npm run build`.
- Dossier de sortie : `dist`.
- Configurer les variables d'environnement Supabase.

### Netlify
- Connecter le dépôt GitHub ou déployer le dossier `dist`.
- Commande de build : `npm run build`.
- Configurer les variables d'environnement nécessaires.

### Cloudflare Pages
- Connecter le dépôt GitHub.
- Commande de build : `npm run build`.
- Dossier de sortie : `dist`.
- Configurer les variables d'environnement.

### Backend et base de données

**Supabase** assure les services backend :

- Base de données PostgreSQL.
- Authentification.
- Politiques de sécurité RLS.
- Fonctions backend Edge Functions.

---

## 🔒 Sécurité

Quelques bonnes pratiques sont appliquées au projet :

- Les fichiers `.env` sont exclus du dépôt Git grâce au `.gitignore`.
- Les clés privées et les secrets ne doivent jamais être publiés.
- Les accès aux données sont contrôlés par les politiques RLS.
- Les informations personnelles des utilisateurs doivent rester protégées.
- Les comptes de démonstration doivent être utilisés uniquement dans un environnement de test.

---

## 📌 Objectif du Projet

L'objectif de **Tawdheef TN** est de faciliter l'accès aux opportunités professionnelles en Tunisie en centralisant les offres d'emploi et les concours, tout en proposant une expérience de recherche personnalisée, transparente et accessible à tous.

La plateforme ambitionne de devenir un point de référence pour les candidats à la recherche d'un emploi ou d'une opportunité de recrutement dans les secteurs public et privé.

---

## 👩‍💻 Auteur

**Eya Kacem**

GitHub : [@eya-kacem-04](https://github.com/eya-kacem-04)

---

*© Tawdheef TN – Portail de Recrutement & Concours en Tunisie 🇹🇳*