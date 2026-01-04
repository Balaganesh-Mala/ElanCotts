import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../services/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";

/* ================= HELPERS ================= */
const getMinPrice = (variants = []) => {
  const prices = variants.flatMap(
    (v) => v.sizes?.map((s) => Number(s.price) || 0) || []
  );
  return prices.length ? Math.min(...prices) : 0;
};

const getTotalStock = (variants = []) =>
  variants.reduce(
    (sum, v) =>
      sum + (v.sizes?.reduce((s, x) => s + Number(x.stock || 0), 0) || 0),
    0
  );

const ProductManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PRODUCTS (ADMIN) ================= */
  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= TOGGLE HANDLER (PUT) ================= */
  const handleToggle = async (productId, field, value) => {
    try {
      const fd = new FormData();

      fd.append(
        "productData",
        JSON.stringify({
          [field]: value,
        })
      );

      await api.put(`/products/${productId}`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, [field]: value } : p))
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", `Failed to update ${field}`, "error");
    }
  };

  /* ================= ACTIONS ================= */
  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Deactivate product?",
      text: "Product will be hidden but not deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate",
    });

    if (!r.isConfirmed) return;

    try {
      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // ✅ UPDATE STATE, DON'T REMOVE
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: false } : p))
      );

      Swal.fire("Deactivated", "Product hidden successfully", "success");
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">Admin Product Manager</h1>

        <Button onClick={() => navigate("/admin/products/add")}>
          + Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Best</th>
                  <th className="p-3">New</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const price = getMinPrice(p.variants);
                  const stock = getTotalStock(p.variants);

                  return (
                    <tr key={p._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.brand}</div>
                      </td>

                      <td className="p-3">
                        {p.category?.name || "—"}
                        {p.subCategory?.name && (
                          <div className="text-xs text-gray-500">
                            {p.subCategory.name}
                          </div>
                        )}
                      </td>

                      <td className="p-3 font-medium">
                        ₹{price.toLocaleString()}
                      </td>

                      <td className="p-3">{stock}</td>

                      {[
                        "isActive",
                        "isFeatured",
                        "isBestSeller",
                        "isNewArrival",
                      ].map((field) => (
                        <td key={field} className="p-3">
                          <Switch
                            checked={p.isActive}
                            onCheckedChange={(val) =>
                              handleToggle(p._id, "isActive", val)
                            }
                          />
                        </td>
                      ))}

                      <td className="p-3 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(p._id)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p._id)}
                        >
                          Deactivate
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center p-6 text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManager;
