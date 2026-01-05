const Shimmer = ({ className }) => (
  <div
    className={`animate-pulse rounded-xl bg-gradient-to-r 
    from-slate-200 via-slate-100 to-slate-200 ${className}`}
  />
);

const CheckoutSkeleton = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border p-6 space-y-4">
            <Shimmer className="h-6 w-1/3" />
            <Shimmer className="h-10 w-full" />
            <Shimmer className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Shimmer className="h-10" />
              <Shimmer className="h-10" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border p-6 space-y-4">
            <Shimmer className="h-6 w-1/3" />
            <Shimmer className="h-16 w-full" />
            <Shimmer className="h-16 w-full" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-3xl border p-6 space-y-4 h-fit">
          <Shimmer className="h-6 w-1/2" />

          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Shimmer className="w-14 h-16" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-3 w-2/3" />
              </div>
            </div>
          ))}

          <div className="border-t my-4" />

          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-10 w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
};

export default CheckoutSkeleton;
