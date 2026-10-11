'use client';

import { RedFlag } from '@/types/clinical';
import { AlertTriangle, Shield, Pill, FlaskConical, Heart, X } from 'lucide-react';
import { useState } from 'react';

interface RedFlagAlertBarProps {
  flags: RedFlag[];
  onFlagClick?: (flag: RedFlag) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  allergy: <Shield className="w-4 h-4" />,
  drug_interaction: <Pill className="w-4 h-4" />,
  contraindication: <AlertTriangle className="w-4 h-4" />,
  duplicate_medication: <Pill className="w-4 h-4" />,
  abnormal_result: <FlaskConical className="w-4 h-4" />,
  renal_risk: <Heart className="w-4 h-4" />,
  hepatic_risk: <Heart className="w-4 h-4" />,
};

export default function RedFlagAlertBar({ flags, onFlagClick }: RedFlagAlertBarProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const criticals = flags.filter(f => f.severity === 'critical' && !dismissed.has(f.id));
  const warnings = flags.filter(f => f.severity === 'warning' && !dismissed.has(f.id));
  const infos = flags.filter(f => f.severity === 'info' && !dismissed.has(f.id));

  if (criticals.length === 0 && warnings.length === 0 && infos.length === 0) return null;

  const dismissFlag = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  return (
    <div className="space-y-2 animate-slide-up">
      {/* Critical flags — flashing red banner */}
      {criticals.length > 0 && (
        <div className="red-flag-banner rounded-xl px-4 py-3 animate-pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span className="text-white font-extrabold text-sm tracking-wide uppercase">
              {criticals.length} Critical Alert{criticals.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1.5">
            {criticals.map(flag => (
              <div
                key={flag.id}
                className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors group"
                onClick={() => onFlagClick?.(flag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onFlagClick?.(flag)}
              >
                <span className="mt-0.5 text-white/90">{categoryIcons[flag.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xs">{flag.title}</p>
                  <p className="text-white/70 text-[11px] leading-snug mt-0.5 line-clamp-2">{flag.description}</p>
                </div>
                <button
                  className="text-white/40 hover:text-white/80 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); dismissFlag(flag.id); }}
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning flags */}
      {warnings.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-300 font-bold text-xs tracking-wide uppercase">
              {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1.5">
            {warnings.map(flag => (
              <div
                key={flag.id}
                className="flex items-start gap-2 bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/90 dark:hover:bg-white/10 transition-colors group"
                onClick={() => onFlagClick?.(flag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onFlagClick?.(flag)}
              >
                <span className="mt-0.5 text-amber-600">{categoryIcons[flag.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-900 dark:text-amber-200 font-bold text-xs">{flag.title}</p>
                  <p className="text-amber-700/70 dark:text-amber-400/70 text-[11px] leading-snug mt-0.5 line-clamp-2">{flag.description}</p>
                </div>
                <button
                  className="text-amber-400 hover:text-amber-600 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); dismissFlag(flag.id); }}
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info flags — compact inline badges */}
      {infos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {infos.map(flag => (
            <button
              key={flag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[11px] font-semibold rounded-lg border border-blue-200 dark:border-blue-700/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              onClick={() => onFlagClick?.(flag)}
            >
              {categoryIcons[flag.category]}
              {flag.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
