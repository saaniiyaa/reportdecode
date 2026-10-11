'use client';

import { useState, useCallback } from 'react';
import { MOCK_PATIENT } from '@/lib/mock-data';
import {
  SourceReference,
  TimelineEvent,
  RedFlag,
  ExtractedMedication,
  PatientRecord,
} from '@/types/clinical';
import ChiefComplaintCard from '@/components/doctor-view/ChiefComplaintCard';
import RedFlagAlertBar from '@/components/doctor-view/RedFlagAlertBar';
import ChronologicalTimeline from '@/components/doctor-view/ChronologicalTimeline';
import SourceInspectorModal from '@/components/doctor-view/SourceInspectorModal';
import {
  Activity,
  FileText,
  Clock,
  Printer,
  Copy,
  Check,
  User,
  Shield,
  Pill,
  FlaskConical,
  Heart,
  ExternalLink,
  UploadCloud,
  RefreshCw,
  Eye,
  AlertTriangle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [patient, setPatient] = useState<PatientRecord>(MOCK_PATIENT);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'patient_intake'>('cockpit');

  // Source Inspector Modal State
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<RedFlag | null>(null);
  const [allContextSources, setAllContextSources] = useState<SourceReference[]>([]);

  // Feedback states
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Upload state (Patient Intake tab)
  const [isUploading, setIsUploading] = useState(false);

  // Open Inspector from Timeline
  const handleSelectTimelineSource = useCallback(
    (source: SourceReference, event?: TimelineEvent) => {
      setSelectedSource(source);
      setSelectedEvent(event || null);
      setSelectedFlag(null);
      setAllContextSources([source]);
      setInspectorOpen(true);
    },
    []
  );

  // Open Inspector from Red Flag Alert
  const handleSelectFlag = useCallback(
    (flag: RedFlag) => {
      if (flag.sources && flag.sources.length > 0) {
        setSelectedSource(flag.sources[0]);
        setSelectedEvent(null);
        setSelectedFlag(flag);
        setAllContextSources(flag.sources);
        setInspectorOpen(true);
      }
    },
    []
  );

  // Open Inspector from Medication
  const handleSelectMedicationSource = useCallback((med: ExtractedMedication) => {
    setSelectedSource(med.source);
    setSelectedEvent(null);
    setSelectedFlag(null);
    setAllContextSources([med.source]);
    setInspectorOpen(true);
  }, []);

  // Print 60-second summary
  const handlePrint = () => {
    window.print();
  };

  // Copy clinical brief
  const handleCopyBrief = () => {
    const brief = `THE TWO-MINUTE DOCTOR — CLINICAL INTAKE SUMMARY
Patient: ${patient.demographics.name} (${patient.demographics.age}Y/${patient.demographics.gender}, ${patient.demographics.blood_group})
Reg ID: ${patient.demographics.registration_id} | OPD Token: #14

CHIEF COMPLAINT:
${patient.intake.chief_complaint} (Duration: ${patient.intake.complaint_duration}, Severity: ${patient.intake.severity})

CRITICAL SAFETY FLAGS:
${patient.red_flags.map(f => `• [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join('\n')}

ACTIVE MEDICATIONS:
${patient.medications
  .filter(m => m.is_active)
  .map(m => `• ${m.name} ${m.dosage} (${m.frequency}) — Prescribed: ${m.prescribed_date}`)
  .join('\n')}

KEY LAB PARAMETERS:
${patient.labs.map(l => `• ${l.name}: ${l.value} ${l.unit} [Ref: ${l.reference_range}] - ${l.status}`).join('\n')}

DISCLAIMER: Non-diagnostic pre-consultation engine. Every extracted datum verified against source documents.`;

    navigator.clipboard.writeText(brief);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Simulated upload for testing intake mode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setActiveTab('cockpit');
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b101d] text-slate-900 dark:text-slate-100 antialiased font-sans pb-16 selection:bg-blue-600 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          STICKY TOP COMMAND BAR: Demographics, Scan Target & Fast Actions
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & App Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100">
                  The Two-Minute Doctor
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  High-Density OPD Cockpit
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Rapid Pre-Consultation Summary & Provenance Engine
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('cockpit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cockpit'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Cockpit (60s Scan)</span>
            </button>
            <button
              onClick={() => setActiveTab('patient_intake')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'patient_intake'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Patient Intake Kiosk</span>
            </button>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              title="Copy structured clinical summary to clipboard"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copiedSummary ? 'Copied' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              title="Print OPD summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print OPD Slip</span>
            </button>
          </div>
        </div>

        {/* Patient Demographics Strip */}
        <div className="bg-slate-100/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[11px]">
                  #14
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {patient.demographics.name}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({patient.demographics.age}Y / {patient.demographics.gender} • Blood: {patient.demographics.blood_group})
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <span>Reg ID: {patient.demographics.registration_id}</span>
                <span>•</span>
                <span>Contact: {patient.demographics.contact}</span>
              </div>
            </div>

            {/* Target 60s Reading Time Indicator */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <Clock className="w-3 h-3 text-emerald-600" />
                Est. Scan: ~{patient.reading_time_seconds}s (Target: &lt;60s)
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {patient.documents.length} verified documents
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN BODY
          ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'cockpit' ? (
          <div className="space-y-6">
            {/* 1. CRITICAL SAFETY ALERTS BAR (Top priority) */}
            <section aria-label="Critical safety red flags">
              <RedFlagAlertBar flags={patient.red_flags} onFlagClick={handleSelectFlag} />
            </section>

            {/* 2. CHIEF COMPLAINT + VITALS / CRITICAL LABS (Glanceable 2-Column Grid) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (7 cols): Chief Complaint Card */}
              <div className="lg:col-span-7">
                <ChiefComplaintCard intake={patient.intake} />
              </div>

              {/* Right Column (5 cols): Current Vitals & Lab Alerts Glance */}
              <div className="lg:col-span-5 space-y-4">
                {/* Vitals Snapshot */}
                <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                        <Heart className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        Current Vitals & Key Biomarkers
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">20-Sep-2024</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-center">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">
                        Blood Pressure
                      </span>
                      <span className="text-base font-black text-amber-900 dark:text-amber-100">
                        148/92
                      </span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-semibold">
                        Stage 1 HTN
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-center">
                      <span className="text-[10px] text-red-700 dark:text-red-300 font-bold block">
                        Creatinine
                      </span>
                      <span className="text-base font-black text-red-900 dark:text-red-100">
                        1.8
                      </span>
                      <span className="text-[9px] text-red-600 dark:text-red-400 block font-semibold">
                        Elevated (0.7-1.3)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-center">
                      <span className="text-[10px] text-red-700 dark:text-red-300 font-bold block">
                        eGFR
                      </span>
                      <span className="text-base font-black text-red-900 dark:text-red-100">
                        48
                      </span>
                      <span className="text-[9px] text-red-600 dark:text-red-400 block font-semibold">
                        Stage 3a (&gt;60)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                        Heart Rate
                      </span>
                      <span className="text-base font-black text-slate-800 dark:text-slate-100">
                        82 bpm
                      </span>
                      <span className="text-[9px] text-emerald-600 font-semibold block">Normal</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                        SpO2
                      </span>
                      <span className="text-base font-black text-slate-800 dark:text-slate-100">
                        97%
                      </span>
                      <span className="text-[9px] text-emerald-600 font-semibold block">Normal</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-center">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">
                        HbA1c
                      </span>
                      <span className="text-base font-black text-amber-900 dark:text-amber-100">
                        7.8%
                      </span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-semibold">
                        Above target
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Document Provenance Counter */}
                <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {patient.documents.length} Physical Records Reconciled
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Prescription, SRL Lab Report, AIIMS Discharge & Clinic Note
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectTimelineSource(patient.documents[0] as any)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                  >
                    <span>View Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>

            {/* 3. RECONCILED MEDICATIONS TABLE (Active vs Discontinued) */}
            <section className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      Reconciled Medications Regimen
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Cross-referenced across all submitted prescriptions to prevent double-dosing
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 self-start sm:self-auto">
                  {patient.medications.filter(m => m.is_active).length} Active Drugs • 1 Discontinued
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="pb-2">Medication</th>
                      <th className="pb-2">Dosage & Frequency</th>
                      <th className="pb-2">Prescribed By / Date</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Source Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {patient.medications.map(med => (
                      <tr
                        key={med.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors ${
                          !med.is_active ? 'opacity-65 bg-slate-50/40 dark:bg-slate-900/20' : ''
                        }`}
                      >
                        <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100">
                          {med.name}
                          {med.generic_name && (
                            <span className="block text-[10px] font-normal text-slate-400">
                              {med.generic_name}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">{med.dosage}</span> • {med.frequency}
                        </td>
                        <td className="py-2.5 text-slate-500">
                          <span>{med.prescribing_clinic || 'Prescriber'}</span>
                          <span className="block text-[10px] font-mono text-slate-400">
                            {med.prescribed_date}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {med.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200">
                              Discontinued
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleSelectMedicationSource(med)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. THE CHRONOLOGICAL TIMELINE (Core Engine) */}
            <section aria-label="Chronological clinical history">
              <ChronologicalTimeline
                events={patient.timeline}
                onSelectSource={handleSelectTimelineSource}
                onSelectFlag={flagId => {
                  const flag = patient.red_flags.find(f => f.id === flagId);
                  if (flag) handleSelectFlag(flag);
                }}
              />
            </section>

            {/* 5. STRICT NON-DIAGNOSTIC GUARDRAIL DISCLAIMER */}
            <footer className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                <strong>Non-Diagnostic System Standard:</strong> {patient.disclaimer}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                The Two-Minute Doctor • Pre-Consultation Intake Architecture • All extracted data backed by source coordinates.
              </p>
            </footer>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              WAITING-ROOM PATIENT INTAKE MODE (Mobile / Kiosk / Upload)
              ───────────────────────────────────────────────────────────── */
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Patient Waiting-Room Intake
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Waiting patients upload prescriptions, lab reports, or speak symptoms. The system extracts structured timelines for the doctor.
              </p>
            </div>

            {/* Document Upload Card */}
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-3xl bg-white dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-sm group">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      Running OCR & Extracting Clinical Provenance...
                    </p>
                    <p className="text-xs text-slate-400">Normalizing dates and detecting safety red flags</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl mb-3 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="mb-1 text-base font-bold text-slate-800 dark:text-slate-100">
                      Tap to upload prescription or lab photo
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports mobile camera captures, multi-page PDFs, and crumpled paper slips
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                disabled={isUploading}
              />
            </label>

            {/* Demo Notice */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                To test the 60-Second Doctor Cockpit with preloaded multi-document patient history:
              </p>
              <button
                onClick={() => setActiveTab('cockpit')}
                className="mt-2.5 px-4 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Switch to Doctor Cockpit (Preloaded Rajesh Kumar Verma)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SOURCE INSPECTOR MODAL (Connected)
          ───────────────────────────────────────────────────────────── */}
      <SourceInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        source={selectedSource}
        contextEvent={selectedEvent}
        contextFlag={selectedFlag}
        allSources={allContextSources}
        onSelectSource={src => setSelectedSource(src)}
      />
    </main>
  );
}