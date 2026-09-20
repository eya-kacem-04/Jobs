# Tawdheef TN (توظيف تونس) 🇹🇳
### Portail National de Recrutement & Concours Publics en Tunisie
*Plateforme multi-sources d'agrégation, de mise en correspondance transparente et de suivi des recrutements*

---

## 🌟 Présentation du Projet

**Tawdheef TN** est une plateforme web moderne et intuitive dédiée à l'emploi et aux concours en Tunisie. Elle résout la dispersion des offres d'emploi et des avis officiels de recrutement en regroupant en un seul lieu vérifié :
1. **Les Concours de la Fonction Publique** (*مناظرات الوظيفة العمومية*) : Ministères, directions générales, établissements et entreprises publics (CNI, STEG, Santé, Finances, Justice...).
2. **Les Recrutements de l'Enseignement & de l'Éducation** (*انتداب أساتذة ومعلمي قطاع التربية والتعليم*) : Enseignement primaire (instituteurs), secondaire (professeurs), supérieur (assistants & maîtres-assistants), formation professionnelle et établissements privés homologués.
3. **Les Opportunités du Secteur Privé** : Ingénierie, technologies de l'information, gestion, finance, comptabilité, droit, santé, industrie et agroalimentaire.

Couvre l'ensemble des **24 gouvernorats tunisiens** et toutes les filières d'études universitaires et professionnelles.

---

## 🎯 Points Clés & Conformité aux Exigences

### 1. Logique de Correspondance Factualisée (Zéro Score Arbitraire)
- **Aucun pourcentage fictif ou trompeur** n'est affiché aux candidats (conformément aux directives).
- La recommandation est factuelle et transparente, basée sur **5 piliers concrets** :
  1. **Filière académique / Spécialisation** (Mathématiques, Informatique, Économie, Droit, etc.)
  2. **Niveau d'études requis** (Secondaire, Bac, BTS, Licence, Master, Ingénieur, Doctorat)
  3. **Catégorie de poste souhaitée** (Enseignement, Ingénierie, Administration, etc.)
  4. **Gouvernorats préférés** (sélection parmi les 24 gouvernorats ou offre nationale)
  5. **Compétences et mots-clés déclarés**
- Des badges transparents indiquent à l'utilisateur exactement **pourquoi** une opportunité lui est recommandée (ex: `✓ Correspond à votre filière (Mathématiques)`, `✓ Niveau requis vérifié (Master)`, `✓ Dans votre gouvernorat (Sousse)`).
- Le tri interne priorise les offres répondant au plus grand nombre de critères de l'utilisateur.

### 2. Architecture Multi-Sources & Déduplication
- Conçue comme un agrégateur multi-sources sans saisie manuelle obligatoire.
- Connecteurs prévus pour :
  - Portail National des Concours (`concours.gov.tn`)
  - Ministère de l'Éducation (`edunet.tn`)
  - Ministère de l'Enseignement Supérieur (`mesrs.tn`)
  - ANETI (`aneti.tn`)
  - Flux RSS, formats structurés JSON et CSV
- **Moteur de déduplication** :
  - Vérification par URL exacte de candidature
  - Détection heuristique par empreinte normalisée `(Titre + Organisme/Entreprise + Période de publication)`
- **Péremption automatique** : Dès qu'une date limite de candidature est dépassée, le statut bascule automatiquement en `expired`.

### 3. Intégrité des Données & Transparence
- Aucune offre, entreprise ou date limite inventée.
- Chaque offre conserve sa **source originale officielle** et son **URL officielle de candidature**.
- Les boutons « Postuler » redirigent directement vers la page officielle de l'organisme.

### 4. Bilinguisme Intégral & Support RTL (Français / العربية)
- Basculement instantané entre le Français et l'Arabe.
- Support RTL complet (`dir="rtl"`) avec inversion des mises en page, alignements, tiroirs et typographie adaptée (police *Cairo*).
- Terminologie administrative et universitaire tunisienne authentique.

### 5. Mode Sombre / Mode Clair
- Thème sombre et clair soignés avec détection automatique de préférence système et persistance locale.

---

## 🛠️ Stack Technologique

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Internationalisation** : LanguageContext dynamique avec support RTL/LTR natif
- **Base de Données & Backend** : PostgreSQL / Supabase
  - Schéma complet avec Row Level Security (RLS) dans `supabase/schema.sql`
  - Données initiales et sources officielles dans `supabase/seed.sql`
  - Mode hors-ligne / démonstration instantané avec persistance locale dans `src/lib/storage.ts`
- **Tests** : Vitest (12 tests unitaires validant la correspondance transparente, l'ingestion, la déduplication et l'i18n)

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
pnpm install
# ou
npm install
```

### 2. Lancement en mode développement
```bash
pnpm run dev
# ou
npm run dev
```
L'application est accessible sur `http://localhost:5173`.

### 3. Lancement des tests automatisés
```bash
pnpm test
```

### 4. Build de production
```bash
pnpm run build
```
Les fichiers statiques optimisés sont générés dans le dossier `dist/`.

---

## 🔑 Comptes de Démonstration Inclus

| Rôle | Email | Mot de passe | Profil & Spécialité |
|---|---|---|---|
| **Administrateur** | `admin@tawdheef.tn` | `admin123` | Accès complet au studio admin, importateur et validation |
| **Candidat Enseignement** | `anis.math@tawdheef.tn` | `anis123` | Master en Mathématiques, Sousse, Enseignement |
| **Candidate Ingénierie** | `yasmine.dev@tawdheef.tn` | `yasmine123` | Diplôme National d'Ingénieur en Informatique, Tunis, IT & Dev |

---

## 🗄️ Schéma PostgreSQL (Supabase)

Le fichier `supabase/schema.sql` contient :
- Tables : `jobs`, `sources`, `profiles`, `user_roles`, `favorites`, `notifications`, `import_logs`
- Politiques RLS assurant que les offres actives et vérifiées sont publiques, tandis que les profils et favoris sont protégés par utilisateur
- Triggers d'expiration automatique des offres dont la date limite est échue
- Triggers de création automatique de profil lors de l'inscription via Supabase Auth

Pour connecter un projet Supabase distant :
1. Créez un projet sur [supabase.com](https://supabase.com).
2. Exécutez le script `supabase/schema.sql` dans l'éditeur SQL de Supabase, puis `supabase/seed.sql`.
3. Renseignez dans votre fichier `.env` :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon
   ```

---

## 🌐 Déploiement Public en Production

Le projet est 100% prêt pour un déploiement public immédiat sur toute plateforme statique ou cloud :
- **Vercel** : Connectez le dépôt Git, commande de build `npm run build`, dossier de sortie `dist`.
- **Netlify** : Glissez-déposez le dossier `dist` ou connectez votre dépôt.
- **Cloudflare Pages** : Build command `npm run build`, output directory `dist`.
- **Supabase Hosting** : Prêt pour héberger le frontend et le backend.
