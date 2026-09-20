import React, { useState } from 'react';
import { Job, RecruitmentSource, ImportLog, AcademicSectionKey, EducationLevelKey, SectorType, JobType, JobStatus, VerificationStatus } from '../types';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';
import { LocalStore } from '../lib/storage';
import { JobService } from '../services/jobService';
import { runImportBatch, parseRecruitmentCSV, RawImportRecord } from '../services/importService';
import { 
  ShieldAlert, Plus, Edit, Trash2, CheckCircle2, Clock, 
  Upload, Database, RefreshCw, AlertCircle, ExternalLink, Filter, Check, X
} from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES, OFFICIAL_TUNISIAN_SOURCES } from '../constants/tunisiaData';

interface AdminViewProps {
  onSelectJob: (job: Job) => void;
  onNavigate: (view: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onSelectJob, onNavigate }) => {
  const { t, language, isRTL } = useLanguage();
  const { isAdmin, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'jobs' | 'sources' | 'import' | 'logs'>('jobs');
  const [jobsList, setJobsList] = useState<Job[]>(() => LocalStore.getJobs());
  const [sourcesList, setSourcesList] = useState<RecruitmentSource[]>(() => LocalStore.getSources());
  const [importLogs, setImportLogs] = useState<ImportLog[]>(() => LocalStore.getImportLogs());

  // Search & Filter within Admin
  const [searchKw, setSearchKw] = useState('');
  const [filterSector, setFilterSector] = useState<string>('all');

  // Job Modal (Create / Edit)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Import Runner state
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sourcesList[0]?.id || '');
  const [rawPayload, setRawPayload] = useState<string>('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResultSummary, setImportResultSummary] = useState<any>(null);

  // Source Modal state
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceType, setNewSourceType] = useState<any>('official_ministry');

  if (!isAdmin) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-md mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Accès Réservé aux Administrateurs
        </h2>
        <p className="text-sm text-slate-500">
          Cette section nécessite des privilèges d'administration.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const refreshState = () => {
    setJobsList(LocalStore.getJobs());
    setSourcesList(LocalStore.getSources());
    setImportLogs(LocalStore.getImportLogs());
  };

  // Delete Job
  const handleDeleteJob = (id: string) => {
    if (window.confirm(t('admin_delete_confirm'))) {
      JobService.deleteJob(id);
      refreshState();
    }
  };

  // Toggle Verification status
  const handleToggleVerify = (job: Job) => {
    const updated: Job = {
      ...job,
      verificationStatus: job.verificationStatus === 'verified' ? 'pending' : 'verified'
    };
    JobService.saveJob(updated);
    refreshState();
  };

  // Toggle Expiration status
  const handleToggleStatus = (job: Job) => {
    const nextStatus: JobStatus = job.status === 'active' ? 'expired' : 'active';
    const updated: Job = {
      ...job,
      status: nextStatus
    };
    JobService.saveJob(updated);
    refreshState();
  };

  // Run Import Batch
  const handleExecuteImport = async () => {
    if (!rawPayload.trim()) return;
    setImportLoading(true);
    setImportResultSummary(null);

    try {
      let records: RawImportRecord[] = [];
      if (importType === 'json') {
        records = JSON.parse(rawPayload);
        if (!Array.isArray(records)) {
          records = [records];
        }
      } else {
        records = parseRecruitmentCSV(rawPayload);
      }

      const sourceObj = sourcesList.find(s => s.id === selectedSourceId);
      const res = await runImportBatch(
        records,
        selectedSourceId,
        sourceObj?.name || 'Importation Directe',
        importType
      );

      setImportResultSummary(res);
      refreshState();
    } catch (err: any) {
      alert('Erreur lors du traitement : ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Pre-fill sample payload for demonstration
  const handleFillSample = () => {
    if (importType === 'json') {
      const sampleJSON = [
        {
          "title": "Concours de recrutement de Techniciens Supérieurs en Informatique - Ministère des Technologies",
          "organization": "Ministère des Technologies de la Communication",
          "description": "Le Ministère recrute des techniciens supérieurs en informatique et réseaux pour appuyer les centres régionaux de télécommunications. Titulaires du BTS ou Licence en Informatique.",
          "academicSection": "computer_science",
          "educationLevel": "bts",
          "professionalCategory": "technician",
          "sector": "public",
          "governorates": ["Tunis", "Sfax", "Sousse", "Gabes"],
          "requiredSkills": ["Maintenance réseau", "Support utilisateur", "Linux", "Réseaux IP"],
          "vacanciesCount": 15,
          "applicationDeadline": new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
          "sourceUrl": "https://www.concours.gov.tn/details-concours.php?id=mincom-tech-2026",
          "applicationUrl": "https://www.concours.gov.tn/candidature?id=mincom-2026"
        }
      ];
      setRawPayload(JSON.stringify(sampleJSON, null, 2));
    } else {
      const sampleCSV = `title,organization,description,academicSection,educationLevel,sector,governorates,vacanciesCount,applicationDeadline,applicationUrl
"Professeur d'Anglais Contractuel - Centre de Langues","Centre Culturel Universitaire","Recrutement d'enseignants d'anglais pour cours intensifs et préparation aux certifications internationales","languages","licence","teaching","Tunis;Nabeul",4,"2026-10-15","https://www.edunet.tn/offres/anglais-2026"`;
      setRawPayload(sampleCSV);
    }
  };

  // Filter jobs in table
  const filteredJobs = jobsList.filter(j => {
    if (searchKw) {
      const kw = searchKw.toLowerCase();
      const m = j.title.toLowerCase().includes(kw) || (j.organization || j.company || '').toLowerCase().includes(kw);
      if (!m) return false;
    }
    if (filterSector !== 'all' && j.sector !== filterSector) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>{language === 'ar' ? 'فضاء المشرف الإداري' : 'Portail Administrateur'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('admin_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('admin_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshState}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingJob(null);
              setIsJobModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-tunisia-red hover:bg-tunisia-darkRed text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin_add_job')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{t('admin_tab_jobs', { count: jobsList.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>{t('admin_tab_sources', { count: sourcesList.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'import'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{t('admin_tab_import')}</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('admin_tab_logs')} ({importLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: JOBS MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث في العروض...' : 'Filtrer par titre ou organisme...'}
              className="w-full sm:w-72 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none"
            />

            <div className="flex items-center gap-2">
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              >
                <option value="all">Tous les secteurs</option>
                <option value="public">Fonction Publique</option>
                <option value="teaching">Enseignement</option>
                <option value="private">Privé</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <tr>
                  <th className="p-3 text-start">{t('admin_job_title')}</th>
                  <th className="p-3 text-start">Secteur / Filière</th>
                  <th className="p-3 text-start">Postes</th>
                  <th className="p-3 text-start">Limite</th>
                  <th className="p-3 text-start">Statut</th>
                  <th className="p-3 text-end">{t('admin_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3">
                      <div 
                        onClick={() => onSelectJob(job)}
                        className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-tunisia-red truncate max-w-xs"
                      >
                        {job.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {job.organization || job.company} • {job.governorates.join(', ')}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold block">{job.sector}</span>
                      <span className="text-[11px] text-slate-500">{job.academicSection}</span>
                    </td>

                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {job.vacanciesCount}
                    </td>

                    <td className="p-3">
                      <span className="text-[11px] block">{job.applicationDeadline || 'Ouvert'}</span>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                            job.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {job.status === 'active' ? 'Actif' : 'Expiré'}
                        </button>

                        <button
                          onClick={() => handleToggleVerify(job)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium w-fit ${
                            job.verificationStatus === 'verified'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {job.verificationStatus === 'verified' ? 'Vérifié' : 'En attente'}
                        </button>
                      </div>
                    </td>

                    <td className="p-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setIsJobModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCES MANAGEMENT */}
      {activeTab === 'sources' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sources et Portails de Recrutement Enregistrés
            </h3>
            <button
              onClick={() => setIsSourceModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une source</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sourcesList.map(src => (
              <div key={src.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {src.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Actif
                  </span>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                >
                  <span className="truncate max-w-xs">{src.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <p className="text-xs text-slate-500">{src.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT & DEDUPLICATION RUNNER */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('import_studio_title')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('import_studio_desc')}
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('import_source_select')}
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none"
              >
                {sourcesList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Format d'ingestion
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportType('json')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    importType === 'json' ? 'bg-tunisia-red text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t('import_type_json')}
                </button>
                <button
                  type="button"
                  onClick={() => setImportType('csv')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    importType === 'csv' ? 'bg-tunisia-red text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t('import_type_csv')}
                </button>
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="ms-auto text-xs text-brand-600 hover:underline font-semibold"
                >
                  Insérer modèle de test
                </button>
              </div>
            </div>
          </div>

          {/* Payload textarea */}
          <div>
            <textarea
              rows={8}
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
              placeholder={t('import_placeholder')}
              className="w-full p-4 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={handleExecuteImport}
            disabled={importLoading || !rawPayload.trim()}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{importLoading ? 'Traitement en cours...' : t('import_btn_run')}</span>
          </button>

          {/* Results Summary Box */}
          {importResultSummary && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Rapport d'exécution d'ingestion</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Total examinés</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {importResultSummary.log.itemsFound}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-300 block">Importés</span>
                  <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
                    {importResultSummary.importedJobs.length}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-amber-700 dark:text-amber-300 block">Doublons évités</span>
                  <span className="text-base font-black text-amber-800 dark:text-amber-200">
                    {importResultSummary.duplicates.length}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                  <span className="text-red-700 dark:text-red-300 block">Erreurs</span>
                  <span className="text-base font-black text-red-800 dark:text-red-200">
                    {importResultSummary.errors.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMPORT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Journal d'Audit des Ingestions
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 text-start">Date</th>
                  <th className="p-3 text-start">Source</th>
                  <th className="p-3 text-start">Format</th>
                  <th className="p-3 text-start">Importés</th>
                  <th className="p-3 text-start">Doublons</th>
                  <th className="p-3 text-start">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {importLogs.map(log => (
                  <tr key={log.id}>
                    <td className="p-3 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.sourceName || 'Direct'}
                    </td>
                    <td className="p-3 uppercase text-slate-500">{log.importType}</td>
                    <td className="p-3 font-bold text-emerald-600">+{log.itemsImported}</td>
                    <td className="p-3 font-bold text-amber-600">{log.duplicatesDetected}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOB CREATION / EDIT MODAL */}
      {isJobModalOpen && (
        <JobFormModal
          job={editingJob}
          sources={sourcesList}
          onClose={() => setIsJobModalOpen(false)}
          onSave={(savedJob) => {
            JobService.saveJob(savedJob);
            setIsJobModalOpen(false);
            refreshState();
          }}
        />
      )}
    </div>
  );
};

// Modal for manual job creation & editing
interface JobFormModalProps {
  job: Job | null;
  sources: RecruitmentSource[];
  onClose: () => void;
  onSave: (job: Job) => void;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ job, sources, onClose, onSave }) => {
  const [title, setTitle] = useState(job?.title || '');
  const [org, setOrg] = useState(job?.organization || '');
  const [comp, setComp] = useState(job?.company || '');
  const [description, setDescription] = useState(job?.description || '');
  const [academicSection, setAcademicSection] = useState<AcademicSectionKey>(job?.academicSection || 'computer_science');
  const [educationLevel, setEducationLevel] = useState<EducationLevelKey>(job?.educationLevel || 'licence');
  const [sector, setSector] = useState<SectorType>(job?.sector || 'public');
  const [vacancies, setVacancies] = useState<number>(job?.vacanciesCount || 1);
  const [deadline, setDeadline] = useState(job?.applicationDeadline || '');
  const [govs, setGovs] = useState<string[]>(job?.governorates || ['Tunis']);
  const [sourceUrl, setSourceUrl] = useState(job?.sourceUrl || 'https://www.concours.gov.tn');
  const [appUrl, setAppUrl] = useState(job?.applicationUrl || 'https://www.concours.gov.tn');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prepared: Job = {
      id: job?.id || 'job_' + Date.now(),
      title,
      organization: org.trim() || null,
      company: comp.trim() || null,
      description,
      academicSection,
      educationLevel,
      professionalCategory: sector === 'teaching' ? 'teaching' : (sector === 'public' ? 'public_concours' : 'it'),
      sector,
      jobType: sector === 'public' ? 'civil_service' : 'full_time',
      governorates: govs,
      vacanciesCount: Number(vacancies),
      publicationDate: job?.publicationDate || new Date().toISOString().split('T')[0],
      applicationDeadline: deadline || null,
      status: job?.status || 'active',
      verificationStatus: 'verified',
      requiredSkills: job?.requiredSkills || [],
      sourceUrl,
      applicationUrl: appUrl,
      createdAt: job?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(prepared);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {job ? 'Modifier l\'opportunité' : 'Ajouter un recrutement'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold mb-1">Titre de l'avis *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Organisme Public (si concours)</label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Ex: Ministère de l'Éducation"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Entreprise (si privé)</label>
              <input
                type="text"
                value={comp}
                onChange={(e) => setComp(e.target.value)}
                placeholder="Ex: Société Novatech"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Secteur</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="public">Fonction Publique</option>
                <option value="teaching">Enseignement</option>
                <option value="private">Privé</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Filière</label>
              <select
                value={academicSection}
                onChange={(e) => setAcademicSection(e.target.value as AcademicSectionKey)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                {ACADEMIC_SECTIONS.map(s => (
                  <option key={s.key} value={s.key}>{s.labelFr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Niveau d'études</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevelKey)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                {EDUCATION_LEVELS.map(l => (
                  <option key={l.key} value={l.key}>{l.labelFr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Nombre de postes</label>
              <input
                type="number"
                min={1}
                value={vacancies}
                onChange={(e) => setVacancies(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Date limite de candidature</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Description et conditions *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Lien de la source originale *</label>
              <input
                type="url"
                required
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Lien officiel pour postuler *</label>
              <input
                type="url"
                required
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-tunisia-red text-white font-bold"
            >
              Enregistrer l'offre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
