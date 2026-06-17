export default function PaddockClubLoading() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#15151E]">
      <div className="max-w-7xl mx-auto animate-pulse">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="space-y-4">
            <div className="h-4 w-48 bg-white/5 rounded" />
            <div className="h-16 w-80 bg-white/5 rounded" />
          </div>
          <div className="border border-white/5 rounded-xl p-8 min-w-[280px] space-y-3">
            <div className="h-3 w-32 bg-white/5 rounded" />
            <div className="h-6 w-24 bg-white/5 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg" />
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3 border border-white/5 rounded-xl p-12 space-y-8">
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded" />
                  <div className="h-8 w-16 bg-white/5 rounded" />
                </div>
              ))}
            </div>
            <div className="h-[1px] bg-white/5" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
