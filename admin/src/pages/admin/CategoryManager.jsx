import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Switch } from "../../components/ui/switch.jsx";
import { Loader2, ImagePlus } from "lucide-react";
import Swal from "sweetalert2";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);

  // 🔥 Controls modal form
  const [showForm, setShowForm] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    image: null,
  });

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch {
      Swal.fire("Error", "Failed to load categories ❗", "error");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateForm = () => {
    setEditMode(false);
    setCurrentId(null);
    setForm({ name: "", description: "", isActive: true, image: null });
    setPreview("");
    setShowForm(true);
  };

  const startEdit = (c) => {
    setEditMode(true);
    setCurrentId(c._id);
    setForm({
      name: c.name,
      description: c.description,
      isActive: c.isActive,
      image: null,
    });
    setPreview(c.image?.url || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const handleImagePick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    };

    input.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("isActive", form.isActive);
    if (form.image) fd.append("image", form.image);

    try {
      setSubmitting(true);

      if (editMode) {
        await api.put(`/categories/${currentId}`, fd);
        Swal.fire("Updated!", "Category updated!", "success");
      } else {
        await api.post("/categories", fd);
        Swal.fire("Created!", "Category created!", "success");
      }

      loadCategories();
      setShowForm(false);

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed!", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto p-6 space-y-6">

      {/* =====================================
          HEADER + CREATE BUTTON
      ====================================== */}
      <div className="flex justify-end">
        <Button onClick={openCreateForm}>Create Category</Button>
      </div>

      {/* =====================================
          TABLE ALWAYS VISIBLE
      ====================================== */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr className="text-left">
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Active</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((c) => (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <img src={c.image?.url} className="h-12 w-12 rounded object-cover" />
                    </td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.description}</td>
                    <td className="p-3">
                      <Switch checked={c.isActive} disabled />
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}

                {!categories.length && (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* =====================================
          MODAL FORM (TOGGLE)
      ====================================== */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fadeIn p-6 relative">

            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Edit Category" : "Create Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Image Picker */}
              <div
                className="w-full h-40 border rounded-xl flex items-center justify-center bg-gray-50 cursor-pointer"
                onClick={handleImagePick}
              >
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-gray-500" />
                )}
              </div>

              {/* Name */}
              <div>
                <Label>Category Name *</Label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>

              {/* Description */}
              <div>
                <Label>Description *</Label>
                <Input name="description" value={form.description} onChange={handleChange} required />
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between border p-2 rounded-lg">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(val) => setForm((p) => ({ ...p, isActive: val }))}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>

                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </span>
                  ) : editMode ? "Save Changes" : "Create"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryManager;
