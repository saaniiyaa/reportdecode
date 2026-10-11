'use client';

import { IntakeRecord } from '@/types/clinical';
import { Mic, Clock, Gauge, MessageSquareQuote, Languages } from 'lucide-react';

interface ChiefComplaintCardProps {
  intake: IntakeRecord;
}

const severityConfig = {
  mild: { label: 'Mild', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/40' },
  moderate: { label: 'Moderate', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700/40' },
  severe: { label: 'Severe', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/40' },
};

export default function ChiefComplaintCard({ intake }: ChiefComplaintCardProps) {
  const sev = severityConfig[intake.severity];

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <MessageSquareQuote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Chief Complaint</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${sev.color}`}>
            <Gauge className="w-3 h-3" />
            {sev.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            <Clock className="w-3 h-3" />
            {intake.complaint_duration}
          </span>
        </div>
      </div>

      {/* Main complaint text */}
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-3">
        {intake.chief_complaint}
      </p>

      {/* Voice transcript */}
      {intake.transcript && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700 mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Mic className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Transcript</span>
            <span className="inline-flex items-center gap-0.5 ml-auto text-[10px] text-slate-400">
              <Languages className="w-3 h-3" />
              {intake.language}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
            &ldquo;{intake.transcript}&rdquo;
          </p>
        </div>
      )}

      {/* Follow-up Q&A */}
      {intake.follow_up_answers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intake Follow-Up</p>
          {intake.follow_up_answers.map((qa, i) => (
            <div key={i} className="flex gap-2 text-[11px]">
              <span className="text-slate-400 font-medium shrink-0">Q:</span>
              <div>
                <span className="text-slate-500 dark:text-slate-400">{qa.question}</span>
                <br />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">→ {qa.answer}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
