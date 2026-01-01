import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Switch } from "../../components/ui/switch.jsx";
import { ImagePlus, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    mrp: "",
    category: "",
    brand: "",
    description: "",
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    sizes: { shirt: [], pant: [] },
  });

  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState(["", "", "", ""]);
  const [categories, setCategories] = useState([]);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        Swal.fire("Error", "Failed to load categories ❗", "error");
      }
    })();
  }, []);

  // Load product
  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      const p = res.data;

      // We ensure PAST SIZES are compatible with new format
      const patchedSizes = p.sizes?.map((s) => ({
        type: s.type,
        size: s.size,
        stock: Number(s.stock) || 0,
      })) || [];

      setForm({
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        category: p.category?._id,
        brand: p.brand,
        description: p.description,
        isFeatured: p.isFeatured,
        isBestSeller: p.isBestSeller,
        isActive: p.isActive,
        sizes: {
          shirt: patchedSizes.filter((x) => x.type === "shirt"),
          pant: patchedSizes.filter((x) => x.type === "pant"),
        },
      });

      const imgs = p.images.slice(0, 4);
      while (imgs.length < 4) imgs.push("");
      setImagePreviews(imgs);

    } catch (err) {
      Swal.fire("Error", "Failed to load product ❗", "error");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleImageSelect = (index) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const tempFiles = [...imageFiles];
      tempFiles[index] = file;
      setImageFiles(tempFiles);

      const tempPrev = [...imagePreviews];
      tempPrev[index] = URL.createObjectURL(file);
      setImagePreviews(tempPrev);
    };

    fileInput.click();
  };

  // Update size fields
  const updateSizeField = (type, index, key, value) => {
    const updated = [...form.sizes[type]];
    updated[index][key] = key === "stock" ? Number(value) : value;

    setForm((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [type]: updated,
      },
    }));
  };

  // Add size row
  const addSizeRow = (type) => {
    setForm((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [type]: [...prev.sizes[type], { type, size: "", stock: 0 }],
      },
    }));
  };

  // Remove size row
  const removeSizeRow = (type, index) => {
    const filtered = form.sizes[type].filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [type]: filtered,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imagePreviews.some((p) => !p)) {
      Swal.fire("Error", "Please upload all 4 images ❗", "warning");
      setStep(2);
      return;
    }

    try {
      setUpdating(true);

      let finalImages = [...imagePreviews];

      // Upload new images if replaced
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i] !== null) {
          const fd = new FormData();
          fd.append("images", imageFiles[i]);

          const res = await api.post("/products/upload", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          finalImages[i] = res.data.url;
        }
      }

      const payload = {
        ...form,
        images: finalImages,
        sizes: [...form.sizes.shirt, ...form.sizes.pant],
      };

      await api.put(`/products/${id}`, payload);

      Swal.fire("Success", "Product updated successfully 🎉", "success");
      navigate("/admin/products");
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Update failed ❗",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-xl">←</button>
        <h1 className="text-xl md:text-2xl font-bold">Edit Product</h1>
      </div>

      <div className="flex gap-2 flex-wrap text-xs md:text-sm">
        {["Product Info", "Images", "Sizes", "Submit"].map((s, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 rounded-full border cursor-pointer ${
              step === i + 1 ? "bg-black text-white" : "bg-white text-gray-600"
            }`}
            onClick={() => setStep(i + 1)}
          >
            {s}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 md:p-7">

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <Label>Name *</Label>
                <Input name="name" value={form.name} onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }/>

                <Label>Category *</Label>
                <select
                  className="border p-2 rounded-xl w-full"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                <Label>Brand *</Label>
                <Input
                  name="brand"
                  value={form.brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                />

                <Label>Price *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />

                <Label>MRP *</Label>
                <Input
                  type="number"
                  value={form.mrp}
                  onChange={(e) => setForm((prev) => ({ ...prev, mrp: e.target.value }))}
                />

                <Label>Description</Label>
                <textarea
                  className="border w-full p-3 rounded-xl"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />

                <Button onClick={() => setStep(2)}>Next →</Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <Label>Upload / Replace Images</Label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                  {imagePreviews.map((prev, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleImageSelect(idx)}
                      className="border rounded-xl aspect-square bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      {prev ? (
                        <img src={prev} className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={() => setStep(3)}>Next →</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">

                {/* SHIRT */}
                <div>
                  <Label className="font-semibold">Shirt Sizes</Label>

                  {form.sizes.shirt.map((item, i) => (
                    <div key={i} className="flex gap-3 mt-2 items-center">
                      <Input
                        className="w-28"
                        value={item.size}
                        placeholder="S / M / L"
                        onChange={(e) =>
                          updateSizeField("shirt", i, "size", e.target.value)
                        }
                      />

                      <Input
                        className="w-24"
                        type="number"
                        value={item.stock}
                        placeholder="Stock"
                        onChange={(e) =>
                          updateSizeField("shirt", i, "stock", e.target.value)
                        }
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSizeRow("shirt", i)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button type="button" className="mt-3"
                    onClick={() => addSizeRow("shirt")}
                  >
                    + Add Shirt Size
                  </Button>
                </div>

                {/* PANT */}
                <div>
                  <Label className="font-semibold">Pant Sizes</Label>

                  {form.sizes.pant.map((item, i) => (
                    <div key={i} className="flex gap-3 mt-2 items-center">
                      <Input
                        className="w-28"
                        value={item.size}
                        placeholder="28 / 30 / 32"
                        onChange={(e) =>
                          updateSizeField("pant", i, "size", e.target.value)
                        }
                      />

                      <Input
                        className="w-24"
                        type="number"
                        value={item.stock}
                        placeholder="Stock"
                        onChange={(e) =>
                          updateSizeField("pant", i, "stock", e.target.value)
                        }
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSizeRow("pant", i)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button type="button" className="mt-3"
                    onClick={() => addSizeRow("pant")}
                  >
                    + Add Pant Size
                  </Button>
                </div>

                <Button onClick={() => setStep(4)}>Next →</Button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">

                <div className="border p-2 rounded flex justify-between">
                  <Label>Featured</Label>
                  <Switch
                    checked={form.isFeatured}
                    onCheckedChange={(val) =>
                      setForm((prev) => ({ ...prev, isFeatured: val }))
                    }
                  />
                </div>

                <div className="border p-2 rounded flex justify-between">
                  <Label>Best Seller</Label>
                  <Switch
                    checked={form.isBestSeller}
                    onCheckedChange={(val) =>
                      setForm((prev) => ({ ...prev, isBestSeller: val }))
                    }
                  />
                </div>

                <div className="border p-2 rounded flex justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(val) =>
                      setForm((prev) => ({ ...prev, isActive: val }))
                    }
                  />
                </div>

                <div className="text-center pt-6">
                  <Button type="submit" disabled={updating}>
                    {updating ? "Updating..." : "Update Product"}
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setStep(3)}
                    className="mt-4"
                  >
                    ← Back
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

export default EditProduct;
