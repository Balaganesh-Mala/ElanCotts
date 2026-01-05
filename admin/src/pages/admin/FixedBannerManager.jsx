import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Loader2, ImagePlus } from "lucide-react";

/* ================= AUTH ================= */
const auth = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

/* ================= COMPONENT ================= */
const FixedBannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    linkType: "INTERNAL",
    link: "",
    order: 10,
    isActive: true,
    image: null,
  });

  /* ================= LOAD FIXED BANNERS ================= */
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hero");
      setBanners(res.data.fixedBanners || []);
    } catch {
      Swal.fire("Error", "Failed to load fixed banners ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= OPEN FORM ================= */
  const openAdd = () => {
    setEditId(null);
    setForm({
      title: "",
      subtitle: "",
      buttonText: "",
      linkType: "INTERNAL",
      link: "",
      order: 10,
      isActive: true,
      image: null,
    });

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setFormOpen(true);
  };

  const openEdit = (b) => {
    setEditId(b._id);
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      buttonText: b.buttonText,
      linkType: b.linkType,
      link: b.link,
      order: b.order,
      isActive: b.isActive,
      image: null,
    });
    setImagePreview(b.image?.url || null);
    setFormOpen(true);
  };

  /* ================= IMAGE HANDLER ================= */
  const handleImage = (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return Swal.fire("Invalid File", "Only JPG, PNG, WEBP allowed", "error");
    }

    if (file.size > 2 * 1024 * 1024) {
      return Swal.fire("Too Large", "Max 2MB image allowed", "warning");
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setForm((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.order < 10 || form.order > 20) {
      return Swal.fire(
        "Invalid Order",
        "Fixed Banner order must be between 10–20",
        "warning"
      );
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("subtitle", form.subtitle);
      fd.append("buttonText", form.buttonText);
      fd.append("linkType", form.linkType);
      fd.append("link", form.link);
      fd.append("order", form.order);
      fd.append("isActive", form.isActive);

      if (form.image) fd.append("image", form.image);

      editId
        ? await api.put(`/hero/${editId}`, fd, auth)
        : await api.post("/hero/create", fd, auth);

      Swal.fire("Success", "Fixed banner saved", "success");
      setFormOpen(false);
      fetchBanners();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Save failed ❌",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Delete fixed banner?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!r.isConfirmed) return;

    await api.delete(`/hero/${id}`, auth);
    fetchBanners();
    Swal.fire("Deleted", "Fixed banner removed", "success");
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fixed Banner Manager</h1>
        <Button onClick={openAdd} className="flex gap-2">
          <ImagePlus size={16} /> Add Fixed Banner
        </Button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Card>
  <CardHeader>
    <CardTitle>Fixed Banners (Order 10–20)</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="border-b bg-slate-50">
          <tr className="text-left">
            <th className="p-3 w-[90px]">Image</th>
            <th className="p-3">Content</th>
            <th className="p-3">CTA</th>
            <th className="p-3">Link</th>
            <th className="p-3 w-[80px]">Order</th>
            <th className="p-3 w-[80px]">Active</th>
            <th className="p-3 w-[140px] text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {banners.map((b) => (
            <tr key={b._id} className="border-b hover:bg-slate-50 align-top">
              {/* IMAGE */}
              <td className="p-3">
                <img
                  src={b.image?.url}
                  alt={b.title}
                  className="h-12 w-20 rounded-md object-cover border"
                />
              </td>

              {/* TITLE + SUBTITLE */}
              <td className="p-3">
                <p className="font-semibold text-slate-800">{b.title}</p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {b.subtitle}
                </p>
              </td>

              {/* CTA */}
              <td className="p-3">
                {b.buttonText ? (
                  <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {b.buttonText}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>

              {/* LINK */}
              <td className="p-3 max-w-[220px]">
                <p className="text-xs font-semibold text-slate-600">
                  {b.linkType}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {b.link || "—"}
                </p>
              </td>

              {/* ORDER */}
              <td className="p-3 font-medium text-slate-700">
                {b.order}
              </td>

              {/* ACTIVE */}
              <td className="p-3">
                <Switch
                  checked={b.isActive}
                  onCheckedChange={(v) => {
                    const fd = new FormData();
                    fd.append("isActive", v);
                    api
                      .put(`/hero/${b._id}`, fd, auth)
                      .then(fetchBanners);
                  }}
                />
              </td>

              {/* ACTIONS */}
              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <Button size="sm" onClick={() => openEdit(b)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}

          {banners.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-6 text-slate-500">
                No fixed banners found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

      )}

      {/* MODAL */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4"
          >
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              placeholder="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              required
            />
            <Input
              placeholder="Button Text"
              value={form.buttonText}
              onChange={(e) =>
                setForm({ ...form, buttonText: e.target.value })
              }
              required
            />

            {/* LINK TYPE */}
            <select
              value={form.linkType}
              onChange={(e) =>
                setForm({ ...form, linkType: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="INTERNAL">Internal Link</option>
              <option value="EXTERNAL">External URL</option>
              <option value="ANCHOR">Anchor</option>
            </select>

            {/* LINK */}
            <Input
              placeholder={
                form.linkType === "ANCHOR"
                  ? "#collections"
                  : form.linkType === "EXTERNAL"
                  ? "https://example.com"
                  : "/shop"
              }
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />

            <Input
              type="number"
              min={10}
              max={20}
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) })
              }
            />

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files[0])}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                className="h-32 rounded object-cover"
              />
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FixedBannerManager;
