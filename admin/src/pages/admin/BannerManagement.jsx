import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Switch } from "../../components/ui/switch.jsx";
import { Loader2, ImagePlus } from "lucide-react";

const BannerManagement = () => {
  const [slides, setSlides] = useState([]);
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
    order: 0,
    isActive: true,
    image: null,
  });

  /* ================= LOAD SLIDES ================= */
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hero");
      setSlides(res.data.slides || []);
    } catch {
      Swal.fire("Error", "Failed to load banners ❗", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  /* ================= OPEN FORMS ================= */
  const openAddForm = () => {
    setEditId(null);
    setForm({
      title: "",
      subtitle: "",
      buttonText: "",
      linkType: "INTERNAL",
      link: "",
      order: 0,
      isActive: true,
      image: null,
    });
    setImagePreview(null);
    setFormOpen(true);
  };

  const openEditForm = (s) => {
    setEditId(s._id);
    setForm({
      title: s.title,
      subtitle: s.subtitle,
      buttonText: s.buttonText,
      linkType: s.linkType || "INTERNAL",
      link: s.link || "",
      order: s.order,
      isActive: s.isActive,
      image: null,
    });
    setImagePreview(s.image?.url || null);
    setFormOpen(true);
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const res = editId
        ? await api.put(`/hero/${editId}`, fd)
        : await api.post("/hero/create", fd);

      Swal.fire("Success", res.data.message, "success");
      setFormOpen(false);
      fetchSlides();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to save banner",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Delete Banner?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    });

    if (!r.isConfirmed) return;

    await api.delete(`/hero/${id}`);
    fetchSlides();
    Swal.fire("Deleted", "Banner removed successfully", "success");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <ImagePlus size={16} /> Add Banner
        </Button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-[800px] w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3">Image</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">CTA</th>
                    <th className="p-3">Link</th>
                    <th className="p-3">Order</th>
                    <th className="p-3">Active</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {slides.map((s) => (
                    <tr key={s._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={s.image?.url}
                          className="w-20 h-12 object-cover rounded"
                          alt=""
                        />
                      </td>
                      <td className="p-3 font-medium">{s.title}</td>
                      <td className="p-3">{s.buttonText}</td>
                      <td className="p-3 text-xs">
                        {s.linkType}: {s.link || "-"}
                      </td>
                      <td className="p-3">{s.order}</td>
                      <td className="p-3">
                        <Switch
                          checked={s.isActive}
                          onCheckedChange={(v) =>
                            api.put(`/hero/${s._id}`, { isActive: v }).then(fetchSlides)
                          }
                        />
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditForm(s)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(s._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editId ? "Edit Banner" : "Create Banner"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
              <Input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Subtitle" required />
              <Input name="buttonText" value={form.buttonText} onChange={handleChange} placeholder="Button Text" required />

              {/* LINK TYPE */}
              <select
                name="linkType"
                value={form.linkType}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="INTERNAL">Internal Link</option>
                <option value="EXTERNAL">External URL</option>
                <option value="ANCHOR">Anchor (#section)</option>
              </select>

              {/* LINK */}
              <Input
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder={
                  form.linkType === "ANCHOR"
                    ? "#collections"
                    : form.linkType === "EXTERNAL"
                    ? "https://example.com"
                    : "/shop"
                }
              />

              <Input type="number" name="order" value={form.order} onChange={handleChange} placeholder="Order" />

              <div className="flex justify-between items-center">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                />
              </div>

              <Input type="file" accept="image/*" onChange={handleImage} />
              {imagePreview && (
                <img src={imagePreview} className="h-40 w-full object-cover rounded" />
              )}

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
