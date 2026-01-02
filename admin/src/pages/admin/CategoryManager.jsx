import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Loader2, ImagePlus, ChevronRight } from "lucide-react";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    parent: "",
    order: 1,
    showInMenu: true,
    isActive: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    categoryImage: null,
  });

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      const [flatRes, treeRes] = await Promise.all([
        api.get("/categories"),
        api.get("/categories/tree/all"),
      ]);

      setCategories(flatRes.data.categories || []);
      setTree(treeRes.data.categories || []);
    } catch {
      Swal.fire("Error", "Failed to load categories", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FORM ================= */
  const openCreate = () => {
    setEditMode(false);
    setCurrentId(null);
    setForm({
      name: "",
      description: "",
      parent: "",
      order: 1,
      showInMenu: true,
      isActive: true,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      categoryImage: null,
    });
    setPreview("");
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditMode(true);
    setCurrentId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
      parent: c.parent || "",
      order: c.order || 1,
      showInMenu: c.showInMenu,
      isActive: c.isActive,
      seoTitle: c.seo?.title || "",
      seoDescription: c.seo?.description || "",
      seoKeywords: c.seo?.keywords?.join(", ") || "",
      categoryImage: null,
    });
    setPreview(c.image?.url || "");
    setShowForm(true);
  };

  const handleImagePick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      setForm((p) => ({ ...p, categoryImage: file }));
      setPreview(URL.createObjectURL(file));
    };
    input.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("order", form.order);
    fd.append("showInMenu", form.showInMenu);
    fd.append("isActive", form.isActive);

    if (form.parent) fd.append("parent", form.parent);
    if (form.categoryImage) fd.append("categoryImage", form.categoryImage);

    fd.append("seo.title", form.seoTitle);
    fd.append("seo.description", form.seoDescription);

    form.seoKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .forEach((k) => fd.append("seo.keywords[]", k));

    try {
      setLoading(true);

      if (editMode) {
        await api.put(`/categories/${currentId}`, fd);
        Swal.fire("Updated", "Category updated", "success");
      } else {
        await api.post("/categories", fd);
        Swal.fire("Created", "Category created", "success");
      }

      setShowForm(false);
      loadData();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TREE RENDER ================= */
  const renderTree = (nodes, depth = 0) =>
    nodes.map((c) => (
      <div key={c._id} style={{ marginLeft: depth * 16 }}>
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            {depth > 0 && <ChevronRight size={14} />}
            <span className="font-medium">{c.name}</span>
            <span className="text-xs text-gray-500">
              (Level {c.level})
            </span>
          </div>

          <button
            onClick={() => openEdit(c)}
            className="text-sm text-indigo-600 hover:underline"
          >
            Edit
          </button>
        </div>

        {c.children?.length > 0 && renderTree(c.children, depth + 1)}
      </div>
    ));

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Create Category
        </button>
      </div>

      {/* TREE VIEW */}
      <div className="border rounded-xl p-4 bg-white">
        <h2 className="font-semibold mb-3">Category Tree</h2>
        {tree.length ? renderTree(tree) : "No categories"}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {editMode ? "Edit Category" : "Create Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* IMAGE */}
              <div
                onClick={handleImagePick}
                className="h-36 border rounded-lg flex items-center justify-center cursor-pointer"
              >
                {preview ? (
                  <img src={preview} className="h-full object-cover" />
                ) : (
                  <ImagePlus />
                )}
              </div>

              <input
                name="name"
                placeholder="Category Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
              />

              <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* PARENT DROPDOWN */}
              <select
                name="parent"
                value={form.parent}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">No Parent (Main Category)</option>
                {categories
                  .filter((c) => c.level === 1 && c._id !== currentId)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                name="seoTitle"
                placeholder="SEO Title"
                value={form.seoTitle}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                name="seoDescription"
                placeholder="SEO Description"
                value={form.seoDescription}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                name="seoKeywords"
                placeholder="SEO Keywords (comma separated)"
                value={form.seoKeywords}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
