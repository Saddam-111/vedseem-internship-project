import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaClock,
  FaTruck,
} from "react-icons/fa";
import { UserDataContext } from "../context/UserContext";

/**
 * Updated Orders.jsx
 * - Shopify style (clean, soft shadows, good spacing)
 * - Icon + chip badges (style C)
 * - Medium product images (80x80)
 * - Mobile-first responsive layout
 * - Polling every 10s, initial loader only
 * - Better UX for cancel action and empty state
 */

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { baseUrl } = useContext(UserDataContext);
  const navigate = useNavigate();

  // fetchOrders will not toggle loading on each poll, only on initial load
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/v1/order/myOrders`, {
        withCredentials: true,
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status) => {
    // Icon chip style (C) - icon + text
    const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Order Placed":
        return <span className={`${base} bg-yellow-50 text-yellow-800 border border-yellow-100`}><FaBox /> {status}</span>;
      case "Processing":
        return <span className={`${base} bg-orange-50 text-orange-800 border border-orange-100`}><FaClock /> {status}</span>;
      case "Shipped":
        return <span className={`${base} bg-indigo-50 text-indigo-800 border border-indigo-100`}><FaTruck /> {status}</span>;
      case "Out for Delivery":
        return <span className={`${base} bg-purple-50 text-purple-800 border border-purple-100`}><FaShippingFast /> {status}</span>;
      case "Delivered":
        return <span className={`${base} bg-green-50 text-green-800 border border-green-100`}><FaCheckCircle /> {status}</span>;
      case "Cancelled":
        return <span className={`${base} bg-red-50 text-red-800 border border-red-100`}><FaTimesCircle /> {status}</span>;
      case "Returned":
        return <span className={`${base} bg-gray-50 text-gray-800 border border-gray-100`}><FaTimesCircle /> {status}</span>;
      default:
        return <span className={`${base} bg-gray-50 text-gray-800 border border-gray-100`}><FaBox /> {status}</span>;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const { data } = await axios.put(
        `${baseUrl}/api/v1/order/cancel/${orderId}`,
        {},
        { withCredentials: true }
      );
      alert("✅ Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      console.error("Cancel order error:", err.response?.data || err);
      alert("❌ Failed to cancel order");
    }
  };

  // Loader (initial)
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );

  // Empty state
  if (!orders || orders.length === 0)
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-full hover:shadow-md transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">You have no orders yet</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaBox size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg mb-6">No orders found</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );

  // Helper to format date/time for display
  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Small helper to render product rows
  const ProductRow = ({ item }) => (
    <div className="flex items-start gap-4">
      <img
        src={item.image?.url || "https://via.placeholder.com/80"}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
        width={80}
        height={80}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">Quantity: {item.quantity} × ₹{item.price}</p>
      </div>
      <div className="text-right self-center">
        <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-8xl mx-auto sm:p-6">
      {/* Header */}
      <div className="sticky top-4 z-20 bg-yellow-400 rounded-md">
        <div className="flex items-center p-3 gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-full hover:shadow-md transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">
              {orders.length} order{orders.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order._id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-4 sm:p-6"
          >
            {/* Top row: Order title + status chip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Order #{order._id.slice(-8)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{formatDateTime(order.createdAt)}</p>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {order.items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <ProductRow item={item} />
                  </div>

                  {/* Customization block (if exists) */}
                  {item.customization && (item.customization.text || item.customization.image) && (
                    <div className="mt-3 bg-white p-3 rounded-md border-l-4 border-yellow-300">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Your Personalization</h4>
                      <div className="space-y-2">
                        {item.customization.text && (
                          <div className="text-sm text-gray-700 italic">“{item.customization.text}”</div>
                        )}
                        {item.customization.image && item.customization.image.url && (
                          <div className="flex items-center gap-3">
                            <img
                              src={item.customization.image.url}
                              alt="Custom"
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">Uploaded design</p>
                              <button
                                onClick={() => window.open(item.customization.image.url, "_blank")}
                                className="text-xs text-blue-600 hover:underline mt-1"
                              >
                                View full size
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order summary & actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="font-semibold text-lg text-gray-900">₹{order.amount.toFixed(2)}</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700">Payment</p>
                    <p>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                    <p className="mt-1">
                      {order.payment ? (
                        <span className="text-green-600 font-semibold">✅ Paid</span>
                      ) : (
                        <span className="text-orange-600 font-semibold">⏳ Pending</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Delivery Address</p>
                    <p className="text-gray-700">
                      {order.address?.firstName} {order.address?.lastName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {order.address?.street}, {order.address?.city}, {order.address?.state}
                    </p>
                    <p className="text-gray-600 text-sm">{order.address?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Conditional cancel button */}
                {(order.status === "Order Placed" || order.status === "Processing") && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Orders;
