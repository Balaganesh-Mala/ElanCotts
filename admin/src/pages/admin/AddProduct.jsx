import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent } from "../../components/ui/card";
import { Loader2 } from "lucide-react";

/* ================= DEFAULT STRUCTURES ================= */

const generateSKU = (brand, color, size) => {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${brand}-${color}-${size}-${rand}`.replace(/\s+/g, "").toUpperCase();
};

const emptySize = {
  size: "",
  sku: "",
  mrp: "",
  price: "",
  stock: "",
  weight: "",
};

const emptyVariant = {
  color: "",
  sizes: [{ ...emptySize }],
  images: [],
};

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  /* ================= CATEGORY STATE ================= */
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    name: "",
    brand: "",
    company: "",
    category: "",
    subCategory: "",
    gender: "Men",

    shortDescription: "",
    longDescription: "",

    attributes: {
      fabric: "",
      fit: "",
      sleeve: "",
      occasion: "",
      washCare: "",
      countryOfOrigin: "",
    },

    variants: [{ ...emptyVariant }],

    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,

    returnPolicy: {
      isReturnable: true,
      returnDays: 7,
    },

    shipping: {
      codAvailable: true,
      shiprocketEnabled: true,
    },

    seo: {
      title: "",
      description: "",
      keywords: "",
    },
  });

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        const all = res.data.categories || [];

        const parents = all.filter((c) => c.parent === null || c.level === 1);

        setCategories(all);
        setParentCategories(parents);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    loadCategories();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔥 If brand changes → regenerate all SKUs
    if (name === "brand") {
      const variants = form.variants.map((v) => ({
        ...v,
        sizes: v.sizes.map((s) => ({
          ...s,
          sku: s.size ? generateSKU(value, v.color, s.size) : "",
        })),
      }));

      setForm({ ...form, brand: value, variants });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleAttrChange = (e) =>
    setForm({
      ...form,
      attributes: { ...form.attributes, [e.target.name]: e.target.value },
    });

  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value;

    const children = categories.filter((c) => {
      if (!c.parent) return false;

      if (typeof c.parent === "object" && c.parent._id) {
        return String(c.parent._id) === String(parentId);
      }

      return String(c.parent) === String(parentId);
    });

    setForm((prev) => ({
      ...prev,
      category: parentId,
      subCategory: "",
    }));

    setChildCategories(children);
  };

  const handleVariantChange = (vIdx, field, value) => {
    const variants = [...form.variants];
    variants[vIdx][field] = value;

    if (field === "color") {
      variants[vIdx].sizes = variants[vIdx].sizes.map((s) => ({
        ...s,
        sku: s.size ? generateSKU(form.brand, value, s.size) : "",
      }));
    }

    setForm({ ...form, variants });
  };

  const handleSizeChange = (vIdx, sIdx, field, value) => {
    const variants = [...form.variants];
    variants[vIdx].sizes[sIdx][field] = value;

    if (field === "size") {
      variants[vIdx].sizes[sIdx].sku = generateSKU(
        form.brand,
        variants[vIdx].color,
        value
      );
    }

    setForm({ ...form, variants });
  };

  const addVariant = () =>
    setForm({
      ...form,
      variants: [...form.variants, { ...emptyVariant }],
    });

  const addSize = (vIdx) => {
    const variants = [...form.variants];
    variants[vIdx].sizes.push({
      ...emptySize,
      sku: "", // 🔥 ensure fresh sku
    });
    setForm({ ...form, variants });
  };

  const handleImages = (vIdx, files) => {
    const valid = Array.from(files).every((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );

    if (!valid) {
      Swal.fire("Invalid file", "Only JPG, PNG, WEBP allowed", "error");
      return;
    }

    const variants = [...form.variants];
    variants[vIdx].images = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setForm({ ...form, variants });
  };

  const removeVariantImage = (vIdx, imgIdx) => {
    const variants = [...form.variants];
    URL.revokeObjectURL(variants[vIdx].images[imgIdx].preview);
    variants[vIdx].images.splice(imgIdx, 1);
    setForm({ ...form, variants });
  };

  const moveVariantImage = (vIdx, imgIdx, direction) => {
  const variants = [...form.variants];
  const images = [...variants[vIdx].images];

  const target =
    direction === "LEFT" ? imgIdx - 1 : imgIdx + 1;

  if (target < 0 || target >= images.length) return;

  // swap images
  [images[imgIdx], images[target]] = [
    images[target],
    images[imgIdx],
  ];

  variants[vIdx].images = images;
  setForm({ ...form, variants });
};

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const v of form.variants) {
      if (!v.color) {
        return Swal.fire(
          "Missing Color",
          "Each variant needs a color",
          "warning"
        );
      }
    }

    const skuSet = new Set();

    for (const v of form.variants) {
      for (const s of v.sizes) {
        if (!s.sku) {
          return Swal.fire("SKU Missing", "SKU generation failed", "error");
        }

        if (skuSet.has(s.sku)) {
          return Swal.fire(
            "Duplicate SKU",
            "Duplicate SKU found in product variants",
            "error"
          );
        }

        skuSet.add(s.sku);
      }
    }

    if (!form.category) {
      return Swal.fire("Required", "Please select a category", "warning");
    }

    try {
      setSubmitting(true);

      const fd = new FormData();

      fd.append(
        "productData",
        JSON.stringify({
          ...form,
          subCategory: form.subCategory || null,
          seo: {
            ...form.seo,
            keywords: form.seo.keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
          },
        })
      );

      form.variants.forEach((v, i) => {
        v.images.forEach((img) => {
          fd.append(`variantImages_${i}`, img.file);
        });
      });

      await api.post("/products", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      Swal.fire("Success", "Product created successfully ✅", "success");
      navigate("/admin/products");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Product upload failed ❌",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 relative">
      {submitting && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin mb-2" />
          <p className="text-sm font-semibold">Uploading product…</p>
        </div>
      )}

      <h1 className="text-2xl font-bold">Add Product</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                {/* HEADER */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Product Basic Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Enter essential information about your product
                  </p>
                </div>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* PRODUCT NAME */}
                  <div>
                    <Label className="text-slate-600">Product Name *</Label>
                    <Input
                      name="name"
                      placeholder="e.g. Slim Fit Cotton Pant"
                      onChange={handleChange}
                      required
                      className="mt-1 focus-visible:ring-blue-600"
                    />
                  </div>

                  {/* BRAND */}
                  <div>
                    <Label className="text-slate-600">Brand</Label>
                    <Input
                      name="brand"
                      placeholder="e.g. Elan Cotts"
                      onChange={handleChange}
                      className="mt-1 focus-visible:ring-blue-600"
                    />
                  </div>

                  {/* COMPANY */}
                  <div>
                    <Label className="text-slate-600">Company</Label>
                    <Input
                      name="company"
                      placeholder="Manufacturing Company"
                      onChange={handleChange}
                      className="mt-1 focus-visible:ring-blue-600"
                    />
                  </div>

                  {/* GENDER */}
                  <div>
                    <Label className="text-slate-600">Gender *</Label>
                    <select
                      name="gender"
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option>Men</option>
                      <option>Women</option>
                      <option>Unisex</option>
                    </select>
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <Label className="text-slate-600">Category *</Label>
                    <select
                      value={form.category}
                      onChange={handleParentCategoryChange}
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select Category</option>
                      {parentCategories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SUB CATEGORY */}
                  <div>
                    <Label className="text-slate-600">Sub Category</Label>
                    <select
                      value={form.subCategory}
                      onChange={(e) =>
                        setForm({ ...form, subCategory: e.target.value })
                      }
                      disabled={!form.category}
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm
            ${
              form.category
                ? "border-slate-300 focus:ring-2 focus:ring-blue-600"
                : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
                    >
                      <option value="">Select Sub Category</option>
                      {childCategories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FOOTER ACTION */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                {/* HEADER */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Product Description & Attributes
                  </h2>
                  <p className="text-sm text-slate-500">
                    Add detailed information to help customers understand your
                    product
                  </p>
                </div>

                {/* DESCRIPTIONS */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600">
                      Short Description *
                    </Label>
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Brief summary shown on product cards (max 1–2 lines)"
                      rows={3}
                      onChange={(e) =>
                        setForm({ ...form, shortDescription: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-slate-600">Long Description</Label>
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm h-36
                     focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Detailed product description for the product page"
                      onChange={(e) =>
                        setForm({ ...form, longDescription: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* ATTRIBUTES */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Product Attributes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="fabric"
                      placeholder="Fabric (e.g. Cotton)"
                      onChange={handleAttrChange}
                      className="focus-visible:ring-blue-600"
                    />

                    <Input
                      name="fit"
                      placeholder="Fit (e.g. Slim Fit)"
                      onChange={handleAttrChange}
                      className="focus-visible:ring-blue-600"
                    />

                    <Input
                      name="sleeve"
                      placeholder="Sleeve (e.g. NA / Full)"
                      onChange={handleAttrChange}
                      className="focus-visible:ring-blue-600"
                    />

                    <Input
                      name="occasion"
                      placeholder="Occasion (e.g. Casual, Formal)"
                      onChange={handleAttrChange}
                      className="focus-visible:ring-blue-600"
                    />

                    <Input
                      name="washCare"
                      placeholder="Wash Care (e.g. Machine Wash)"
                      onChange={handleAttrChange}
                      className="focus-visible:ring-blue-600"
                    />

                    <Input
                      name="countryOfOrigin"
                      placeholder="Country of Origin (e.g. India)"
                      onChange={handleAttrChange}
                      className="focus-visible:ring-blue-600"
                    />
                  </div>
                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl"
                  >
                    ← Back
                  </Button>

                  <Button
                    onClick={() => setStep(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                {/* HEADER */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Variants, Sizes & Pricing
                  </h2>
                  <p className="text-sm text-slate-500">
                    Add color variants, images, sizes, price & stock details
                  </p>
                </div>

                {/* VARIANTS */}
                <div className="space-y-6">
                  {form.variants.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className="border border-slate-200 rounded-2xl p-5 space-y-5"
                    >
                      {/* VARIANT HEADER */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">
                          Variant {vIdx + 1} *
                        </h3>
                      </div>

                      {/* COLOR */}
                      <div>
                        <Label className="text-slate-600">Color *</Label>
                        <Input
                          placeholder="e.g. Navy Blue"
                          onChange={(e) =>
                            handleVariantChange(vIdx, "color", e.target.value)
                          }
                          className="mt-1 focus-visible:ring-blue-600"
                        />
                      </div>

                      {/* IMAGE UPLOAD */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-slate-600">
                            Product Images *
                          </Label>
                          {v.images?.length > 0 && (
                            <span className="text-xs text-slate-500">
                              {v.images.length} image
                              {v.images.length > 1 && "s"} selected
                            </span>
                          )}
                        </div>

                        {/* UPLOAD AREA */}
                        <label className="flex items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-6 cursor-pointer hover:bg-blue-50 transition">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files.length > 7) {
                                Swal.fire(
                                  "Limit",
                                  "Max 7 images per variant",
                                  "warning"
                                );
                                return;
                              }
                              handleImages(vIdx, e.target.files);
                            }}
                          />

                          <div className="text-center text-sm text-blue-600 font-medium">
                            Click or drag images here
                            <div className="text-xs text-slate-400 mt-1">
                              First image will be the main image
                            </div>
                          </div>
                        </label>

                        {/* IMAGE PREVIEW GRID */}
                        {v.images?.length > 0 && (
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
  {v.images.map((img, imgIdx) => (
    <div
      key={imgIdx}
      className="relative group rounded-lg border overflow-hidden"
    >
      {/* IMAGE */}
      <img
        src={img.preview}
        alt="preview"
        className="w-full h-24 object-cover"
      />

      {/* ORDER BADGE */}
      <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
        #{imgIdx + 1}
      </span>

      {/* PRIMARY LABEL */}
      {imgIdx === 0 && (
        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">
          PRIMARY
        </span>
      )}

      {/* MOVE CONTROLS */}
      <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          type="button"
          disabled={imgIdx === 0}
          onClick={() =>
            moveVariantImage(vIdx, imgIdx, "LEFT")
          }
          className="bg-white text-xs px-2 py-1 rounded shadow disabled:opacity-40"
        >
          ⬅️
        </button>

        <button
          type="button"
          disabled={imgIdx === v.images.length - 1}
          onClick={() =>
            moveVariantImage(vIdx, imgIdx, "RIGHT")
          }
          className="bg-white text-xs px-2 py-1 rounded shadow disabled:opacity-40"
        >
          ➡️
        </button>
      </div>

      {/* REMOVE */}
      <button
        type="button"
        onClick={() => removeVariantImage(vIdx, imgIdx)}
        className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  ))}
</div>

                        )}
                      </div>

                      {/* SIZES */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                          Sizes & Pricing *
                        </h4>

                        <div className="space-y-4">
                          {v.sizes.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="rounded-xl border border-slate-200 p-4 space-y-3"
                            >
                              {/* ROW 1 */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* SIZE */}
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Size *
                                  </Label>
                                  <Input
                                    placeholder="e.g. M / 32"
                                    onChange={(e) =>
                                      handleSizeChange(
                                        vIdx,
                                        sIdx,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                {/* SKU */}
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    SKU
                                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      AUTO-GENERATED
                                    </span>
                                  </Label>
                                  <Input
                                    value={s.sku}
                                    readOnly
                                    className="bg-slate-100 text-slate-600 cursor-not-allowed"
                                  />
                                </div>

                                {/* STOCK */}
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Stock *
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    onChange={(e) =>
                                      handleSizeChange(
                                        vIdx,
                                        sIdx,
                                        "stock",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              {/* ROW 2 */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    MRP
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="₹"
                                    onChange={(e) =>
                                      handleSizeChange(
                                        vIdx,
                                        sIdx,
                                        "mrp",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Selling Price *
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="₹"
                                    onChange={(e) =>
                                      handleSizeChange(
                                        vIdx,
                                        sIdx,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Weight (g) *
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="g"
                                    onChange={(e) =>
                                      handleSizeChange(
                                        vIdx,
                                        sIdx,
                                        "weight",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* ADD SIZE */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSize(vIdx)}
                          className="mt-4 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          + Add Another Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD VARIANT */}
                <Button
                  type="button"
                  onClick={addVariant}
                  className="border border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl"
                >
                  + Add Variant
                </Button>

                {/* NAVIGATION */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="rounded-xl"
                  >
                    ← Back
                  </Button>

                  <Button
                    onClick={() => setStep(4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {/* ================= STEP 4 ================= */}
            {step === 4 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                {/* HEADER */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Product Visibility & Status
                  </h2>
                  <p className="text-sm text-slate-500">
                    Control how this product appears in your store
                  </p>
                </div>

                {/* TOGGLE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: "isFeatured",
                      title: "Featured Product",
                      desc: "Show this product on homepage highlights",
                    },
                    {
                      key: "isBestSeller",
                      title: "Best Seller",
                      desc: "Mark as a top-selling product",
                    },
                    {
                      key: "isNewArrival",
                      title: "New Arrival",
                      desc: "Highlight as a newly launched product",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`rounded-xl border p-4 flex flex-col justify-between
            ${
              form[item.key] ? "border-blue-600 bg-blue-50" : "border-slate-200"
            }`}
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex justify-end pt-3">
                        <Switch
                          checked={form[item.key]}
                          onCheckedChange={(val) =>
                            setForm({ ...form, [item.key]: val })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="rounded-xl"
                  >
                    ← Back
                  </Button>

                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
                  >
                    Publish Product
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddProduct;
