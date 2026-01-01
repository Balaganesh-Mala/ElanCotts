import React, { useEffect, useState } from "react";
import api from "../../services/api";

import { Button } from "../../components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Switch } from "../../components/ui/switch.jsx";
import { Loader2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Overlay form state
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("User fetch error:", err);
      Swal.fire("Error", "Failed to fetch users ❗", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = async (id, field, value) => {
    try {
      await api.put(`/users/${id}`, { [field]: value });
      fetchUsers();
    } catch {
      Swal.fire("Error", "Failed to update user ❗", "error");
    }
  };

  const openAddForm = () => {
    setEditId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "user",
      isActive: true,
    });
    setFormOpen(true);
  };

  const openEditForm = (u) => {
    setEditId(u._id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (!editId) {
        await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        });

        Swal.fire("Created!", "User registered ✅", "success");
      } else {
        await api.put(`/users/${editId}`, {
          name: form.name,
          phone: form.phone,
          isActive: form.isActive,
        });

        Swal.fire("Updated!", "User updated ✅", "success");
      }

      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("User submit error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Delete user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete it!",
    });

    if (r.isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        Swal.fire("Deleted!", "User removed ✅", "success");
        fetchUsers();
      } catch {
        Swal.fire("Error", "Failed to delete ❗", "error");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">User Management</h1>

        <Button onClick={openAddForm} className="flex items-center gap-2">
          <UserPlus size={16} /> Add User
        </Button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : (
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-[600px] w-full text-xs md:text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left font-semibold text-gray-700">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Active</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b hover:bg-gray-100 transition"
                    >
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.phone || "-"}</td>
                      <td className="p-3 capitalize">{u.role}</td>

                      <td className="p-3">
                        <Switch
                          checked={u.isActive}
                          onCheckedChange={(val) =>
                            handleToggle(u._id, "isActive", val)
                          }
                        />
                      </td>

                      <td className="p-3 space-x-2 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditForm(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(u._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {!users.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-500 p-6"
                      >
                        No users found ❗
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overlay Form — FIXED */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-10 px-4 z-[1000]">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5">

            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus size={18} />{" "}
              {editId ? "Edit User" : "Register New User"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {!editId && (
                <div>
                  <Label>Password *</Label>
                  <Input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center justify-between border p-2 rounded">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(val) =>
                    setForm((prev) => ({ ...prev, isActive: val }))
                  }
                />
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
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </span>
                  ) : editId ? (
                    "Save User"
                  ) : (
                    "Register User"
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

export default UserManagement;
