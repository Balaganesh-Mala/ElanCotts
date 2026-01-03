import { useRecentlyViewed } from "../../context/RecentlyViewedContext";
import { useNavigate } from "react-router-dom";

const RecentlyViewed = () => {
  const { recentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Recently Viewed
        </h2>
        <span className="text-xs text-slate-500">
          Based on your browsing
        </span>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {recentlyViewed.map((p) => {
          const firstVariant = p.variants?.[0];
          const image = firstVariant?.images?.[0]?.url;
          const colorsCount = p.variants?.length || 0;

          return (
            <button
              key={p._id}
              onClick={() => navigate(`/product/${p.slug}`)}
              className="group text-left"
            >
              {/* IMAGE */}
              <div
                className="relative rounded-2xl border border-slate-200
                bg-slate-50 overflow-hidden aspect-[3/4]"
              >
                {image ? (
                  <img
                    src={image}
                    alt={p.name}
                    className="w-full h-full object-cover
                    transition-transform duration-300
                    group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No Image
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="mt-3 space-y-1">
                {/* NAME */}
                <p className="text-sm font-medium text-slate-900 line-clamp-1">
                  {p.name}
                </p>

                {/* SHORT DESCRIPTION */}
                {p.shortDescription && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {p.shortDescription}
                  </p>
                )}

                {/* COLORS */}
                {colorsCount > 0 && (
                  <p className="text-xs text-slate-600">
                    {colorsCount} color{colorsCount > 1 ? "s" : ""} available
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
