import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { FiChevronRight } from "react-icons/fi";
import ProductCard from "../components/ui/ProductCard";
import ProductGridSkeleton from "../components/ui/ProductGridSkeleton";
import api from "../api/axios.js";

const Shop = () => {
  /* ================= STATES ================= */
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState({
    parent: null,
    child: null,
  });

  const [products, setProducts] = useState([]);
  const [openParent, setOpenParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);

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
  const loadProductsByParent = async (slug) => {
    try {
      setLoading(true);
      setProducts([]);

      const res = await api.get(`/products/category/${slug}`);
      setProducts(res.data.products || []);
    } catch {
      Swal.fire("Error", "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByChild = async (slug) => {
    try {
      setLoading(true);
      setProducts([]);

      const res = await api.get(`/products/category/${slug}`);
      setProducts(res.data.products || []);
    } catch {
      Swal.fire("Error", "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const getMinPrice = (product) => {
    let prices = [];

    product.variants.forEach((variant) => {
      variant.sizes.forEach((size) => {
        if (typeof size.price === "number") {
          prices.push(size.price);
        }
      });
    });

    return prices.length ? Math.min(...prices) : 0;
  };

  /* ================= FILTER + SORT ================= */
  const filteredProducts = useMemo(() => {
    let list = [...products];

    /* SEARCH */
    if (search) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    /* PRICE RANGE */
    list = list.filter((p) => {
      const price = getMinPrice(p);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    /* SORT */
    if (sort === "low-high") {
      list.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    }

    if (sort === "high-low") {
      list.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    }

    return list;
  }, [products, search, sort, priceRange]);

  /* ================= UI ================= */
  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
        {/* ================= SIDEBAR ================= */}
        {/* DESKTOP FILTER SIDEBAR */}
        <aside
          className="hidden lg:block sticky top-24 h-fit
  rounded-3xl border border-slate-200
  bg-white shadow-xl overflow-hidden"
        >
          {/* GRADIENT HEADER */}
          <div
            className="px-6 py-4
    bg-gray-100
    text-black"
          >
            <h3 className="text-sm font-semibold">Filters</h3>
            <p className="text-xs text-black-900">Refine products quickly</p>
          </div>

          <div className="p-6 space-y-7">
            {/* ALL CATEGORIES */}
            <button
              onClick={() => {
                setActiveCategory({ parent: null, child: null });
                loadAllProducts();
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition
        ${
          !activeCategory.parent && !activeCategory.child
            ? "bg-indigo-600 text-white shadow-md"
            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
        }`}
            >
              All Categories
            </button>

            {/* CATEGORY SECTION */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Categories
              </h4>

              {categories.map((parent) => {
                const isOpen = openParent === parent.slug;

                return (
                  <div
                    key={parent._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden"
                  >
                    {/* PARENT */}
                    <button
                      onClick={() => {
                        setActiveCategory({ parent: parent.slug, child: null });
                        loadProductsByParent(parent.slug);

                        setOpenParent(isOpen ? null : parent.slug);
                      }}
                      className={`w-full flex justify-between items-center
          px-4 py-3 text-sm font-medium transition
          ${
            activeCategory.parent === parent.slug && !activeCategory.child
              ? "bg-indigo-500 text-white"
              : "text-slate-700 hover:bg-indigo-100"
          }`}
                    >
                      <span>{parent.name}</span>

                      {/* ARROW */}
                      <FiChevronRight
                        className={`text-lg transition-transform duration-200
            ${isOpen ? "rotate-90" : "rotate-0"}`}
                      />
                    </button>

                    {/* CHILDREN */}
                    {parent.children?.length > 0 && isOpen && (
                      <div className="px-4 py-3 space-y-1 bg-white">
                        {parent.children.map((child) => (
                          <button
                            key={child._id}
                            onClick={() => {
                              setActiveCategory({
                                parent: parent.slug,
                                child: child.slug,
                              });
                              loadProductsByChild(child.slug);
                            }}
                            className={`w-full px-3 py-2 rounded-lg text-xs text-left transition
                ${
                  activeCategory.child === child.slug
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-indigo-50"
                }`}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SORT */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Sort By
              </h4>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm
          bg-slate-50 border border-slate-200
          focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Recommended</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
              </select>
            </div>

            {/* PRICE */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Price Range
              </h4>

              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-indigo-600"
              />

              <div className="flex justify-between text-xs text-slate-500">
                <span>₹0</span>
                <span className="font-medium text-slate-700">
                  ₹{priceRange[1]}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE FILTER + SORT BAR */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-4">
          {/* FILTER BUTTON */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center justify-center gap-2
      px-5 py-2.5 rounded-xl text-sm font-semibold
      bg-gradient-to-r from-indigo-600 to-blue-600
      text-white shadow-md active:scale-95 transition"
          >
            Filters
            <span className="text-xs opacity-90">☰</span>
          </button>

          {/* SORT DROPDOWN */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-9
        rounded-xl text-sm font-medium
        border border-slate-200 bg-white
        shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Recommended</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
            </select>

            {/* DROPDOWN ICON */}
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2
      text-slate-400 pointer-events-none"
            >
              ▼
            </span>
          </div>
        </div>

        {/* MOBILE FILTER DRAWER */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-end">
            <div className="w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-slate-800">
                  Filters
                </h3>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="text-sm font-semibold text-indigo-600"
                >
                  Close
                </button>
              </div>

              {/* ALL CATEGORIES */}
              <button
                onClick={() => {
                  setActiveCategory({ parent: null, child: null });
                  loadAllProducts();
                  setOpenParent(null);
                  setFilterOpen(false);
                }}
                className={`w-full mb-3 px-4 py-2.5 rounded-xl text-sm font-semibold
          ${
            !activeCategory.parent && !activeCategory.child
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-700"
          }`}
              >
                All Categories
              </button>

              {/* CATEGORY LIST */}
              <div className="space-y-3">
                {categories.map((parent) => {
                  const isOpen = openParent === parent.slug;

                  return (
                    <div
                      key={parent._id}
                      className="rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      {/* PARENT */}
                      <button
                        onClick={() =>
                          setOpenParent(isOpen ? null : parent.slug)
                        }
                        className="w-full flex justify-between items-center
                  px-4 py-3 text-sm font-medium text-slate-800
                  bg-slate-50"
                      >
                        <span>{parent.name}</span>
                        <span
                          className={`transition-transform duration-200
                    ${isOpen ? "rotate-180" : ""}`}
                        >
                          ▼
                        </span>
                      </button>

                      {/* CHILDREN */}
                      {parent.children?.length > 0 && isOpen && (
                        <div className="px-4 py-3 space-y-2 bg-white">
                          {parent.children.map((child) => (
                            <button
                              key={child._id}
                              onClick={() => {
                                setActiveCategory({
                                  parent: parent.slug,
                                  child: child.slug,
                                });
                                loadProductsByChild(child.slug);
                                setFilterOpen(false);
                              }}
                              className={`w-full px-4 py-2 rounded-lg text-sm text-left
                        ${
                          activeCategory.child === child.slug
                            ? "bg-indigo-100 text-indigo-700 font-semibold"
                            : "bg-slate-50 text-slate-700"
                        }`}
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PRICE RANGE */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold mb-2 text-slate-800">
                  Price Range
                </h4>

                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-indigo-600"
                />

                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* APPLY BUTTON */}
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full mt-6 px-4 py-3 rounded-xl
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white font-semibold shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

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
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-2 sm:gap-x-4
        gap-y-8 sm:gap-y-10"
              >
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
