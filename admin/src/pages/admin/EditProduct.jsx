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

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


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
    const loadCategories = async () => {
      const res = await api.get("/categories");
      const all = res.data.categories || [];
      setCategories(all);
      setParentCategories(all.filter((c) => !c.parent));
    };
    loadCategories();
  }, []);

  /* ================= LOAD PRODUCT ================= */

  useEffect(() => {
    if (!categories.length) return;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/products/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const p = res.data.product;

        const categoryId = p.category?._id || p.category;
        const subCategoryId = p.subCategory?._id || "";

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
            color: v.color,
            sizes: v.sizes,
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
      } catch (err) {
        Swal.fire("Error", "Failed to load product", "error");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
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
    const img = variants[vIdx].images[imgIdx];

    if (img.preview) URL.revokeObjectURL(img.preview);

    variants[vIdx].images.splice(imgIdx, 1);
    setForm({ ...form, variants });
  };

  const handleSizeChange = (vIdx, sIdx, field, value) => {
    const variants = [...form.variants];
    variants[vIdx].sizes[sIdx][field] = value;
    setForm({ ...form, variants });
  };

 const moveImage = (vIdx, oldIndex, newIndex) => {
  const variants = [...form.variants];
  const images = [...variants[vIdx].images];

  const [moved] = images.splice(oldIndex, 1);
  images.splice(newIndex, 0, moved);

  variants[vIdx].images = images;
  setForm({ ...form, variants });
};

const makePrimaryImage = (vIdx, imgIdx) => {
  if (imgIdx === 0) return;

  const variants = [...form.variants];
  const images = [...variants[vIdx].images];

  const [selected] = images.splice(imgIdx, 1);
  images.unshift(selected);

  variants[vIdx].images = images;
  setForm({ ...form, variants });
};

const moveImageByStep = (vIdx, imgIdx, direction) => {
  const variants = [...form.variants];
  const images = [...variants[vIdx].images];

  const targetIndex =
    direction === "LEFT" ? imgIdx - 1 : imgIdx + 1;

  if (targetIndex < 0 || targetIndex >= images.length) return;

  [images[imgIdx], images[targetIndex]] = [
    images[targetIndex],
    images[imgIdx],
  ];

  variants[vIdx].images = images;
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

      Swal.fire("Success", "Product updated successfully ✅", "success");
      navigate("/admin/products");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed ❌",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ================= UI ================= */

  if (loading || !form) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
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
                      attributes: {
                        ...form.attributes,
                        [k]: e.target.value,
                      },
                    })
                  }
                />
              ))}
            </div>

            {/* VARIANTS */}
            {form.variants.map((v, vIdx) => (
              <div key={vIdx} className="border rounded-xl p-4 space-y-4">
                <Input value={v.color} disabled />

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleVariantImageAdd(vIdx, e.target.files)
                  }
                />

                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
  {v.images.map((img, i) => (
    <div
      key={i}
      className="relative group rounded-lg border overflow-hidden"
    >
      <img
        src={img.preview || img.url}
        className="h-24 w-full object-cover"
      />

      {/* IMAGE ORDER BADGE */}
      <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
        #{i + 1}
      </span>

      {/* MOVE CONTROLS */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
        <button
          type="button"
          disabled={i === 0}
          onClick={() => moveImageByStep(vIdx, i, "LEFT")}
          className="bg-white text-xs px-2 py-1 rounded shadow disabled:opacity-40"
        >
          ⬅️
        </button>

        <button
          type="button"
          disabled={i === v.images.length - 1}
          onClick={() => moveImageByStep(vIdx, i, "RIGHT")}
          className="bg-white text-xs px-2 py-1 rounded shadow disabled:opacity-40"
        >
          ➡️
        </button>
      </div>

      {/* REMOVE */}
      <button
        type="button"
        onClick={() => handleVariantImageRemove(vIdx, i)}
        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 rounded opacity-0 group-hover:opacity-100"
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
                        handleSizeChange(
                          vIdx,
                          sIdx,
                          "price",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      value={s.mrp}
                      onChange={(e) =>
                        handleSizeChange(
                          vIdx,
                          sIdx,
                          "mrp",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      value={s.stock}
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
                ))}
              </div>
            ))}

            {/* FLAGS */}
            {["isFeatured", "isBestSeller", "isNewArrival", "isActive"].map(
              (f) => (
                <div
                  key={f}
                  className="flex justify-between border p-3 rounded"
                >
                  <Label>{f}</Label>
                  <Switch
                    checked={form[f]}
                    onCheckedChange={(v) =>
                      setForm({ ...form, [f]: v })
                    }
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
