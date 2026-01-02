import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Loader2 } from "lucide-react";

/* ================= COMPONENT ================= */

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);

  const [form, setForm] = useState(null);

  /* ================= LOAD CATEGORIES ================= */

  useEffect(() => {
    (async () => {
      const res = await api.get("/categories");
      const all = res.data.categories || [];
      setCategories(all);
      setParentCategories(all.filter((c) => !c.parent));
    })();
  }, []);

  /* ================= LOAD PRODUCT ================= */

  useEffect(() => {
    if (!categories.length) return;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const p = res.data.product;

        const categoryId = p.category?._id || p.category;
        const subCategoryId = p.subCategory?._id || p.subCategory || "";

        setChildCategories(
          categories.filter((c) => String(c.parent) === String(categoryId))
        );

        setForm({
          name: p.name,
          brand: p.brand || "",
          company: p.company || "",
          category: categoryId,
          subCategory: subCategoryId,
          gender: p.gender,
          shortDescription: p.shortDescription,
          longDescription: p.longDescription,
          attributes: p.attributes || {},
          variants: p.variants.map((v) => ({
            ...v,
            images: v.images.map((img) => ({
              url: img.url,
              isExisting: true,
            })),
          })),
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          isNewArrival: p.isNewArrival,
          isActive: p.isActive,
          returnPolicy: p.returnPolicy,
          shipping: p.shipping,
          seo: {
            title: p.seo?.title || "",
            description: p.seo?.description || "",
            keywords: p.seo?.keywords?.join(", ") || "",
          },
        });
      } catch {
        Swal.fire("Error", "Failed to load product", "error");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, categories]);

  /* ================= HANDLERS ================= */

  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value;

    setForm((prev) => ({
      ...prev,
      category: parentId,
      subCategory: "",
    }));

    setChildCategories(
      categories.filter((c) => String(c.parent) === String(parentId))
    );
  };

  const handleVariantImageAdd = (vIdx, files) => {
    const variants = [...form.variants];
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    variants[vIdx].images.push(...newImages);
    setForm({ ...form, variants });
  };

  const handleVariantImageRemove = (vIdx, imgIdx) => {
    const variants = [...form.variants];
    variants[vIdx].images.splice(imgIdx, 1);
    setForm({ ...form, variants });
  };

  const handleSizeChange = (vIdx, sIdx, field, value) => {
    const variants = [...form.variants];
    variants[vIdx].sizes[sIdx][field] = value;
    setForm({ ...form, variants });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const fd = new FormData();

      fd.append(
        "productData",
        JSON.stringify({
          ...form,
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
          if (!img.isExisting && img.file) {
            fd.append(`variantImages_${i}`, img.file);
          }
        });
      });

      await api.put(`/products/${id}`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      Swal.fire("Success", "Product updated successfully", "success");
      navigate("/admin/products");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ================= UI ================= */

  if (loading || !form) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC */}
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />

            {/* CATEGORY */}
            <select
              value={form.category}
              onChange={handleParentCategoryChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Category</option>
              {parentCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={form.subCategory}
              onChange={(e) =>
                setForm({ ...form, subCategory: e.target.value })
              }
              disabled={!childCategories.length}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Sub Category</option>
              {childCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* ATTRIBUTES */}
            <div className="grid grid-cols-2 gap-3">
              {[
                "fabric",
                "fit",
                "sleeve",
                "occasion",
                "washCare",
                "countryOfOrigin",
              ].map((k) => (
                <Input
                  key={k}
                  placeholder={k}
                  value={form.attributes[k] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      attributes: { ...form.attributes, [k]: e.target.value },
                    })
                  }
                />
              ))}
            </div>

            {/* VARIANTS */}
            {form.variants.map((v, vIdx) => (
              <div key={vIdx} className="border rounded p-4 space-y-3">
                <Input value={v.color} disabled />

                <input
                  type="file"
                  multiple
                  onChange={(e) => handleVariantImageAdd(vIdx, e.target.files)}
                />

                <div className="grid grid-cols-4 gap-2">
                  {v.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img.preview || img.url}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleVariantImageRemove(vIdx, i)}
                        className="absolute top-1 right-1 bg-black text-white text-xs px-2 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {v.sizes.map((s, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-4 gap-2">
                    <Input value={s.size} disabled />
                    <Input
                      value={s.price}
                      onChange={(e) =>
                        handleSizeChange(vIdx, sIdx, "price", e.target.value)
                      }
                    />
                    <Input
                      value={s.mrp}
                      onChange={(e) =>
                        handleSizeChange(vIdx, sIdx, "mrp", e.target.value)
                      }
                    />
                    <Input
                      value={s.stock}
                      onChange={(e) =>
                        handleSizeChange(vIdx, sIdx, "stock", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* FLAGS */}
            {["isFeatured", "isBestSeller", "isNewArrival", "isActive"].map(
              (f) => (
                <div
                  key={f}
                  className="flex justify-between border p-2 rounded"
                >
                  <Label>{f}</Label>
                  <Switch
                    checked={form[f]}
                    onCheckedChange={(v) => setForm({ ...form, [f]: v })}
                  />
                </div>
              )
            )}

            <Button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
