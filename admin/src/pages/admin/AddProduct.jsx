import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent } from "../../components/ui/card";
import { ImagePlus, Loader2 } from "lucide-react";

/* ================= DEFAULT STRUCTURES ================= */

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

  /* ================= HANDLERS ================= */

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAttrChange = (e) =>
    setForm({
      ...form,
      attributes: { ...form.attributes, [e.target.name]: e.target.value },
    });

  const handleVariantChange = (i, field, value) => {
    const variants = [...form.variants];
    variants[i][field] = value;
    setForm({ ...form, variants });
  };

  const handleSizeChange = (vIdx, sIdx, field, value) => {
    const variants = [...form.variants];
    variants[vIdx].sizes[sIdx][field] = value;
    setForm({ ...form, variants });
  };

  const addVariant = () =>
    setForm({
      ...form,
      variants: [...form.variants, { ...emptyVariant }],
    });

  const addSize = (vIdx) => {
    const variants = [...form.variants];
    variants[vIdx].sizes.push({ ...emptySize });
    setForm({ ...form, variants });
  };

  const handleImages = (vIdx, files) => {
    const variants = [...form.variants];
    variants[vIdx].images = files;
    setForm({ ...form, variants });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const fd = new FormData();

      fd.append(
        "productData",
        JSON.stringify({
          ...form,
          seo: {
            ...form.seo,
            keywords: form.seo.keywords
              .split(",")
              .map((k) => k.trim()),
          },
        })
      );

      form.variants.forEach((v, i) => {
        Array.from(v.images || []).forEach((file) =>
          fd.append(`variantImages_${i}`, file)
        );
      });

      await api.post("/products", fd);

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
    <div className="max-w-6xl mx-auto p-5 space-y-6 relative">
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

            {/* STEP 1 – BASIC */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <Input name="name" placeholder="Product Name" onChange={handleChange} />
                <Input name="brand" placeholder="Brand" onChange={handleChange} />
                <Input name="company" placeholder="Company" onChange={handleChange} />
                <Input name="category" placeholder="Category ID" onChange={handleChange} />
                <Input name="subCategory" placeholder="Sub Category ID" onChange={handleChange} />

                <select
                  className="border rounded-lg p-2 text-sm"
                  name="gender"
                  onChange={handleChange}
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Unisex</option>
                </select>

                <Button type="button" onClick={() => setStep(2)}>
                  Next →
                </Button>
              </div>
            )}

            {/* STEP 2 – DESCRIPTION */}
            {step === 2 && (
              <div className="space-y-4">
                <textarea
                  className="border rounded-lg p-3 text-sm"
                  placeholder="Short Description"
                  onChange={(e) =>
                    setForm({ ...form, shortDescription: e.target.value })
                  }
                />
                <textarea
                  className="border rounded-lg p-3 text-sm h-32"
                  placeholder="Long Description"
                  onChange={(e) =>
                    setForm({ ...form, longDescription: e.target.value })
                  }
                />

                <Button onClick={() => setStep(3)}>Next →</Button>
              </div>
            )}

            {/* STEP 3 – VARIANTS */}
            {step === 3 && (
              <div className="space-y-6">
                {form.variants.map((v, vIdx) => (
                  <div key={vIdx} className="border rounded-lg p-4 space-y-4">
                    <Input
                      placeholder="Color"
                      onChange={(e) =>
                        handleVariantChange(vIdx, "color", e.target.value)
                      }
                    />

                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleImages(vIdx, e.target.files)}
                    />

                    {v.sizes.map((s, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-6 gap-2">
                        {Object.keys(s).map((k) => (
                          <Input
                            key={k}
                            placeholder={k}
                            onChange={(e) =>
                              handleSizeChange(vIdx, sIdx, k, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    ))}

                    <Button type="button" onClick={() => addSize(vIdx)}>
                      + Add Size
                    </Button>
                  </div>
                ))}

                <Button type="button" onClick={addVariant}>
                  + Add Variant
                </Button>

                <Button onClick={() => setStep(4)}>Next →</Button>
              </div>
            )}

            {/* STEP 4 – FLAGS + SUBMIT */}
            {step === 4 && (
              <div className="space-y-4">
                {["isFeatured", "isBestSeller", "isNewArrival"].map((f) => (
                  <div key={f} className="flex justify-between border p-2 rounded">
                    <Label>{f}</Label>
                    <Switch
                      checked={form[f]}
                      onCheckedChange={(val) =>
                        setForm({ ...form, [f]: val })
                      }
                    />
                  </div>
                ))}

                <Button type="submit">Publish Product</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddProduct;
