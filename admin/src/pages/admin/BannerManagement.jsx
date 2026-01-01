import React, { useEffect, useState } from "react";
import api from "../../services/api";

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
import Swal from "sweetalert2";

const BannerManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    order: 0,
    isActive: true,
    image: null,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hero");
      setSlides(res.data.slides || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load banners ❗", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openAddForm = () => {
    setEditId(null);
    setForm({
      title: "",
      subtitle: "",
      buttonText: "",
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
      order: s.order,
      isActive: s.isActive,
      image: null,
    });
    setImagePreview(s.image?.url || null);
    setFormOpen(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const fd = new FormData();

      fd.append("title", form.title);
      fd.append("subtitle", form.subtitle);
      fd.append("buttonText", form.buttonText);
      fd.append("order", form.order);
      fd.append("isActive", form.isActive);

      if (form.image) {
        fd.append("image", form.image);
      }

      let res;

      if (!editId) {
        res = await api.post("/hero/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put(`/hero/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

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

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Delete Banner?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    });

    if (!r.isConfirmed) return;

    try {
      await api.delete(`/hero/${id}`);
      Swal.fire("Deleted", "Banner removed successfully", "success");
      fetchSlides();
    } catch {
      Swal.fire("Error", "Failed to delete ❗", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <ImagePlus size={16} /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="h-[50vh] flex justify-center items-center">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-[700px] w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3">Image</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Subtitle</th>
                    <th className="p-3">Order</th>
                    <th className="p-3">Active</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {slides.map((s) => (
                    <tr key={s._id} className="border-b hover:bg-gray-100">
                      <td className="p-3">
                        <img
                          src={s.image?.url}
                          alt=""
                          className="w-20 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-3 font-medium">{s.title}</td>
                      <td className="p-3">{s.subtitle}</td>
                      <td className="p-3">{s.order}</td>
                      <td className="p-3">
                        <Switch
                          checked={s.isActive}
                          onCheckedChange={(val) =>
                            api
                              .put(`/hero/${s._id}`, { isActive: val })
                              .then(fetchSlides)
                          }
                        />
                      </td>

                      <td className="p-3 text-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(s)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(s._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {!slides.length && (
                    <tr>
                      <td colSpan={6} className="text-center p-5 text-gray-500">
                        No banners found ❗
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {formOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000] overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editId ? "Edit Banner" : "Create Banner"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Subtitle *</Label>
                <Input
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Button Text *</Label>
                <Input
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center justify-between border p-2 rounded">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v }))
                  }
                />
              </div>

              <div>
                <Label>Banner Image</Label>
                <Input type="file" accept="image/*" onChange={handleImage} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-full rounded-lg mt-3 h-40 object-cover"
                    alt="Preview"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2 text-sm">
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </span>
                  ) : editId ? (
                    "Save Changes"
                  ) : (
                    "Create Banner"
                  )}
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
