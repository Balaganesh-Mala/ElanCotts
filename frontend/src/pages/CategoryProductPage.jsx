import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2, ArrowLeft, PackageSearch } from "lucide-react";

import ProductCard from "../components/ui/ProductCard";
import api from "../api/axios.js";

const CategoryProductsPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      if (!slug) {
        Swal.fire("Error", "Invalid category", "error");
        return navigate("/");
      }

      try {
        setLoading(true);

        const res = await api.get(`/products/category/${slug}`);

        if (!res.data?.success) {
          throw new Error("Failed to load products");
        }

        setProducts(res.data.products || []);
        setCategory(res.data.category || null);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load category products", "error");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [slug, navigate]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm animate-pulse">Loading products...</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* ================= BACK ================= */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* ================= HEADER ================= */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          {category?.name || "Category Products"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {category?.description || "Explore products from this category"}
        </p>
      </div>

      {/* ================= EMPTY ================= */}
      {products.length === 0 && (
        <div className="flex flex-col items-center text-center py-20 text-gray-400">
          <PackageSearch className="w-14 h-14 mb-4 opacity-50" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try checking another category</p>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fadeIn">
          {products.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/product/${p.slug}`)}
              className="cursor-pointer transform hover:scale-[1.02] transition"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryProductsPage;
