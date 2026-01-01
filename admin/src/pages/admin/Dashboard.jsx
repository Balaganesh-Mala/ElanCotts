// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Colors for charts
const COLORS = ["#0088FE", "#FFBB28", "#FF8042", "#00C49F"];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        const ordersRes = await api.get("/orders");
        const productsRes = await api.get("/products");

        setStats(res.data.stats);

        const orders = ordersRes.data.orders;
        const products = productsRes.data.products;

        // -----------------------------
        // Monthly Revenue Analytics
        // -----------------------------
        const monthlyMap = {};
        orders.forEach((o) => {
          const m = new Date(o.createdAt).toLocaleString("default", {
            month: "short",
          });
          monthlyMap[m] = (monthlyMap[m] || 0) + o.totalPrice;
        });

        const monthlyArray = Object.entries(monthlyMap).map(([month, revenue]) => ({
          month,
          revenue,
        }));

        setMonthlyData(monthlyArray);

        // -----------------------------
        // Order Status Distribution
        // -----------------------------
        const statusMap = {};
        orders.forEach((o) => {
          statusMap[o.orderStatus] = (statusMap[o.orderStatus] || 0) + 1;
        });

        const statusArray = Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
        }));

        setOrderStatusData(statusArray);

        // -----------------------------
        // Product Category Analytics
        // -----------------------------
        const categoryMap = {};
        products.forEach((p) => {
          const cat = p.category?.name || "Unknown";
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        const catArray = Object.entries(categoryMap).map(([category, count]) => ({
          category,
          count,
        }));

        setCategoryData(catArray);
      } catch (err) {
        console.error("Dashboard stats error", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-semibold">Overview</h2>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUsers ?? "--"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalOrders ?? "--"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalProducts ?? "--"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{stats?.totalRevenue ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <h2 className="text-xl font-semibold">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={260} data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={3} dot />
            </LineChart>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={orderStatusData}
                dataKey="count"
                nameKey="status"
                outerRadius={110}
                label
              >
                {orderStatusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      {/* Category Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Top Product Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={600} height={300} data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#00C49F" />
          </BarChart>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
