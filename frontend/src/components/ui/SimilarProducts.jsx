import { useEffect, useState } from "react";
import { getSimilarProducts } from "../../api/product.api";
import ProductCard from "../ui/ProductCard";

const SimilarProducts = ({ slug }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const loadSimilar = async () => {
      try {
        setLoading(true);
        const res = await getSimilarProducts(slug);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Similar products error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSimilar();
  }, [slug]);

  if (loading) return null;
  if (!products.length) return null;

  return (
    <section className="mt-14">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
          Similar Products
        </h2>
      </div>

      {/* GRID */}
      <div
        className="
          grid grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          gap-4 sm:gap-5
        "
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;
