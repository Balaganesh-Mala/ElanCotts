import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../services/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import VariantStockPopover from "../../components/ui/VariantStockPopover";

/* ================= HELPERS ================= */
const getMinPrice = (variants = []) => {
  const prices = variants.flatMap(
    (v) => v.sizes?.map((s) => Number(s.price) || 0) || []
  );
  return prices.length ? Math.min(...prices) : 0;
};

const getTotalStock = (variants = []) =>
  variants.reduce(
    (sum, v) =>
      sum + (v.sizes?.reduce((s, x) => s + Number(x.stock || 0), 0) || 0),
    0
  );

const ProductManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= LOAD PRODUCTS (ADMIN) ================= */
  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= TOGGLE HANDLER (PUT) ================= */
  const handleToggle = async (productId, field, value) => {
    try {
      const fd = new FormData();

      fd.append(
        "productData",
        JSON.stringify({
          [field]: value,
        })
      );

      await api.put(`/products/${productId}`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, [field]: value } : p))
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", `Failed to update ${field}`, "error");
    }
  };

  /* ================= ACTIONS ================= */
  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Deactivate product?",
      text: "Product will be hidden but not deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate",
    });

    if (!r.isConfirmed) return;

    try {
      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // ✅ UPDATE STATE, DON'T REMOVE
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: false } : p))
      );

      Swal.fire("Deactivated", "Product hidden successfully", "success");
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const getPriceRange = (variants = []) => {
    const prices = variants.flatMap((v) => v.sizes.map((s) => s.price));
    return `₹${Math.min(...prices)} – ₹${Math.max(...prices)}`;
  };

  const getInventoryStatus = (variants = []) => {
    let hasOutOfStock = false;
    let hasLowStock = false;
    let totalStock = 0;

    variants.forEach((variant) => {
      variant.sizes.forEach((s) => {
        totalStock += s.stock;

        if (s.stock === 0) {
          hasOutOfStock = true;
        } else if (s.stock <= 5) {
          hasLowStock = true;
        }
      });
    });

    // 🔴 Highest priority
    if (hasOutOfStock) {
      return {
        label: "Out of stock",
        color: "bg-red-100 text-red-700",
      };
    }

    // 🟠 Second priority
    if (hasLowStock) {
      return {
        label: "Limited stock",
        color: "bg-amber-100 text-amber-700",
      };
    }

    // 🟢 Normal
    return {
      label: "In stock",
      color: "bg-green-100 text-green-700",
    };
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const truncate = (text, max = 25) =>
    text?.length > max ? text.slice(0, max) + "…" : text;

  const getStockType = (variants = []) => {
    let hasOut = false;
    let hasLow = false;

    variants.forEach((v) =>
      v.sizes.forEach((s) => {
        if (s.stock === 0) hasOut = true;
        else if (s.stock <= 5) hasLow = true;
      })
    );

    if (hasOut) return "out";
    if (hasLow) return "low";
    return "in";
  };

  const filteredProducts = products.filter((p) => {
    /* 🔍 SEARCH FILTER */
    const searchText = search.toLowerCase();
    const searchMatch =
      p.name?.toLowerCase().includes(searchText) ||
      p.brand?.toLowerCase().includes(searchText);

    /* 📂 CATEGORY FILTER */
    const categoryMatch =
      categoryFilter === "all" || p.category?._id === categoryFilter;

    /* 📦 STOCK FILTER */
    const stockMatch =
      stockFilter === "all" || getStockType(p.variants) === stockFilter;

    /* 📅 DATE FILTER */
    /* 📅 DATE RANGE FILTER */
    let dateMatch = true;

    if (fromDate) {
      const createdDate = new Date(p.createdAt);
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);

      dateMatch = createdDate >= from;
    }

    if (toDate && dateMatch) {
      const createdDate = new Date(p.createdAt);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      dateMatch = createdDate <= to;
    }

    return searchMatch && categoryMatch && stockMatch && dateMatch;
  });

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Product Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage inventory, pricing and visibility
          </p>
        </div>

        <Button
          className="w-full sm:w-auto"
          onClick={() => navigate("/admin/products/add")}
        >
          + Add Product
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-4 space-y-4">
          {/* FILTER HEADER */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>

            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStockFilter("all");
                setFromDate("");
                setToDate("");
              }}
              className="text-xs text-indigo-600 hover:underline"
            >
              Reset
            </button>
          </div>

          {/* FILTER CONTROLS */}
          <div className="grid gap-4 md:grid-cols-5">
            {/* SEARCH */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Search</label>
              <input
                type="text"
                placeholder="Product or brand"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {[
                  ...new Map(
                    products.map((p) => [p.category?._id, p.category])
                  ).values(),
                ]
                  .filter(Boolean)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* STOCK */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Stock</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="in">In Stock</option>
                <option value="low">Limited</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            {/* FROM DATE */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* TO DATE */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Active</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4 text-center">Best</th>
                  <th className="p-4 text-center">New</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((p) => {
                  const inventory = getInventoryStatus(p.variants);

                  return (
                    <React.Fragment key={p._id}>
                      {/* MAIN ROW */}
                      <tr className="border-b hover:bg-white transition">
                        {/* PRODUCT */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-semibold text-slate-800">
                                {truncate(p.name, 25)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {truncate(p.brand, 25)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td className="p-4 text-slate-600">
                          {p.category?.name || "—"}
                          {p.subCategory?.name && (
                            <div className="text-xs text-slate-400">
                              {p.subCategory.name}
                            </div>
                          )}
                        </td>

                        {/* PRICE */}
                        <td className="p-4 font-medium">
                          {getPriceRange(p.variants)}
                        </td>

                        {/* STOCK */}
                        <td className="p-4">
                          <button
                            onClick={() => toggleExpand(p._id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${inventory.color} hover:opacity-90`}
                          >
                            {inventory.label}
                          </button>

                          <div className="text-xs text-slate-400 mt-1">
                            Click to view variants
                          </div>
                        </td>

                        {/* TOGGLES */}
                        {[
                          "isActive",
                          "isFeatured",
                          "isBestSeller",
                          "isNewArrival",
                        ].map((field) => (
                          <td key={field} className="p-4 text-center">
                            <Switch
                              checked={p[field]}
                              onCheckedChange={(val) =>
                                handleToggle(p._id, field, val)
                              }
                            />
                          </td>
                        ))}

                        {/* ACTIONS */}
                        <td className="p-4 text-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(p._id)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!p.isActive}
                            onClick={() => handleDelete(p._id)}
                          >
                            Deactivate
                          </Button>
                        </td>
                      </tr>

                      {/* EXPANDED ROW */}
                      {expandedId === p._id && (
                        <tr className="bg-slate-50">
                          <td colSpan={9} className="p-6">
                            <div className="space-y-6">
                              {p.variants.map((variant) => (
                                <div
                                  key={variant._id}
                                  className="bg-white border border-slate-200 rounded-xl"
                                >
                                  {/* VARIANT HEADER */}
                                  <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                                    <h4 className="font-semibold text-slate-700">
                                      Color: {variant.color}
                                    </h4>
                                  </div>

                                  {/* SIZE TABLE */}
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-white border-b text-slate-500 text-xs uppercase">
                                        <tr>
                                          <th className="px-4 py-2 text-left">
                                            Size
                                          </th>
                                          <th className="px-4 py-2 text-right">
                                            Price
                                          </th>
                                          <th className="px-4 py-2 text-right">
                                            MRP
                                          </th>
                                          <th className="px-4 py-2 text-right">
                                            Stock
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {variant.sizes.map((s) => (
                                          <tr
                                            key={s.sku}
                                            className={`border-b last:border-none transition
    ${s.stock === 0 ? "bg-red-50" : s.stock <= 5 ? "bg-amber-50" : ""}
  `}
                                          >
                                            <td className="px-4 py-2">
                                              {s.size}
                                            </td>

                                            <td className="px-4 py-2 text-right font-medium">
                                              ₹{s.price}
                                            </td>

                                            <td className="px-4 py-2 text-right text-slate-400 line-through">
                                              ₹{s.mrp}
                                            </td>

                                            <td
                                              className={`px-4 py-2 text-right font-semibold ${
                                                s.stock === 0
                                                  ? "text-red-600"
                                                  : s.stock <= 5
                                                  ? "text-orange-600"
                                                  : "text-green-600"
                                              }`}
                                            >
                                              {s.stock}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center p-10 text-slate-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManager;
