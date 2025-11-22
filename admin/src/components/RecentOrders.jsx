import React, { useState, useEffect } from "react";
import { Package, Clock, ShoppingCart } from "lucide-react";

// ✅ Dummy orders instead of backend
const dummyOrders = [
  {
    _id: "1",
    orderId: "ORD-1001",
    customer: "Arpit Shukla",
    items: 3,
    status: "pending",
    amount: "₹1,250",
    date: "2025-09-01 14:32",
  },
  {
    _id: "2",
    orderId: "ORD-1002",
    customer: "John Doe",
    items: 1,
    status: "completed",
    amount: "₹499",
    date: "2025-09-02 09:15",
  },
  {
    _id: "3",
    orderId: "ORD-1003",
    customer: "Priya Sharma",
    items: 2,
    status: "shipped",
    amount: "₹1,799",
    date: "2025-09-03 10:40",
  },
];

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(dummyOrders);
  }, []);

  const displayedOrders = orders.slice(0, 2);
  const totalPending = orders.filter((o) => o.status === "pending").length;
  const extraPending =
    totalPending - displayedOrders.filter((o) => o.status === "pending").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "shipped":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="rounded-xl shadow-sm border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600">Latest customer purchases</p>
        </div>
        <a
          href="/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </a>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayedOrders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
          >
            {/* Top Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{order.orderId}</h4>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Items + Amount */}
            <p className="text-sm text-gray-600 mb-3">
              {order.items} item(s) • <span className="font-semibold">{order.amount}</span>
            </p>

            {/* Footer */}
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{order.date}</span>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">No recent orders</div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-6 p-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center space-x-3">
        <Package className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {totalPending} pending orders
          </p>
          <p className="text-xs text-gray-600">
            {extraPending > 0
              ? `+${extraPending} more pending orders`
              : "Processing orders are awaiting action"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
