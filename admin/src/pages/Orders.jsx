// src/pages/admin/AdminOrders.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaFileCsv,
  FaPrint,
} from "react-icons/fa";
import { motion } from "framer-motion";

const statusBadgeClass = (status) => {
  switch (status) {
    case "Order Placed":
      return "bg-blue-100 text-blue-800";
    case "Processing":
      return "bg-orange-100 text-orange-800";
    case "Shipped":
      return "bg-yellow-100 text-yellow-800";
    case "Out for Delivery":
      return "bg-purple-100 text-purple-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Returned":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-50 text-gray-800";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Order Placed":
    case "Processing":
      return <FaBox />;
    case "Shipped":
    case "Out for Delivery":
      return <FaShippingFast />;
    case "Delivered":
      return <FaCheckCircle />;
    case "Cancelled":
    case "Returned":
      return <FaTimesCircle />;
    default:
      return <FaBox />;
  }
};

const Orders = () => {
  const { baseUrl } = useContext(AuthDataContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("date_desc");
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // fetch
  const fetchOrders = async () => {
    if (!baseUrl) return;
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/api/v1/order/all`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  // refresh wrapper
  const refresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // search + filter + date + payment + status + sort
  const filteredSortedOrders = orders
    .filter((order) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      const idMatch = (order._id || "").toLowerCase().includes(q);
      const nameMatch = `${order.address?.firstName || ""} ${
        order.address?.lastName || ""
      }`
        .toLowerCase()
        .includes(q);
      const phoneMatch = (order.address?.phone || "").toLowerCase().includes(q);
      const statusMatch = (order.status || "").toLowerCase().includes(q);
      return idMatch || nameMatch || phoneMatch || statusMatch;
    })
    .filter((order) => {
      if (paymentFilter === "paid") return order.payment === true;
      if (paymentFilter === "unpaid") return order.payment === false;
      if (paymentFilter === "delivered") return order.status === "Delivered";
      return true;
    })
    .filter((order) => {
      if (statusFilter === "all") return true;
      return order.status === statusFilter;
    })
    .filter((order) => {
      if (!startDate && !endDate) return true;
      const created = new Date(order.createdAt);
      if (startDate) {
        const s = new Date(`${startDate}T00:00:00`);
        if (created < s) return false;
      }
      if (endDate) {
        const e = new Date(`${endDate}T23:59:59`);
        if (created > e) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date_desc")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "date_asc")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount_desc") return (b.amount || 0) - (a.amount || 0);
      if (sortBy === "amount_asc") return (a.amount || 0) - (b.amount || 0);
      if (sortBy === "status")
        return (a.status || "").localeCompare(b.status || "");
      return 0;
    });

  // pagination
  const totalItems = filteredSortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginated = filteredSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CSV export
  const exportCSV = () => {
    const rows = filteredSortedOrders.map((o) => ({
      id: o._id,
      date: new Date(o.createdAt).toLocaleString("en-IN"),
      customer: `${o.address?.firstName || ""} ${
        o.address?.lastName || ""
      }`.trim(),
      phone: o.address?.phone || "",
      items: o.items?.length || 0,
      amount: o.amount || 0,
      payment: o.payment ? "Paid" : "Unpaid",
      status: o.status || "",
    }));

    if (!rows.length) {
      alert("No orders to export");
      return;
    }

    const csvHeader = Object.keys(rows[0]).join(",") + "\n";
    const csvBody = rows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csv = csvHeader + csvBody;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Print invoice / open printable window for an order
  const printInvoice = (order) => {
    const html = `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111 }
            .header { display:flex; justify-content: space-between; align-items:center }
            .items { width:100%; border-collapse: collapse; margin-top:10px }
            .items th, .items td { border: 1px solid #ddd; padding:8px; text-align:left }
            .total { margin-top: 12px; font-size: 18px; font-weight: bold }
            .badge { padding:6px 8px; border-radius:6px; font-weight:600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>Invoice</h2>
              <div>Order#: ${order._id}</div>
              <div>Date: ${new Date(order.createdAt).toLocaleString(
                "en-IN"
              )}</div>
            </div>
            <div>
              <div>Customer:</div>
              <div>${order.address?.firstName || ""} ${
      order.address?.lastName || ""
    }</div>
              <div>${order.address?.phone || ""}</div>
            </div>
          </div>

          <table class="items">
            <thead>
              <tr><th>#</th><th>Product</th><th>Qty</th><th>Price</th><th>Customization</th></tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (it, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${it.name}</td>
                  <td>${it.quantity}</td>
                  <td>₹${(it.price || 0).toFixed(2)}</td>
                  <td>${
                    it.customization
                      ? (it.customization.text
                          ? `Text: ${it.customization.text}`
                          : "") +
                        (it.customization.image
                          ? ` <a href="${it.customization.image.url}" target="_blank">View Image</a>`
                          : "")
                      : "—"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="total">Total: ₹${(order.amount || 0).toFixed(2)}</div>
          <div style="margin-top:8px">Payment: ${
            order.payment ? "Paid" : "Unpaid"
          } | Status: ${order.status}</div>

          <script>
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "top=50,left=50,width=900,height=800");
    if (!w) {
      alert("Pop-up blocked. Please allow pop-ups to print invoice.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  // Update status (admin)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${baseUrl}/api/v1/order/status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      await fetchOrders();
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update status");
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleString("en-IN");

  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Orders</h1>
          <div className="text-sm text-gray-600">
            {orders.length} total orders
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            <FaSyncAlt className={`${isRefreshing ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters (responsive grid) */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Search full width */}
          <div className="sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              placeholder="Search by ID / name / phone / status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <motion.select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="w-full border rounded-lg p-2"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="delivered">Delivered</option>
            </motion.select>
          </div>

          <div>
            <motion.select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14 }}
              className="w-full border rounded-lg p-2"
            >
              <option value="all">All Status</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </motion.select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="date_desc">Date (new → old)</option>
              <option value="date_asc">Date (old → new)</option>
              <option value="amount_desc">Amount (high → low)</option>
              <option value="amount_asc">Amount (low → high)</option>
              <option value="status">Status (A → Z)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Per page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full border rounded-lg p-2"
            >
              <option value={5}>5 / page</option>
              <option value={8}>8 / page</option>
              <option value={12}>12 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>

          <div className=" flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-blue-600">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs text-red-600">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="text-center py-16">Loading orders...</div>
      ) : (
        <>
          <div className="flex flex-col md:gap-6 gap-4">
            {paginated.length === 0 ? (
              <div className="col-span-full p-8 bg-white rounded-lg shadow text-center">
                No orders found for selected filters.
              </div>
            ) : (
              paginated.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow border p-4"
                >
                  {/* OC2: Left (customer) / Right (items + actions) */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* LEFT: Customer summary */}
                    <div className="md:w-1/3 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Order #{order._id.slice(-8)}
                          </div>
                          <div className="font-semibold">
                            {order.address?.firstName || "Customer"}{" "}
                            {order.address?.lastName || ""}
                          </div>
                          <div className="text-xs text-gray-500">
                            {fmtDate(order.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm ${statusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </div>
                        <div className="mt-2 font-bold text-lg">
                          ₹{(order.amount || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {order.payment ? "Paid" : "Unpaid"}
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">Contact</div>
                        <div className="text-xs text-gray-700">
                          {order.address?.phone || "—"}
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {order.address?.street || ""}
                        </div>
                        <div className="text-xs text-gray-600">
                          {order.address?.city || ""}{" "}
                          {order.address?.state
                            ? `, ${order.address.state}`
                            : ""}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Items and actions */}
                    <div className="md:w-2/3 flex flex-col gap-3">
                      <div className="space-y-2">
                        {order.items.map((it, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 border rounded p-2"
                          >
                            <img
                              src={
                                it.image?.url ||
                                it.image ||
                                "https://via.placeholder.com/80"
                              }
                              alt={it.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{it.name}</div>
                              <div className="text-sm text-gray-600">
                                Qty: {it.quantity} × ₹
                                {(it.price || 0).toFixed(2)}
                              </div>

                              {it.customization &&
                                (it.customization.text ||
                                  it.customization.image) && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                                    {it.customization.text && (
                                      <div className="italic">
                                        Text: "{it.customization.text}"
                                      </div>
                                    )}
                                    {it.customization.image && (
                                      <div className="mt-1">
                                        <img
                                          src={it.customization.image?.url}
                                          alt={it.customization.text}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                        <a
                                          href={it.customization.image.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 underline"
                                        >
                                          View customized image
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between mt-2">
                        <div className="flex gap-2 items-center">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            className="border p-2 rounded-lg"
                          >
                            <option>Order Placed</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Out for Delivery</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                            <option>Returned</option>
                          </select>

                          <button
                            onClick={() => printInvoice(order)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                          >
                            <FaPrint /> Print
                          </button>
                        </div>

                        <div className="text-sm text-gray-600">
                          Items: {order.items?.length || 0} •{" "}
                          {order.address?.city || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing{" "}
              {(currentPage - 1) * itemsPerPage + (paginated.length ? 1 : 0)} -{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Prev
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (totalPages > 7) {
                    // Render a compact pagination for long lists: show first, last, current neighborhood
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === 2 && currentPage > 3) {
                      return (
                        <span key="dots-1" className="px-2">
                          ...
                        </span>
                      );
                    }
                    if (
                      page === totalPages - 1 &&
                      currentPage < totalPages - 2
                    ) {
                      return (
                        <span key="dots-2" className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
