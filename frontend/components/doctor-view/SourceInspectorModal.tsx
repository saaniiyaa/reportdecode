'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SourceReference, TimelineEvent, RedFlag } from '@/types/clinical';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SourceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: SourceReference | null;
  contextEvent?: TimelineEvent | null;
  contextFlag?: RedFlag | null;
  allSources?: SourceReference[];
  onSelectSource?: (source: SourceReference) => void;
}

export default function SourceInspectorModal({
  isOpen,
  onClose,
  source,
  contextEvent,
  contextFlag,
  allSources = [],
  onSelectSource,
}: SourceInspectorModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [showHighlights, setShowHighlights] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [verifiedByDoctor, setVerifiedByDoctor] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & states when source changes or opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setShowHighlights(true);
      setVerifiedByDoctor(false);
      setImageError(false);
    }
  }, [isOpen, source?.source_id]);

  // Keyboard shortcut handler (Esc to close, + / - to zoom)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(z + 0.25, 2.5));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(z => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !source) return null;

  // Active sources list (if multiple sources exist for flag or context)
  const sourceList = allSources.length > 0 ? allSources : [source];
  const currentSourceIndex = sourceList.findIndex(s => s.source_id === source.source_id);

  const handleNextSource = () => {
    if (currentSourceIndex < sourceList.length - 1 && onSelectSource) {
      onSelectSource(sourceList[currentSourceIndex + 1]);
    }
  };

  const handlePrevSource = () => {
    if (currentSourceIndex > 0 && onSelectSource) {
      onSelectSource(sourceList[currentSourceIndex - 1]);
    }
  };

  const copyCitation = () => {
    const text = `Document: ${source.document_name} (ID: ${source.source_id}, Confidence: ${(
      source.confidence * 100
    ).toFixed(0)}%) | Coordinates: ${JSON.stringify(source.bounding_boxes)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePct = Math.round(source.confidence * 100);
  const confidenceColor =
    confidencePct >= 90
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
      : confidencePct >= 75
      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-inspector-title"
    >
      {/* Modal Container */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-6xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="source-inspector-title"
                  className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate"
                >
                  Source Provenance Inspector
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                  <ShieldCheck className="w-3 h-3" />
                  Non-Diagnostic Verification
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                {source.document_name} • ID: {source.source_id}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {sourceList.length > 1 && (
              <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <button
                  onClick={handlePrevSource}
                  disabled={currentSourceIndex === 0}
                  className="p-0.5 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-inherit"
                  title="Previous source"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1">
                  {currentSourceIndex + 1}/{sourceList.length}
                </span>
                <button
                  onClick={handleNextSource}
                  disabled={currentSourceIndex === sourceList.length - 1}
                  className="p-0.5 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-inherit"
                  title="Next source"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area — Split Pane (Desktop) / Column (Mobile) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* ─────────────────────────────────────────────────────────────
              LEFT PANE (5 cols): Extracted Facts & Provenance Metadata
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
            {/* Guardrail Callout */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                <strong>Clinician Provenance Rule:</strong> This view cross-references the AI entity extraction with the original raw artifact bounding box coordinates. Zero diagnoses are generated.
              </p>
            </div>

            {/* Document Metadata Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Document Metadata
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Document Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {source.document_type.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">OCR Confidence</span>
                  <span className={`inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] border ${confidenceColor}`}>
                    {confidencePct}% verified
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Uploaded Date</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(source.uploaded_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Detected ROIs</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {source.bounding_boxes.length} bounding box{source.bounding_boxes.length > 1 ? 'es' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Associated Context Flag (if opened from RedFlagAlertBar) */}
            {contextFlag && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/60 p-3.5 bg-red-50/40 dark:bg-red-950/20 space-y-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-extrabold text-red-800 dark:text-red-300 uppercase tracking-wide">
                    Safety Flag Citation: {contextFlag.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {contextFlag.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {contextFlag.description}
                </p>
              </div>
            )}

            {/* Associated Timeline Event (if opened from Timeline) */}
            {contextEvent && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Timeline Citation Event
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {contextEvent.date}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  {contextEvent.title}
                </h4>
                {contextEvent.subtitle && (
                  <p className="text-[11px] font-medium text-slate-500">
                    {contextEvent.subtitle}
                  </p>
                )}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  {contextEvent.details}
                </p>
                {contextEvent.tags && contextEvent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {contextEvent.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bounding Box Coordinates List */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Bounding Box Coordinates (0–1 Normalised)
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {source.bounding_boxes.map((b, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ROI #{i + 1}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      x: {b.x.toFixed(2)}, y: {b.y.toFixed(2)}, w: {b.width.toFixed(2)}, h: {b.height.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinician Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setVerifiedByDoctor(!verifiedByDoctor)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  verifiedByDoctor
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                <Check className={`w-4 h-4 ${verifiedByDoctor ? 'text-white' : 'text-slate-400'}`} />
                <span>
                  {verifiedByDoctor
                    ? 'Verified by Attending Clinician'
                    : 'Mark as Clinician-Verified'}
                </span>
              </button>

              <button
                onClick={copyCitation}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Citation Copied!' : 'Copy Citation Hash & Provenance'}</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT PANE (7 cols): Interactive Document Viewer & Bounding Box
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col bg-slate-100 dark:bg-slate-950/70 overflow-hidden">
            {/* Viewer Controls Toolbar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs font-bold px-2 text-slate-700 dark:text-slate-300 min-w-[48px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(z + 0.25, 2.5))}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors ml-1"
                  title="Reset Zoom (0)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHighlights(!showHighlights)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    showHighlights
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Highlight ROIs: {showHighlights ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Document Canvas Container */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative select-none"
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="relative bg-white shadow-xl rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden max-w-full"
              >
                {/* Simulated / Real Document Render */}
                <DocumentCanvas
                  source={source}
                  contextEvent={contextEvent}
                  contextFlag={contextFlag}
                  imageError={imageError}
                  setImageError={setImageError}
                />

                {/* Bounding Box Overlays */}
                {showHighlights &&
                  source.bounding_boxes.map((box, i) => {
                    const isFlagged = !!contextFlag;
                    return (
                      <div
                        key={i}
                        className={`absolute pointer-events-none transition-all duration-300 ${
                          isFlagged
                            ? 'border-2 border-red-500 bg-red-500/15 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                            : 'border-2 border-blue-500 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        } rounded-sm`}
                        style={{
                          left: `${box.x * 100}%`,
                          top: `${box.y * 100}%`,
                          width: `${box.width * 100}%`,
                          height: `${box.height * 100}%`,
                        }}
                      >
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-current" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-current" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-current" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-current" />

                        {/* Coordinate tag label */}
                        <div
                          className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-black text-white whitespace-nowrap shadow-xs ${
                            isFlagged ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        >
                          OCR CROP #{i + 1} ({confidencePct}% MATCH)
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Viewer Footnote */}
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Use mouse wheel or +/- buttons to inspect high-resolution OCR text</span>
              <span className="font-mono">Normalised coordinates: 0.00 – 1.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// High-Fidelity Simulated / Real Document Visual Renderer
// ─────────────────────────────────────────────────────────────
interface DocumentCanvasProps {
  source: SourceReference;
  contextEvent?: TimelineEvent | null;
  contextFlag?: RedFlag | null;
  imageError: boolean;
  setImageError: (err: boolean) => void;
}

function DocumentCanvas({
  source,
  contextEvent,
  contextFlag,
  imageError,
  setImageError,
}: DocumentCanvasProps) {
  // If a real image exists and hasn't errored, render image tag
  if (!imageError && source.image_url && !source.image_url.startsWith('/mock/')) {
    return (
      <img
        src={source.image_url}
        alt={source.document_name}
        onError={() => setImageError(true)}
        className="w-[580px] h-[780px] object-contain block"
      />
    );
  }

  // High-fidelity clinical document representation
  if (source.document_type === 'prescription') {
    return (
      <div className="w-[560px] min-h-[760px] bg-[#fdfdf9] text-slate-800 p-8 font-sans border border-slate-200 select-text relative">
        {/* Prescription Header */}
        <div className="border-b-2 border-slate-800 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                DR. R.K. SHARMA, M.D. (Cardiology)
              </h3>
              <p className="text-[11px] text-slate-600 font-medium">
                Senior Consultant Physician & Cardiologist
              </p>
              <p className="text-[10px] text-slate-500">
                City Heart Clinic, Sec-14, Rohini, New Delhi • Reg No: DMC-48921
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              <p>Ph: +91 11 2789 4400</p>
              <p>Timings: 10:00 AM – 2:00 PM</p>
            </div>
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="grid grid-cols-3 gap-2 pb-3 mb-4 border-b border-dashed border-slate-300 text-xs font-medium">
          <div>
            <span className="text-slate-400 text-[10px]">Patient Name:</span>
            <p className="font-bold text-slate-900">Rajesh Kumar Verma</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Age / Sex:</span>
            <p className="font-bold text-slate-900">58 Yrs / Male</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Date:</span>
            <p className="font-bold text-slate-900">12-Nov-2023</p>
          </div>
        </div>

        {/* ALLERGY WARNING BOX (Red ink simulation) */}
        <div className="mb-4 p-2.5 rounded border border-red-400 bg-red-50/70 text-red-900 text-xs">
          <span className="font-extrabold uppercase tracking-wider block text-[10px] text-red-700">
            ⚠ KNOWN DRUG ALLERGIES (NOTED IN INTAKE):
          </span>
          <p className="font-bold text-red-800 mt-0.5">
            PENICILLIN ALLERGY (Severe urticaria reported in 2018)
          </p>
        </div>

        {/* Rx Symbol & Medication Body */}
        <div className="space-y-4 my-6">
          <div className="text-2xl font-serif font-black text-blue-900 italic">℞</div>

          <div className="space-y-4 text-xs font-medium pl-4">
            <div className="p-2 rounded bg-blue-50/50 border border-blue-100">
              <p className="font-extrabold text-sm text-slate-900">1. Tab. Amlodipine 5 mg</p>
              <p className="text-slate-600 text-xs">Sig: 1 tablet OD (Once daily morning) x 30 days</p>
              <span className="text-[10px] text-blue-600 font-mono">Indications: Essential Hypertension</span>
            </div>

            <div className="p-2 rounded bg-blue-50/50 border border-blue-100">
              <p className="font-extrabold text-sm text-slate-900">2. Tab. Metformin 500 mg</p>
              <p className="text-slate-600 text-xs">Sig: 1 tablet BD (Twice daily after meals) x 30 days</p>
              <span className="text-[10px] text-blue-600 font-mono">Indications: Type 2 Diabetes Mellitus</span>
            </div>

            <div className="p-2 text-slate-700">
              <p className="font-bold">3. Advise Kidney Function Test (KFT) & HbA1c in 2 months</p>
              <p className="text-slate-500 text-[11px]">Dietary sodium restriction & 30 min daily brisk walk</p>
            </div>
          </div>
        </div>

        {/* Signature & Stamp */}
        <div className="absolute bottom-10 right-8 text-center">
          <div className="w-28 h-10 border-b border-slate-700 mx-auto flex items-end justify-center pb-1">
            <span className="font-serif italic text-sm text-blue-900 font-bold">R.K. Sharma</span>
          </div>
          <p className="text-[10px] font-bold text-slate-800 mt-1">Dr. R.K. Sharma</p>
          <p className="text-[9px] text-slate-500">M.D., D.M. (Cardiology)</p>
          <div className="inline-block mt-1 px-2 py-0.5 border border-blue-400 text-blue-700 text-[8px] font-mono uppercase rounded">
            Verified Seal
          </div>
        </div>
      </div>
    );
  }

  if (source.document_type === 'lab') {
    return (
      <div className="w-[560px] min-h-[760px] bg-white text-slate-800 p-8 font-sans border border-slate-200 select-text relative">
        {/* Lab Header */}
        <div className="border-b-2 border-emerald-700 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h3 className="font-black text-xl text-emerald-800 tracking-tight">
              SRL DIAGNOSTICS LABS
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              NABL ACCREDITED LABORATORY • ISO 15189:2012
            </p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            BARCODE: 8849-2910-KFT<br />SAMPLE ID: BLD-84920
          </div>
        </div>

        {/* Patient / Sample info */}
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs mb-4 grid grid-cols-2 gap-2">
          <div>
            <span className="text-slate-400 text-[10px]">PATIENT:</span>{' '}
            <strong className="text-slate-900">Rajesh Kumar Verma (58Y/M)</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">COLLECTED:</span>{' '}
            <span>15-Jan-2024 08:30 AM</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">REFERRED BY:</span>{' '}
            <span>Dr. R.K. Sharma</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">REPORTED:</span>{' '}
            <span>15-Jan-2024 04:15 PM</span>
          </div>
        </div>

        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
          Department of Clinical Biochemistry — Renal & Metabolic Panel
        </h4>

        {/* Lab Table */}
        <table className="w-full text-xs text-left mb-6">
          <thead>
            <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-500 font-mono">
              <th className="py-1">Test Parameter</th>
              <th className="py-1">Result</th>
              <th className="py-1">Unit</th>
              <th className="py-1">Ref Range</th>
              <th className="py-1">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr className="bg-red-50/60 font-bold text-red-900">
              <td className="py-1.5">Serum Creatinine</td>
              <td className="py-1.5 text-sm">1.8</td>
              <td className="py-1.5 text-slate-500">mg/dL</td>
              <td className="py-1.5 text-slate-500">0.7 – 1.3</td>
              <td className="py-1.5 text-red-600 font-mono">HIGH ⚠</td>
            </tr>
            <tr className="bg-amber-50/60 font-bold text-amber-900">
              <td className="py-1.5">Blood Urea Nitrogen</td>
              <td className="py-1.5 text-sm">52</td>
              <td className="py-1.5 text-slate-500">mg/dL</td>
              <td className="py-1.5 text-slate-500">13 – 43</td>
              <td className="py-1.5 text-amber-600 font-mono">HIGH</td>
            </tr>
            <tr className="bg-red-50/60 font-bold text-red-900">
              <td className="py-1.5">eGFR (CKD-EPI)</td>
              <td className="py-1.5 text-sm">48</td>
              <td className="py-1.5 text-slate-500">mL/min</td>
              <td className="py-1.5 text-slate-500">&gt; 60</td>
              <td className="py-1.5 text-red-600 font-mono">LOW ⚠</td>
            </tr>
            <tr className="bg-amber-50/60 font-bold text-amber-900">
              <td className="py-1.5">Serum Potassium (K+)</td>
              <td className="py-1.5 text-sm">5.6</td>
              <td className="py-1.5 text-slate-500">mEq/L</td>
              <td className="py-1.5 text-slate-500">3.5 – 5.0</td>
              <td className="py-1.5 text-amber-600 font-mono">HIGH</td>
            </tr>
            <tr className="bg-amber-50/60 font-bold text-amber-900">
              <td className="py-1.5">HbA1c (Glycated Hb)</td>
              <td className="py-1.5 text-sm">7.8</td>
              <td className="py-1.5 text-slate-500">%</td>
              <td className="py-1.5 text-slate-500">4.0 – 5.6</td>
              <td className="py-1.5 text-amber-600 font-mono">HIGH</td>
            </tr>
            <tr className="bg-amber-50/60 font-bold text-amber-900">
              <td className="py-1.5">Fasting Blood Glucose</td>
              <td className="py-1.5 text-sm">142</td>
              <td className="py-1.5 text-slate-500">mg/dL</td>
              <td className="py-1.5 text-slate-500">70 – 100</td>
              <td className="py-1.5 text-amber-600 font-mono">HIGH</td>
            </tr>
            <tr>
              <td className="py-1.5">Serum Uric Acid</td>
              <td className="py-1.5">5.5</td>
              <td className="py-1.5 text-slate-500">mg/dL</td>
              <td className="py-1.5 text-slate-500">3.5 – 7.2</td>
              <td className="py-1.5 text-emerald-600 font-mono">NORMAL</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="absolute bottom-8 left-8 right-8 border-t border-slate-300 pt-3 flex justify-between items-center text-[10px] text-slate-500">
          <div>Verified by: Dr. Anjali Mehta, MD (Pathology)</div>
          <div className="font-mono">Page 1 of 1 • END OF REPORT</div>
        </div>
      </div>
    );
  }

  // Default Generic Document Mockup (Discharge Summary or Clinic Note)
  return (
    <div className="w-[560px] min-h-[760px] bg-white text-slate-800 p-8 font-sans border border-slate-200 select-text relative">
      <div className="border-b-2 border-slate-800 pb-3 mb-4">
        <h3 className="font-black text-lg text-slate-900">
          {source.document_type === 'discharge_summary'
            ? 'ALL INDIA INSTITUTE OF MEDICAL SCIENCES (AIIMS)'
            : 'CITY HEALTH CLINIC & OUTPATIENT CENTER'}
        </h3>
        <p className="text-[11px] text-slate-500 font-medium">
          Official Clinical Record • Document Name: {source.document_name}
        </p>
      </div>

      <div className="p-3 bg-slate-50 rounded text-xs space-y-1 mb-4 font-mono">
        <p>PATIENT: Rajesh Kumar Verma | AGE: 58 | SEX: M</p>
        <p>DOC ID: {source.source_id} | UPLOADED: {source.uploaded_at.split('T')[0]}</p>
      </div>

      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <div>
          <h4 className="font-bold text-slate-900 uppercase text-[11px]">Clinical Narrative & Observations:</h4>
          <p className="mt-1">
            {contextEvent?.details ||
              'Patient admitted for clinical assessment and multidisciplinary workup. Regimen reconciled and clinical notes archived.'}
          </p>
        </div>

        {source.document_type === 'discharge_summary' && (
          <div className="p-3 rounded border border-blue-200 bg-blue-50/50 space-y-1.5">
            <h5 className="font-extrabold text-blue-900 text-xs">Discharge Medications Prescribed:</h5>
            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
              <li>Tab. Atorvastatin 20mg OD HS (Bedtime)</li>
              <li>Tab. Aspirin 75mg OD Post-Lunch</li>
              <li>Tab. Pantoprazole 40mg OD AC (Before Breakfast)</li>
            </ul>
          </div>
        )}

        {source.document_type === 'clinic_note' && (
          <div className="p-3 rounded border border-amber-200 bg-amber-50/50 space-y-1.5">
            <h5 className="font-extrabold text-amber-900 text-xs">Vitals Recorded in Note:</h5>
            <p className="text-[11px] text-slate-700 font-mono">
              BP: 148/92 mmHg • HR: 82 bpm • SpO2: 97% • Weight: 78 kg
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 right-8 text-center text-[10px] text-slate-500 font-mono">
        Official Document Scan • Confidence: {(source.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}
