import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";
import { AdminDataContext } from "../context/AdminContext";
import RevenueChart from "./RevenueChart";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaRupeeSign,
  FaBlog,
  FaShoppingCart,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaUsers,
  FaStar,
  FaChartLine,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaCog,
  FaUserAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, title, value, trend, trendValue, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: color }}>{value}</p>
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-3">
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
        </span>
        <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trendValue}%
        </span>
        <span className="text-xs text-gray-400 ml-1">vs last month</span>
      </div>
    )}
  </motion.div>
);

const OrderCard = ({ order, onStatusChange, delay }) => {
  const statusConfig = {
    "Order Placed": { color: "bg-blue-100 text-blue-700", icon: FaClock },
    "Processing": { color: "bg-yellow-100 text-yellow-700", icon: FaClock },
    "Shipped": { color: "bg-purple-100 text-purple-700", icon: FaTruck },
    "Out for Delivery": { color: "bg-indigo-100 text-indigo-700", icon: FaTruck },
    "Delivered": { color: "bg-green-100 text-green-700", icon: FaCheckCircle },
    "Cancelled": { color: "bg-red-100 text-red-700", icon: FaTimesCircle },
    "Returned": { color: "bg-gray-100 text-gray-700", icon: FaArrowDown },
  };
  const config = statusConfig[order.status] || statusConfig["Order Placed"];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold">
            {(order.address?.firstName || "C")[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {order.address?.firstName || "Customer"} {order.address?.lastName || ""}
            </p>
            <p className="text-xs text-gray-500">#{order._id?.slice(-8)}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
          <StatusIcon className="inline mr-1" size={10} />
          {order.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-gray-500">{order.items?.length || 0} items</p>
          <p className="font-semibold text-gray-900">₹{(order.amount || 0).toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">
            {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </p>
          <p className={`text-xs font-medium ${order.payment ? 'text-green-600' : 'text-orange-600'}`}>
            {order.payment ? "Paid" : "Unpaid"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const LowStockItem = ({ product, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.2 }}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors group"
  >
    <img
      src={product.image?.url || "https://via.placeholder.com/60"}
      alt={product.name}
      className="w-12 h-12 object-cover rounded-lg"
    />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">{product.name}</p>
      <p className="text-xs text-gray-500">{product.category}</p>
    </div>
    <div className="text-right">
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
        {product.stock} left
      </span>
    </div>
  </motion.div>
);

const Home = () => {
  const { baseUrl } = useContext(AuthDataContext);
  const { adminData, getAdmin } = useContext(AdminDataContext);
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [demandAnalysis, setDemandAnalysis] = useState("");
  const [analyzingDemand, setAnalyzingDemand] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const fetchStats = async () => {
    if (!baseUrl) return;
    try {
      const res = await axios.get(`${baseUrl}/api/v1/admindata/stats`, {
        withCredentials: true,
      });
      if (res.data && res.data.success) {
        setStats((prev) => ({ ...prev, ...res.data }));
      } else if (res.data) {
        setStats((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn("Stats fetch failed:", err.message || err);
    }
  };

  const fetchProducts = async () => {
    if (!baseUrl) return;
    try {
      const res = await axios.get(`${baseUrl}/api/v1/product/getProducts`, {
        withCredentials: true,
      });
      const products = res.data.products || [];

      const low = products
        .map((p) => ({
          ...p,
          stock: typeof p.stock === "number" ? p.stock : Number(p.stock || 0),
        }))
        .filter((p) => p.stock <= 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
      setLowStock(low);
    } catch (err) {
      console.warn("Products fetch failed:", err.message || err);
    }
  };

  const fetchOrders = async () => {
    if (!baseUrl) return;
    try {
      const res = await axios.get(`${baseUrl}/api/v1/order/all`, {
        withCredentials: true,
      });
      const orders = res.data.orders || [];

      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(recent);

      const alertsArr = [];
      const pending = orders.filter(
        (o) => !o.payment && o.paymentMethod !== "COD",
      );
      if (pending.length > 0) {
        alertsArr.push({
          type: "payment",
          message: `${pending.length} payments pending verification`,
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

  const refresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (adminData) {
      setProfileData((prev) => ({
        ...prev,
        name: adminData.name || "",
        email: adminData.email || "",
        phone: adminData.phone || "",
      }));
    }
  }, [adminData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setProfileMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setProfileLoading(true);
    try {
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
      };
      
      if (profileData.currentPassword && profileData.newPassword) {
        payload.currentPassword = profileData.currentPassword;
        payload.newPassword = profileData.newPassword;
      }

      const result = await axios.put(
        `${baseUrl}/api/v1/auth/updateAdmin`,
        payload,
        { withCredentials: true }
      );

      if (result.data.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        getAdmin();
        setProfileData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setProfileMsg({ type: "error", text: result.data.message || "Update failed" });
      }
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await axios.post(`${baseUrl}/api/v1/auth/logout`, {}, { withCredentials: true });
        window.location.href = "/login";
      } catch (err) {
        window.location.href = "/login";
      }
    }
  };

  const analyzeDemand = async () => {
    setAnalyzingDemand(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/v1/ai/analyze-demand`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setDemandAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Demand analysis error:", error);
      alert("Failed to analyze demand");
    } finally {
      setAnalyzingDemand(false);
    }
  };

  const orderStats = [
    { icon: FaShoppingCart, title: "Total Orders", value: loading ? "..." : stats.totalOrders, color: "#6366f1", trend: "up", trendValue: 12 },
    { icon: FaClock, title: "Pending", value: loading ? "..." : stats.pendingOrders, color: "#f59e0b", trend: "down", trendValue: 5 },
    { icon: FaCheckCircle, title: "Delivered", value: loading ? "..." : stats.deliveredOrders, color: "#10b981", trend: "up", trendValue: 18 },
    { icon: FaTimesCircle, title: "Cancelled", value: 0, color: "#ef4444", trend: null },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="flex-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-yellow-100 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-white font-medium hover:bg-white/30 transition flex items-center gap-2"
              >
                <motion.span
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block"
                >
                  <FaClock />
                </motion.span>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={() => window.location.href = "/add"}
                className="px-4 py-2 bg-white text-yellow-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2"
              >
                <FaPlus /> Add Product
              </button>
            </div>
          </div>
        </motion.div>

        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Attention Required</p>
              <p className="text-sm text-red-600">{alerts[0].message}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FaBoxOpen}
            title="Products"
            value={loading ? "..." : stats.totalProducts}
            color="#6366f1"
            trend="up"
            trendValue={8}
            delay={0.1}
          />
          <StatCard
            icon={FaRupeeSign}
            title="Revenue"
            value={loading ? "..." : `₹${(stats.totalRevenue || 0).toLocaleString()}`}
            color="#10b981"
            trend="up"
            trendValue={23}
            delay={0.2}
          />
          <StatCard
            icon={FaBlog}
            title="Blogs"
            value={loading ? "..." : stats.totalBlogs}
            color="#8b5cf6"
            delay={0.3}
          />
          <StatCard
            icon={FaShoppingCart}
            title="Orders"
            value={loading ? "..." : stats.totalOrders}
            color="#f59e0b"
            trend="up"
            trendValue={15}
            delay={0.4}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Monthly revenue from paid orders</p>
            </div>
            <div className="flex gap-2">
              {['Last 7 Days', 'Last 30 Days', 'Last 12 Months'].map((period, i) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    i === 2 ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <RevenueChart />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Latest customer orders</p>
            </div>
            <button
              onClick={() => window.location.href = "/orders"}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center py-8">No recent orders</p>
            ) : (
              recentOrders.map((order, i) => (
                <OrderCard key={order._id} order={order} delay={0.5 + i * 0.1} />
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Low Stock Alert</h3>
                <p className="text-xs text-red-100">{lowStock.length} products need attention</p>
              </div>
              <FaExclamationTriangle className="text-red-200" size={20} />
            </div>
          </div>
          <div className="p-3 max-h-80 overflow-y-auto">
            {lowStock.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaCheckCircle className="mx-auto mb-2 text-green-500" size={24} />
                <p className="text-sm">All products well stocked</p>
              </div>
            ) : (
              <div className="space-y-1">
                {lowStock.map((product, i) => (
                  <LowStockItem key={product._id} product={product} delay={0.3 + i * 0.1} />
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => window.location.href = "/lists"}
              className="w-full py-2 text-sm text-center text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Manage Inventory →
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            {orderStats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon size={14} style={{ color: stat.color }} />
                  </div>
                  <span className="text-sm text-gray-600">{stat.title}</span>
                </div>
                <span className="font-semibold" style={{ color: stat.color }}>{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.location.href = "/add"}
              className="p-3 flex flex-col items-center gap-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition"
            >
              <FaPlus className="text-yellow-600" />
              <span className="text-xs font-medium text-gray-700">Add Product</span>
            </button>
            <button
              onClick={() => window.location.href = "/lists"}
              className="p-3 flex flex-col items-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
            >
              <FaEdit className="text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Manage</span>
            </button>
            <button
              onClick={() => window.location.href = "/orders"}
              className="p-3 flex flex-col items-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition"
            >
              <FaShoppingCart className="text-purple-600" />
              <span className="text-xs font-medium text-gray-700">Orders</span>
            </button>
            <button
              onClick={() => window.location.href = "/add-blogs"}
              className="p-3 flex flex-col items-center gap-2 rounded-xl bg-green-50 hover:bg-green-100 transition"
            >
              <FaBlog className="text-green-600" />
              <span className="text-xs font-medium text-gray-700">Add Blog</span>
            </button>
            <button
              onClick={() => setShowDemandModal(true)}
              className="p-3 flex flex-col items-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition"
            >
              <FaChartLine className="text-purple-600" />
              <span className="text-xs font-medium text-gray-700">Demand AI</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold">
              A
            </div>
            <div>
              <p className="font-medium">{profileData.name || "Admin"}</p>
              <p className="text-xs text-gray-400">{profileData.email || "admin@example.com"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Last login: Today at 10:00 AM
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex-1 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
            >
              <FaCog /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="py-2 px-3 text-sm bg-red-500/20 rounded-lg hover:bg-red-500/40 transition text-red-300"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </motion.div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Profile Settings</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-4 space-y-4">
              {profileMsg.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  profileMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {profileMsg.text}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="relative">
                  <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Change Password (Optional)</p>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Confirm</label>
                    <input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                      placeholder="Confirm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDemandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FaChartLine /> AI Demand Analysis
                </h3>
                <button onClick={() => setShowDemandModal(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {!demandAnalysis && !analyzingDemand && (
                <div className="text-center py-8">
                  <FaChartLine className="mx-auto text-4xl text-purple-300 mb-4" />
                  <p className="text-gray-600 mb-4">Analyze your product demand to get insights on what to add more of.</p>
                  <button
                    onClick={analyzeDemand}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Start Analysis
                  </button>
                </div>
              )}
              {analyzingDemand && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your product data...</p>
                </div>
              )}
              {demandAnalysis && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{demandAnalysis}</pre>
                </div>
              )}
            </div>
            {demandAnalysis && (
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={analyzeDemand}
                  disabled={analyzingDemand}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                >
                  Re-analyze
                </button>
                <button
                  onClick={() => setShowDemandModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;
