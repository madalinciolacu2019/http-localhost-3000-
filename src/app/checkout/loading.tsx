export default function CheckoutLoading() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#15151E]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        {/* Left — form skeleton */}
        <div className="space-y-6">
          <div className="h-10 w-48 bg-white/5 rounded" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg" />
            ))}
          </div>
          <div className="h-14 bg-[#E10600]/10 rounded-xl" />
        </div>

        {/* Right — order summary skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-40 bg-white/5 rounded" />
          <div className="border border-white/5 rounded-2xl p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
            <div className="h-[1px] bg-white/5 my-4" />
            <div className="flex justify-between">
              <div className="h-5 w-16 bg-white/5 rounded" />
              <div className="h-5 w-20 bg-[#E10600]/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
