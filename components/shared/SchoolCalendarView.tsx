'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  fetchCalendarPeriodsAction, 
  createCalendarPeriodAction, 
  deleteCalendarPeriodAction, 
  type CalendarPeriodData 
} from '@/app/actions/calendarActions';

interface SchoolCalendarViewProps {
  isEditable?: boolean;
}

const TYPE_STYLES = {
  exam_period: 'bg-warm-clay/10 text-warm-clay border-warm-clay/20',
  holiday: 'bg-sage/10 text-sage border-sage/20',
  break: 'bg-marigold/10 text-marigold border-marigold/20',
};

const TYPE_LABELS = {
  exam_period: 'Exam Period',
  holiday: 'Holiday',
  break: 'School Break',
};

export default function SchoolCalendarView({ isEditable = false }: SchoolCalendarViewProps) {
  const [periods, setPeriods] = useState<CalendarPeriodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'exam_period' | 'holiday' | 'break'>('exam_period');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [suppressAlerts, setSuppressAlerts] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const loadPeriods = async () => {
    setLoading(true);
    const data = await fetchCalendarPeriodsAction();
    setPeriods(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setFormError(null);
    const res = await createCalendarPeriodAction({
      name,
      type,
      startDate,
      endDate,
      description,
      suppressAlerts,
    });

    if (res.success) {
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setShowAddForm(false);
      loadPeriods();
    } else {
      setFormError(res.error || 'Failed to create event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const res = await deleteCalendarPeriodAction(id);
    if (res.success) {
      loadPeriods();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-xl font-bold text-deep-teal">School Calendar</h2>
          <p className="font-body text-xs text-deep-teal/60">
            View holidays, exam schedules, and alert suppression periods.
          </p>
        </div>
        {isEditable && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-deep-teal text-white rounded-xl text-xs font-bold hover:bg-deep-teal/90 transition-all shadow-md"
          >
            + Add Calendar Event
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEvent} className="bg-deep-teal/[0.02] border border-deep-teal/10 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-deep-teal/5 pb-2">
            <h3 className="font-display text-sm font-bold text-deep-teal">New Calendar Event</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-deep-teal/40 hover:text-deep-teal/70 font-semibold"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-warm-clay/10 border border-warm-clay/20 text-warm-clay rounded-xl text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-deep-teal/60">Event Name *</label>
              <input
                type="text"
                placeholder="e.g., Autumn Term Exams"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-deep-teal/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-deep-teal/60">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-deep-teal/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
              >
                <option value="exam_period">Exam Period</option>
                <option value="holiday">Holiday</option>
                <option value="break">School Break</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-deep-teal/60">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-deep-teal/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-deep-teal/60">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-deep-teal/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-deep-teal/20"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-deep-teal/60">Description</label>
              <textarea
                placeholder="Details about the event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-deep-teal/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-deep-teal/20 h-20 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="suppressAlerts"
                checked={suppressAlerts}
                onChange={(e) => setSuppressAlerts(e.target.checked)}
                className="rounded border-deep-teal/20 text-deep-teal focus:ring-deep-teal"
              />
              <label htmlFor="suppressAlerts" className="text-xs font-medium text-deep-teal/80">
                Suppress academic alert triggers during this period
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-deep-teal text-white rounded-xl text-xs font-bold hover:bg-deep-teal/90 transition-all shadow-md"
          >
            Save Event
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-deep-teal" />
          <span className="text-xs text-deep-teal/50 font-medium">Loading calendar events...</span>
        </div>
      ) : periods.length === 0 ? (
        <div className="border border-dashed border-deep-teal/20 rounded-2xl p-8 text-center">
          <p className="font-body text-xs text-deep-teal/50">No calendar events scheduled yet.</p>
        </div>
      ) : (
        <div className="relative border-l border-deep-teal/10 pl-6 ml-2 space-y-6">
          {periods.map((p) => (
            <div key={p.id} className="relative bg-white border border-deep-teal/5 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-5 w-2.5 h-2.5 rounded-full bg-deep-teal ring-4 ring-white" />

              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-bold text-deep-teal">{p.name}</h4>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${TYPE_STYLES[p.type]}`}>
                      {TYPE_LABELS[p.type]}
                    </span>
                    {p.suppressAlerts && (
                      <span className="px-2 py-0.5 bg-sage/5 text-sage border border-sage/10 rounded-full text-[9px] font-bold">
                        Alert Suppression Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-deep-teal/40">
                    {new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' - '}
                    {new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {p.description && (
                    <p className="font-body text-xs text-deep-teal/65 leading-relaxed pt-1">
                      {p.description}
                    </p>
                  )}
                </div>

                {isEditable && (
                  <button
                    onClick={() => handleDeleteEvent(p.id)}
                    className="text-warm-clay/40 hover:text-warm-clay hover:bg-warm-clay/5 p-1.5 rounded-lg transition-all"
                    title="Delete event"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
