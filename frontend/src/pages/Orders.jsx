import React, { useState, useEffect } from "react";
import { getMyOrders } from "../api/order.api.js";
import { Loader2 } from "lucide-react";
import Button from "../components/ui/button.jsx";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const PER_PAGE = 8;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const loadOrders = async () => {
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getMyOrders();
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error("Order fetch error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(orders.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const paginated = orders.slice(start, start + PER_PAGE);

  /* ================= STATUS BADGE ================= */
  const statusStyle = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    if (status.toLowerCase().includes("delivered"))
      return "bg-green-100 text-green-700";
    if (status.toLowerCase().includes("cancel"))
      return "bg-red-100 text-red-700";
    if (status.toLowerCase().includes("shipped"))
      return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 py-12">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Order History
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View your past purchases and order details
          </p>
        </header>

        {/* GUEST STATE */}
        {!token && (
          <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500 mb-4">
              Please login to view your orders.
            </p>
            <Button onClick={() => navigate("/login")}>
              Login to Continue
            </Button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          token && (
            <>
              {/* EMPTY STATE */}
              {!orders.length && (
                <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
                  <p className="text-gray-500 mb-4">
                    You haven’t placed any orders yet.
                  </p>
                  <Button onClick={() => navigate("/shop")}>
                    Start Shopping
                  </Button>
                </div>
              )}

              {/* TABLE */}
              {orders.length > 0 && (
                <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                          Order ID
                        </th>
                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                          Items
                        </th>
                        <th className="px-5 py-4 text-center font-semibold text-gray-700">
                          Payment
                        </th>
                        <th className="px-5 py-4 text-center font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-5 py-4 text-right font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginated.map((o) => (
                        <tr
                          key={o._id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="px-5 py-4 font-semibold text-gray-900">
                            {o.orderNo || o._id.slice(-8)}
                          </td>

                          <td className="px-5 py-4 text-gray-700 max-w-[280px]">
                            <p className="line-clamp-2">
                              {o.orderItems
                                ?.map((i) => `${i.name} (${i.size})`)
                                .join(", ")}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-center text-gray-700">
                            {o.paymentMethod}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                                o.orderStatus
                              )}`}
                            >
                              {o.orderStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-gray-900">
                            ₹{(o.totalPrice || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )
        )}

        {/* PAGINATION */}
        {!loading && token && totalPages > 1 && (
          <footer className="flex justify-end gap-3 mt-8">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </footer>
        )}
      </div>
    </main>
  );
};

export default Orders;
