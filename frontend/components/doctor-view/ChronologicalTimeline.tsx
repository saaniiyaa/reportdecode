'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { TimelineEvent, SourceReference } from '@/types/clinical';
import {
  Pill,
  FlaskConical,
  Stethoscope,
  Building2,
  Activity,
  FileText,
  AlertTriangle,
  ExternalLink,
  Search,
  ArrowUpDown,
  Filter,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

interface ChronologicalTimelineProps {
  events: TimelineEvent[];
  onSelectSource?: (source: SourceReference, event?: TimelineEvent) => void;
  onSelectFlag?: (flagId: string) => void;
  selectedEventId?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

type EventTypeFilter = 'all' | 'medication' | 'lab' | 'clinic_visit' | 'discharge' | 'symptom' | 'flagged';
type SortOrder = 'desc' | 'asc';

const typeConfig: Record<
  TimelineEvent['type'],
  { label: string; icon: typeof Pill; color: string; bg: string; border: string; badge: string }
> = {
  medication: {
    label: 'Medication',
    icon: Pill,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/50',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
  },
  lab: {
    label: 'Lab Result',
    icon: FlaskConical,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50',
  },
  clinic_visit: {
    label: 'Clinic Visit',
    icon: Stethoscope,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/50',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50',
  },
  discharge: {
    label: 'Discharge / Hospital',
    icon: Building2,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/50',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-700/50',
  },
  symptom: {
    label: 'Patient Symptom',
    icon: Activity,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700/50',
  },
  procedure: {
    label: 'Procedure',
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/50',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-700/50',
  },
  imaging: {
    label: 'Imaging',
    icon: FileText,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800/50',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700/50',
  },
};

function formatDate(dateStr: string): { formatted: string; yearMonth: string } {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { formatted: dateStr, yearMonth: '' };
    return {
      formatted: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      yearMonth: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    };
  } catch {
    return { formatted: dateStr, yearMonth: '' };
  }
}

export default function ChronologicalTimeline({
  events,
  onSelectSource,
  onSelectFlag,
  selectedEventId: controlledSelectedId,
  onEventClick,
}: ChronologicalTimelineProps) {
  const [filter, setFilter] = useState<EventTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);

  // Filter & sort events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by type
    if (filter === 'flagged') {
      result = result.filter(e => e.related_flags && e.related_flags.length > 0);
    } else if (filter !== 'all') {
      result = result.filter(e => e.type === filter);
    }

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          (e.subtitle && e.subtitle.toLowerCase().includes(q)) ||
          e.details.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [events, filter, searchQuery, sortOrder]);

  // Keep index within range
  useEffect(() => {
    if (activeEventIndex >= filteredEvents.length) {
      setActiveEventIndex(Math.max(0, filteredEvents.length - 1));
    }
  }, [filteredEvents.length, activeEventIndex]);

  // Keyboard navigation: J (next), K (prev), Enter (open source)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveEventIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveEventIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        const currentEvent = filteredEvents[activeEventIndex];
        if (currentEvent && currentEvent.source && onSelectSource) {
          e.preventDefault();
          onSelectSource(currentEvent.source, currentEvent);
        }
      }
    },
    [filteredEvents, activeEventIndex, onSelectSource]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const flaggedCount = useMemo(
    () => events.filter(e => e.related_flags && e.related_flags.length > 0).length,
    [events]
  );

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Top Bar: Title & stats */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/70 to-blue-50/20 dark:from-slate-800 dark:to-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Chronological Clinical History
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {events.length} extracted clinical milestones across multiple prescribers
                </p>
              </div>
            </div>
          </div>

          {/* Quick controls: Sort toggle & keyboard hint */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              <kbd className="font-bold">J</kbd>/<kbd className="font-bold">K</kbd> to step • <kbd className="font-bold">Enter</kbd> source
            </span>

            <button
              onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-xs"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="mt-3.5 flex flex-col md:flex-row md:items-center gap-2.5">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search medications, tests, clinics, diagnoses..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                filter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilter('medication')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                filter === 'medication'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Rx ({events.filter(e => e.type === 'medication').length})
            </button>
            <button
              onClick={() => setFilter('lab')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                filter === 'lab'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Labs ({events.filter(e => e.type === 'lab').length})
            </button>
            <button
              onClick={() => setFilter('clinic_visit')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                filter === 'clinic_visit'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Visits ({events.filter(e => e.type === 'clinic_visit').length})
            </button>
            <button
              onClick={() => setFilter('discharge')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                filter === 'discharge'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Discharges ({events.filter(e => e.type === 'discharge').length})
            </button>

            {flaggedCount > 0 && (
              <button
                onClick={() => setFilter('flagged')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                  filter === 'flagged'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40 hover:bg-red-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Alerts ({flaggedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Timeline Stream */}
      <div className="p-4 sm:p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No events match your criteria</p>
            <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or reset the filter pill.</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-5 sm:space-y-6">
            {/* The vertical timeline connector bar */}
            <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700/80" />

            {filteredEvents.map((evt, idx) => {
              const cfg = typeConfig[evt.type] || typeConfig.medication;
              const Icon = cfg.icon;
              const { formatted } = formatDate(evt.date);
              const isFlagged = evt.related_flags && evt.related_flags.length > 0;
              const isKeyboardActive = idx === activeEventIndex;
              const isControlledActive = controlledSelectedId === evt.id;
              const isHighlighted = isKeyboardActive || isControlledActive;

              return (
                <div
                  key={evt.id}
                  className={`relative group transition-all duration-200 ${
                    isHighlighted ? 'scale-[1.008]' : ''
                  }`}
                  onClick={() => {
                    setActiveEventIndex(idx);
                    onEventClick?.(evt);
                  }}
                >
                  {/* Timeline Node Dot / Icon */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                      isFlagged
                        ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950 dark:border-red-600'
                        : isHighlighted
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md ring-4 ring-blue-100 dark:ring-blue-900/40'
                        : `${cfg.border} ${cfg.bg} ${cfg.color} bg-white dark:bg-slate-800`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Event Card */}
                  <div
                    className={`rounded-xl border transition-all p-3.5 sm:p-4 bg-white dark:bg-slate-800/80 ${
                      isFlagged
                        ? 'border-red-200 dark:border-red-800/60 shadow-xs hover:border-red-300'
                        : isHighlighted
                        ? 'border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                    }`}
                  >
                    {/* Header: Date, Type Badge & Red Flag indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                          {formatted}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {/* Safety flag pill if present */}
                      {isFlagged && (
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700/40 cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                          onClick={e => {
                            e.stopPropagation();
                            if (evt.related_flags?.[0] && onSelectFlag) {
                              onSelectFlag(evt.related_flags[0]);
                            }
                          }}
                          title="Click to view safety alert"
                        >
                          <ShieldAlert className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span>Safety Flagged</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      {evt.title}
                    </h4>
                    {evt.subtitle && (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {evt.subtitle}
                      </p>
                    )}

                    {/* Details content */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2 bg-slate-50/70 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      {evt.details}
                    </p>

                    {/* Tags */}
                    {evt.tags && evt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {evt.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              tag.toLowerCase().includes('allergy') || tag.toLowerCase().includes('conflict')
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/40'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Source Citation Action Button (Provenance Link) */}
                    {evt.source && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate font-medium">{evt.source.document_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {(evt.source.confidence * 100).toFixed(0)}% conf
                          </span>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectSource?.(evt.source!, evt);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 transition-colors group/btn shadow-xs"
                        >
                          <span>Inspect Original Crop</span>
                          <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        <span>
          Showing {filteredEvents.length} of {events.length} timeline milestones
        </span>
        <span className="text-[10px] text-slate-400 italic">
          Every timeline event links directly to patient medical records
        </span>
      </div>
    </div>
  );
}
