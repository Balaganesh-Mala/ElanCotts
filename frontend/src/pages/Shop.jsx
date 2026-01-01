import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

import ProductCard from "../components/ui/ProductCard";
import ProductGridSkeleton from "../components/ui/ProductGridSkeleton";
import api from "../api/axios.js";

const Shop = () => {
  /* ================= STATES ================= */
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [visible, setVisible] = useState(12);

  const [filterOpen, setFilterOpen] = useState(false);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/all");
      setProducts(res.data.products || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  /* ================= LOAD CATEGORY TREE ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/tree/all");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Category tree error:", err);
      }
    };

    loadCategories();
  }, []);

  /* ================= LOAD PRODUCTS BY CATEGORY ================= */
  const loadProductsByCategory = async (slug) => {
    try {
      setLoading(true);
      setProducts([]);

      if (!slug) {
        setLoading(false);
        return;
      }

      const res = await api.get(`/products/category/${slug}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Products fetch error:", err);
      Swal.fire("Error", "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER + SORT ================= */
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "low-high") {
      list.sort(
        (a, b) =>
          Math.min(...a.variants.map((v) => v.price)) -
          Math.min(...b.variants.map((v) => v.price))
      );
    }

    if (sort === "high-low") {
      list.sort(
        (a, b) =>
          Math.min(...b.variants.map((v) => v.price)) -
          Math.min(...a.variants.map((v) => v.price))
      );
    }

    return list;
  }, [products, search, sort]);

  /* ================= UI ================= */
  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
        {/* ================= SIDEBAR ================= */}
        <aside className="hidden lg:block bg-white border rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
          {/* HEADER */}
          <h3 className="text-sm font-semibold mb-4 text-gray-900">
            Categories
          </h3>

          <div className="flex flex-col gap-1.5">
            {/* ALL CATEGORIES */}
            <button
              onClick={() => {
                setActiveCategory(null);
                loadAllProducts();
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition
        ${
          !activeCategory
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-indigo-50"
        }`}
            >
              All Categories
            </button>

            {/* CATEGORY TREE */}
            {categories.map((parent) => (
              <div key={parent._id}>
                {/* PARENT CATEGORY */}
                <button
                  onClick={() => {
                    setActiveCategory(parent.slug);
                    loadProductsByCategory(parent.slug);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition
            ${
              activeCategory === parent.slug
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-indigo-50"
            }`}
                >
                  {parent.name}
                </button>

                {/* CHILD CATEGORIES */}
                {parent.children?.length > 0 && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {parent.children.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => {
                          setActiveCategory(child.slug);
                          loadProductsByCategory(child.slug);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs text-left transition
                  ${
                    activeCategory === child.slug
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-gray-600 hover:bg-indigo-50"
                  }`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SORT */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold mb-2 text-gray-700">
              Sort By
            </h4>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full border bg-gray-50 px-4 py-2 rounded-xl text-sm outline-none
                 focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Recommended</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <div>
          {/* HEADER */}
          <h1 className="text-3xl font-semibold mb-2">Shop Our Collection</h1>
          <p className="text-gray-600 text-sm mb-6">
            Select a category to explore products
          </p>

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full border px-5 py-2.5 rounded-full mb-6"
          />

          {/* PRODUCTS */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Select a category to view products
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                {filteredProducts.slice(0, visible).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {visible < filteredProducts.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisible((v) => v + 12)}
                    className="px-8 py-2.5 rounded-full border border-indigo-600
                      text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Shop;
