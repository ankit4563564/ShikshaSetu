'use client';

interface Homework {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  submittedAt: string | null;
  isSubmitted: boolean;
}

interface ParentHomeworkTabProps {
  homework: Homework[];
  studentName: string;
  isLoading?: boolean;
  isEnabled?: boolean;
  onSendMessage: () => void;
}

export function ParentHomeworkTab({
  homework,
  studentName,
  isLoading = false,
  isEnabled = true,
  onSendMessage,
}: ParentHomeworkTabProps) {
  // Separate due today and due tomorrow
  const unsubmitted = homework.filter(h => !h.isSubmitted);
  const homeworkDueToday = unsubmitted.length > 0 ? [unsubmitted[0]] : homework.slice(0, 1);
  const homeworkDueTomorrow = unsubmitted.length > 1 ? unsubmitted.slice(1, 3) : homework.slice(1, 3);

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-extrabold text-deep-teal">
            Homework for {studentName}
          </h3>
          <p className="font-body text-xs text-deep-teal/50">
            View submitted and pending homework assignments.
          </p>
        </div>
        <div className="rounded-2xl border border-deep-teal/10 bg-white p-6 shadow-sm text-center py-10">
          <p className="font-body text-sm text-deep-teal/40 italic">
            🔒 Homework updates are hidden because this preference is disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-extrabold text-deep-teal">
          Homework for {studentName}
        </h3>
        <p className="font-body text-xs text-deep-teal/50">
          View submitted and pending homework assignments. No scores or charts are displayed.
        </p>
      </div>

      <div className="space-y-5">
        {/* Due Today */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold text-deep-teal/80 border-b border-deep-teal/5 pb-1">
            Due Today
          </h4>
          {homeworkDueToday.length === 0 ? (
            <p className="font-body text-xs text-deep-teal/40 italic">No homework due today.</p>
          ) : (
            <div className="space-y-2">
              {homeworkDueToday.map((hw) => (
                <div key={hw.id} className="flex items-center gap-3 bg-white border border-deep-teal/5 p-3 rounded-xl shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hw.isSubmitted}
                    readOnly
                    className="rounded border-deep-teal/20 text-deep-teal focus:ring-deep-teal/10 h-4.5 w-4.5 pointer-events-none"
                  />
                  <div className="flex-1">
                    <h5 className="font-display text-xs font-bold text-deep-teal">{hw.title}</h5>
                    <p className="font-body text-[10px] text-deep-teal/50 font-medium">
                      {hw.subject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Tomorrow */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-bold text-deep-teal/80 border-b border-deep-teal/5 pb-1">
            Due Tomorrow
          </h4>
          {homeworkDueTomorrow.length === 0 ? (
            <p className="font-body text-xs text-deep-teal/40 italic">No homework due tomorrow.</p>
          ) : (
            <div className="space-y-2">
              {homeworkDueTomorrow.map((hw) => (
                <div key={hw.id} className="flex items-center gap-3 bg-white border border-deep-teal/5 p-3 rounded-xl shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hw.isSubmitted}
                    readOnly
                    className="rounded border-deep-teal/20 text-deep-teal focus:ring-deep-teal/10 h-4.5 w-4.5 pointer-events-none"
                  />
                  <div className="flex-1">
                    <h5 className="font-display text-xs font-bold text-deep-teal">{hw.title}</h5>
                    <p className="font-body text-[10px] text-deep-teal/50 font-medium">
                      {hw.subject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Teacher Button */}
        <button
          onClick={onSendMessage}
          disabled={isLoading}
          className="w-full border border-deep-teal hover:bg-deep-teal/5 text-deep-teal font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 text-center mt-4 bg-transparent disabled:opacity-50"
        >
          Send Quick Note
        </button>
      </div>
    </div>
  );
}
