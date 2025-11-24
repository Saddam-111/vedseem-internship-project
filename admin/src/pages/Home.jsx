// src/pages/admin/Home.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";
import RevenueChart from "./RevenueChart";
import {
  FaBoxOpen,
  FaRupeeSign,
  FaBlog,
  FaShoppingCart,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaEye,
} from "react-icons/fa";

const smallCardClass =
  "rounded-lg p-5 shadow-sm bg-white flex items-center gap-4 hover:shadow-md transition";

const StatCard = ({ icon, title, value, meta, colorClass }) => (
  <div className={smallCardClass}>
    <div className={`p-3 rounded-lg ${colorClass} flex items-center justify-center text-white`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
      {meta && <p className="text-xs text-green-600 mt-1 flex items-center gap-2">{meta}</p>}
    </div>
  </div>
);

const Home = () => {
  const { baseUrl } = useContext(AuthDataContext);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalBlogs: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Fetch aggregated admin stats
  const fetchStats = async () => {
    if (!baseUrl) return;
    try {
      const res = await axios.get(`${baseUrl}/api/v1/admindata/stats`, { withCredentials: true });
      if (res.data && res.data.success) {
        // prefer returned shape, otherwise merge
        setStats((prev) => ({ ...prev, ...res.data }));
      } else if (res.data) {
        setStats((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      // silent fallback
      console.warn("Stats fetch failed:", err.message || err);
    }
  };

  // Fetch all products (used for low-stock + top products fallback)
  const fetchProducts = async () => {
    if (!baseUrl) return;
    try {
      const res = await axios.get(`${baseUrl}/api/v1/product/getProducts`, { withCredentials: true });
      const products = res.data.products || [];

      // Low stock => stock <= 5, sorted by lowest first, limit 6
      const low = products
        .map((p) => ({ ...p, stock: typeof p.stock === "number" ? p.stock : Number(p.stock || 0) }))
        .filter((p) => p.stock <= 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6);
      setLowStock(low);

      // Top products fallback: sort by numReviews * rating OR by createdAt
      const top = products
        .map((p) => ({
          _id: p._id,
          name: p.name,
          image: p.image?.url || (typeof p.image === "string" ? p.image : ""),
          soldCount: p.soldCount || p.sales || (p.numReviews ? p.numReviews * (p.rating || 1) : 0),
        }))
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 6);
      setTopProducts(top);
    } catch (err) {
      console.warn("Products fetch failed:", err.message || err);
    }
  };

  // Fetch recent orders (admin)
  const fetchOrders = async () => {
    if (!baseUrl) return;
    try {
      const res = await axios.get(`${baseUrl}/api/v1/order/all`, { withCredentials: true });
      const orders = res.data.orders || [];
      // Recent first
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      setRecentOrders(recent);

      // Build alert set from pending / failed payments
      const alertsArr = [];
      const pending = orders.filter((o) => !o.payment && o.paymentMethod !== "COD"); // unpaid online
      if (pending.length > 0) {
        alertsArr.push({ type: "payment", message: `${pending.length} online payments pending verification` });
      }
      const cancelRate = (orders.filter((o) => o.status === "Cancelled").length / Math.max(1, orders.length)) * 100;
      if (cancelRate > 10) {
        alertsArr.push({
          type: "cancellation",
          message: `High cancellation rate: ${cancelRate.toFixed(1)}%`,
        });
      }
      setAlerts(alertsArr);
    } catch (err) {
      console.warn("Orders fetch failed:", err.message || err);
    }
  };

  const loadAllData = async () => {
  await Promise.all([fetchStats(), fetchProducts(), fetchOrders()]);
};

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchProducts(), fetchOrders()]);
      if (mounted) setLoading(false);
    };
    loadAll();
    return () => (mounted = false);
  }, [baseUrl]);

  // helper: pretty time ago
  const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

const refresh = async () => {
  setIsRefreshing(true);
  await loadAllData();
  setIsRefreshing(false);
};

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Snapshot of your store activity and health</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:brightness-95 transition"
          >
            {isRefreshing? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-red-50 border-l-4 border-red-400 p-3 rounded">
              <FaExclamationTriangle className="text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-700">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaBoxOpen size={20} />}
          title="Total Products"
          value={loading ? "..." : stats.totalProducts ?? 0}
          meta={stats.totalProductsChange ? `${stats.totalProductsChange}%` : null}
          colorClass="bg-blue-500"
        />
        <StatCard
          icon={<FaRupeeSign size={20} />}
          title="Total Revenue"
          value={loading ? "..." : `₹${stats.totalRevenue ?? 0}`}
          meta={stats.revenueGrowth ? (
            <span className="flex items-center gap-2">
              {stats.revenueGrowth >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(stats.revenueGrowth ?? 0)}%
            </span>
          ) : null}
          colorClass="bg-green-500"
        />
        <StatCard
          icon={<FaBlog size={20} />}
          title="Total Blogs"
          value={loading ? "..." : stats.totalBlogs ?? 0}
          meta={null}
          colorClass="bg-purple-500"
        />
        <StatCard
          icon={<FaShoppingCart size={20} />}
          title="Total Orders"
          value={loading ? "..." : stats.totalOrders ?? 0}
          meta={stats.pendingOrders ? `${stats.pendingOrders} pending` : null}
          colorClass="bg-orange-500"
        />
      </div>

      {/* Main grid: left large + right column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue chart + recent orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Paid orders only · Monthly view</p>
              </div>
              <div className="text-sm text-gray-500">Last 12 months</div>
            </div>
            <RevenueChart />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Orders</h3>
              <div className="text-sm text-gray-500">{recentOrders.length} recent</div>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-gray-500">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between p-3 border rounded hover:shadow-sm transition">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                        {o.items?.length || 0}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{o._id}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {o.address?.firstName || "Customer"} • {o.paymentMethod || "COD"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">₹{(o.amount || 0).toFixed?.(2) ?? o.amount}</p>
                        <p className="text-xs text-gray-500">{timeAgo(o.createdAt)}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            o.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : o.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {o.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Low Stock + Top Products */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
              <div className="text-sm text-gray-500">Stock ≤ 5</div>
            </div>

            {lowStock.length === 0 ? (
              <div className="text-gray-500">All products healthy</div>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((p) => (
                  <li key={p._id} className="flex items-center justify-between gap-3 border rounded p-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image?.url || "https://via.placeholder.com/60"} alt={p.name} className="w-12 h-12 object-cover rounded" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.category} · {p.subCategory}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-semibold text-red-600">Stock: {p.stock}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`/lists`, "_self")}
                          className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => window.open(p.image?.url || "#", "_blank")}
                          className="text-xs px-3 py-1 rounded bg-yellow-50 text-yellow-700"
                        >
                          View Image
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Selling Products</h3>
              <div className="text-sm text-gray-500">By sales estimate</div>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-gray-500">No product data</p>
            ) : (
              <ul className="space-y-3">
                {topProducts.map((p, idx) => (
                  <li key={p._id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-sm font-medium px-2">{idx + 1}</div>
                      <img src={p.image || "https://via.placeholder.com/48"} alt={p.name} className="w-10 h-10 object-cover rounded" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">Sold est: {Math.round(p.soldCount || 0)}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">View</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick actions */}
          {/* Quick actions */}
<div className="bg-white p-4 rounded-lg shadow-sm">
  <h4 className="font-semibold mb-2">Quick Actions</h4>
  <div className="flex flex-col gap-2">

    <button
      onClick={() => window.open("/lists", "_self")}
      className="w-full py-2 rounded border hover:bg-amber-500 cursor-pointer "
    >
      Manage Products
    </button>

    <button
      onClick={() => window.open("/blog-list", "_self")}
      className="w-full py-2 rounded border hover:bg-amber-500 cursor-pointer"
    >
      Manage Blogs
    </button>

    <button
      onClick={() => window.open("/orders", "_self")}
      className="w-full py-2 rounded border hover:bg-amber-500 cursor-pointer"
    >
      View Orders
    </button>
  </div>
</div>

        </div>
      </div>

      {/* Footer small */}
      <div className="mt-8 text-xs text-gray-500 flex items-center gap-3">
        <FaClock /> <span>Data updates on page load and when you click Refresh.</span>
      </div>
    </div>
  );
};

export default Home;
