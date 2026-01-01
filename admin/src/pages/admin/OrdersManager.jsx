import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load orders", "error");
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setStatusUpdating(true);
      await api.put(`/orders/${orderId}/status`, { status });

      Swal.fire("Updated", "Order status updated successfully", "success");

      loadOrders();

      setSelectedOrder((prev) =>
        prev ? { ...prev, orderStatus: status } : prev
      );

      setStatusUpdating(false);
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Orders</h2>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Orders</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium">Order No</th>
                  <th className="py-3 px-4 text-left font-medium">User</th>
                  <th className="py-3 px-4 text-left font-medium">Total</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-center font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      {o.orderNo || o._id.slice(-6)}
                    </td>
                    <td className="py-3 px-4">{o.user?.name || "Guest"}</td>
                    <td className="py-3 px-4">₹{o.totalPrice}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(o.orderStatus)}>
                        {o.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedOrder(o)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}

                {!orders.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* -------------------- MODAL -------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 pb-5">
          <div className="w-full max-w-3xl bg-white/95 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-5 bg-gray-100 border-b">
              <h2 className="text-xl font-bold">
                Order #{selectedOrder.orderNo}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Customer */}
              <div>
                <h3 className="font-semibold mb-1">Customer</h3>
                <p>{selectedOrder.user?.name || "Guest Checkout"}</p>
                <p className="text-gray-500 text-sm">
                  {selectedOrder.user?.email}
                </p>
              </div>

              {/* Address */}
              <div className="p-4 bg-gray-50 rounded-xl border space-y-1">
                <h3 className="font-semibold mb-1">Shipping Address</h3>
                <p>{selectedOrder.shippingAddress?.name}</p>
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} -{" "}
                  {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="flex items-center gap-2">
                  {selectedOrder.shippingAddress?.phone}
                </p>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Payment Method</h3>
                  <Badge>{selectedOrder.paymentMethod}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Payment Status</h3>
                  <Badge>{selectedOrder.paymentStatus}</Badge>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>

                <div className="max-h-52 overflow-y-auto border rounded-xl divide-y bg-white">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 items-center">
                      <img
                        src={item.image}
                        className="w-16 h-16 rounded-lg object-cover border"
                        alt=""
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                        {item.size && (
                          <Badge className="text-xs mt-1">
                            Size: {item.size}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Status */}
              <div className="relative z-[3999] overflow-visible mt-6">
                <h3 className="font-semibold mb-3">Update Order Status</h3>

                <Select
                  defaultValue={selectedOrder.orderStatus}
                  onValueChange={(v) => updateStatus(selectedOrder._id, v)}
                >
                  <SelectTrigger className="w-full h-11 border-gray-300 shadow-sm">
                    <SelectValue placeholder="Choose Status" />
                  </SelectTrigger>

                  <SelectContent className="z-[99999] relative">
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {statusUpdating && (
                  <p className="text-sm mt-2 text-gray-500 animate-pulse">
                    Updating status...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
