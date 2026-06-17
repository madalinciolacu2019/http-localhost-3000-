export default function MenuLoading() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#15151E]">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12 space-y-4 animate-pulse">
          <div className="h-12 w-64 bg-white/5 rounded-lg mx-auto" />
          <div className="h-4 w-80 bg-white/5 rounded mx-auto" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-3 mb-10 justify-center animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-white/5 rounded-full" />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/3 p-6 space-y-4 animate-pulse">
              <div className="aspect-video bg-white/5 rounded-xl" />
              <div className="h-5 w-3/4 bg-white/5 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-2/3 bg-white/5 rounded" />
              <div className="h-10 w-full bg-[#E10600]/10 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
