export function PostSkeleton() {
  return (
    <div className="rounded-xl border border-white/80 bg-white/70 p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-deep-teal/10" />
        <div className="h-3 w-24 rounded bg-deep-teal/10" />
        <div className="h-3 w-16 rounded bg-deep-teal/5 ml-auto" />
      </div>
      <div className="h-4 w-3/4 rounded bg-deep-teal/10" />
      <div className="h-3 w-full rounded bg-deep-teal/5" />
      <div className="h-3 w-2/3 rounded bg-deep-teal/5" />
      <div className="flex gap-3">
        <div className="h-3 w-10 rounded bg-deep-teal/5" />
        <div className="h-3 w-10 rounded bg-deep-teal/5" />
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-24 rounded bg-deep-teal/10" />
      <div className="rounded-xl border border-white/80 bg-white/70 p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-deep-teal/10" />
          <div>
            <div className="h-3 w-32 rounded bg-deep-teal/10" />
            <div className="h-2 w-20 rounded bg-deep-teal/5 mt-1" />
          </div>
        </div>
        <div className="h-5 w-3/4 rounded bg-deep-teal/10" />
        <div className="h-3 w-full rounded bg-deep-teal/5" />
        <div className="h-3 w-full rounded bg-deep-teal/5" />
        <div className="h-3 w-1/2 rounded bg-deep-teal/5" />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-white/80 bg-white/70 p-4 space-y-2">
          <div className="h-3 w-16 rounded bg-deep-teal/10" />
          <div className="h-6 w-12 rounded bg-deep-teal/10" />
        </div>
      ))}
    </div>
  );
}
