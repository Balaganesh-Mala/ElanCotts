import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../services/api"; // admin API
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card.jsx";
import { Switch } from "../../components/ui/switch.jsx";

/* ================= HELPERS ================= */
const getMinPrice = (variants = []) => {
  const prices = variants.flatMap(v =>
    v.sizes?.map(s => s.price) || []
  );
  return prices.length ? Math.min(...prices) : 0;
};

const getTotalStock = (variants = []) => {
  return variants.reduce((sum, v) => {
    return sum + (v.sizes?.reduce((s, size) => s + size.stock, 0) || 0);
  }, 0);
};

const ProductManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");

      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch error", err);
      Swal.fire("Error", "Failed to fetch products ❗", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= TOGGLES ================= */
  const handleToggle = async (id, field, value) => {
    try {
      await api.put(`/products/${id}`, { [field]: value });
      loadProducts();
    } catch {
      Swal.fire("Error", `Failed to update ${field}`, "error");
    }
  };

  /* ================= ACTIONS ================= */
  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({
      title: "Delete product?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!r.isConfirmed) return;

    try {
      await api.delete(`/products/${id}`);
      Swal.fire("Deleted!", "Product deleted successfully", "success");
      loadProducts();
    } catch {
      Swal.fire("Error", "Delete failed ❗", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Admin Product Manager
        </h1>

        <Button onClick={() => navigate("/admin/products/add")}>
          + Add Product
        </Button>
      </div>

      {/* TABLE */}
      <Card className="shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle>All Products</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-[900px] w-full text-xs md:text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left font-semibold text-gray-700">
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Best Seller</th>
                  <th className="p-3">New Arrival</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const price = getMinPrice(p.variants);
                  const stock = getTotalStock(p.variants);

                  return (
                    <tr
                      key={p._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3">
                        <div className="font-medium text-gray-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.brand}
                        </div>
                      </td>

                      <td className="p-3">
                        {p.category?.name || "—"}
                      </td>

                      <td className="p-3 font-medium">
                        ₹{price.toLocaleString()}
                      </td>

                      <td className="p-3">
                        {stock}
                      </td>

                      <td className="p-3">
                        <Switch
                          checked={p.isActive}
                          onCheckedChange={(val) =>
                            handleToggle(p._id, "isActive", val)
                          }
                        />
                      </td>

                      <td className="p-3">
                        <Switch
                          checked={p.isFeatured}
                          onCheckedChange={(val) =>
                            handleToggle(p._id, "isFeatured", val)
                          }
                        />
                      </td>

                      <td className="p-3">
                        <Switch
                          checked={p.isBestSeller}
                          onCheckedChange={(val) =>
                            handleToggle(p._id, "isBestSeller", val)
                          }
                        />
                      </td>

                      <td className="p-3">
                        <Switch
                          checked={p.isNewArrival}
                          onCheckedChange={(val) =>
                            handleToggle(p._id, "isNewArrival", val)
                          }
                        />
                      </td>

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
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center p-6 text-gray-500">
                      No products found ❗
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
