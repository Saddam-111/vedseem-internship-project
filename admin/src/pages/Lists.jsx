// src/pages/admin/Lists.jsx
import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthDataContext } from "../context/AuthContext";
import axios from "axios";
import {
  FaTrash,
  FaEdit,
  FaTimes,
  FaDownload,
  FaPrint,
  FaSync,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Responsive Lists.jsx
 * - Insights as collapsible responsive cards (B2)
 * - Filters: responsive grid (F2)
 * - Desktop/tablet: table view (with horizontal scroll)
 * - Mobile: card-list view for each product
 * - All original logic preserved
 */

const PAGE_SIZE = 10;

const exportToCSV = (rows, filename = "products.csv") => {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      header
        .map((h) => {
          const val = r[h] ?? "";
          if (
            typeof val === "string" &&
            (val.includes(",") || val.includes('"') || val.includes("\n"))
          ) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val);
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const Lists = () => {
  const { baseUrl } = useContext(AuthDataContext);
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // UI states
  const [insightsOpen, setInsightsOpen] = useState(true); // collapsible insights section
  const [sortBy, setSortBy] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Edit modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  // Fetch products
  const fetchList = async () => {
    try {
      if (!baseUrl) return;
      const result = await axios.get(`${baseUrl}/api/v1/product/getProducts`, {
        withCredentials: true,
      });
      const products = result.data.products || [];
      setList(products);
      setFiltered(products);
      setPage(1);
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  // refresh wrapper
  const refresh = async () => {
    setIsRefreshing(true);
    await fetchList();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Derived stats and categories (memoized)
  const stats = useMemo(() => {
    const totalProducts = list.length;
    let totalUnits = 0;
    let totalOutOfStock = 0;
    let lowStockCount = 0;
    const byCategory = {};

    list.forEach((p) => {
      const stock =
        typeof p.stock === "number" ? p.stock : Number(p.stock || 0);
      totalUnits += stock;
      if (stock <= 0) totalOutOfStock += 1;
      if (stock > 0 && stock <= 5) lowStockCount += 1;
      const cat = (p.category || "uncategorized").toLowerCase();
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      totalProducts,
      totalUnits,
      totalOutOfStock,
      lowStockCount,
      byCategory,
    };
  }, [list]);

  // Filter, search, date range, stock filter and sort
  useEffect(() => {
    let arr = [...list];

    // Search:
    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.subCategory || "").toLowerCase().includes(q)
      );
    }

    // Category filter:
    if (filterCategory) {
      arr = arr.filter(
        (p) => (p.category || "").toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Stock filter:
    if (filterStock === "low") {
      arr = arr.filter((p) => {
        const s = typeof p.stock === "number" ? p.stock : Number(p.stock || 0);
        return s > 0 && s <= 5;
      });
    } else if (filterStock === "out") {
      arr = arr.filter(
        (p) =>
          (typeof p.stock === "number" ? p.stock : Number(p.stock || 0)) <= 0
      );
    }

    // Date range (createdAt)
    if (dateFrom) {
      const from = new Date(dateFrom);
      arr = arr.filter((p) => new Date(p.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      arr = arr.filter((p) => new Date(p.createdAt) <= to);
    }

    // Sorting
    if (sortBy) {
      switch (sortBy) {
        case "price-asc":
          arr.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case "price-desc":
          arr.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case "stock-asc":
          arr.sort((a, b) => (a.stock || 0) - (b.stock || 0));
          break;
        case "stock-desc":
          arr.sort((a, b) => (b.stock || 0) - (a.stock || 0));
          break;
        case "name-asc":
          arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          break;
        case "name-desc":
          arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
          break;
        case "newest":
          arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "oldest":
          arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        default:
          break;
      }
    }

    setFiltered(arr);
    setPage(1);
  }, [list, query, filterCategory, filterStock, dateFrom, dateTo, sortBy]);

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Delete
  const removeList = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      const result = await axios.delete(
        `${baseUrl}/api/v1/product/delete/${id}`,
        { withCredentials: true }
      );
      if (result.data.success) {
        fetchList();
      } else {
        alert("Failed to remove product");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Failed to remove product");
    }
  };

  // Edit modal functions
  const openEdit = (item) => {
    setEditData({ ...item }); // local copy
    setImagePreview(item.image?.url || "");
    setImageFile(null);
    setEditOpen(true);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const saveEdit = async () => {
    if (!editData) return;
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("description", editData.description || "");
      formData.append("price", editData.price || 0);
      formData.append("category", editData.category || "");
      formData.append("subCategory", editData.subCategory || "");
      formData.append("stock", editData.stock || 0);
      formData.append(
        "isCustomizable",
        editData.isCustomizable === true || editData.isCustomizable === "true"
          ? "true"
          : "false"
      );
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.put(
        `${baseUrl}/api/v1/product/update/${editData._id}`,
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        setEditOpen(false);
        fetchList();
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product");
    }
  };

  // Export CSV - uses filtered list
  const onExportCSV = () => {
    const rows = filtered.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      subCategory: p.subCategory,
      price: p.price,
      stock: p.stock,
      createdAt: p.createdAt,
    }));
    exportToCSV(rows, `products_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Print - print only table area
  const onPrint = () => {
    const printContent = document.getElementById("admin-product-table");
    if (!printContent) return;
    const pri = window.open("", "_blank", "width=900,height=700");
    pri.document.open();
    pri.document.write(`
      <html>
        <head>
          <title>Products Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; }
            table { width:100%; border-collapse: collapse; }
            th, td { border:1px solid #ddd; padding:8px; text-align:left; }
            th { background:#f7d000; color:#111; }
          </style>
        </head>
        <body>
          <h2>Products (${filtered.length})</h2>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    pri.document.close();
    pri.focus();
    setTimeout(() => {
      pri.print();
      pri.close();
    }, 500);
  };

  // UI helpers
  const uniqueCategories = useMemo(() => {
    const s = new Set();
    list.forEach((p) => s.add((p.category || "").toLowerCase()));
    return [...s].filter(Boolean).sort();
  }, [list]);

  return (
    <div className="p-4 md:p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Products{" "}
            <span className="text-sm text-gray-500">({list.length})</span>
          </h2>
          <p className="text-sm text-gray-600">
            Manage your product catalog — edit, export, print and monitor stock.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refresh}
            disabled={isRefreshing}
            title="Refresh"
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FaSync className={`${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <FaDownload /> CSV
          </button>
          <button
            onClick={onPrint}
            title="Print Table"
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPrint /> Print
          </button>
          <button
            onClick={() => setInsightsOpen((s) => !s)}
            title="Toggle Insights"
            className="px-3 py-2 bg-yellow-400 text-black rounded hover:opacity-90"
          >
            {insightsOpen ? "Hide Insights" : "Show Insights"}
          </button>
        </div>
      </div>

      {/* Filters + Insights Row (filters left, insights toggle right on large screens) */}
      <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm">
        <div className="md:flex md:items-start md:justify-between">
          {/* Filters grid */}
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name / category / subcategory"
                className="border p-2 rounded-md w-full"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="">Sort — None</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="stock-asc">Stock: Low → High</option>
                <option value="stock-desc">Stock: High → Low</option>
                <option value="name-asc">Name: A → Z</option>
                <option value="name-desc">Name: Z → A</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="all">All Stock</option>
                <option value="low">Low stock (≤5)</option>
                <option value="out">Out of stock</option>
              </select>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border p-2 rounded-md w-full"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border p-2 rounded-md w-full"
              />
              <div />
            </div>
          </div>
        </div>
      </div>

      {/* Insights (collapsible) */}
      {insightsOpen && (
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Card: Total Products */}
            <div className="rounded-lg p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-90">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-xs mt-1 opacity-90">All SKUs</p>
              </div>
              <div className="text-3xl opacity-90">📦</div>
            </div>

            {/* Card: Total Units */}
            <div className="rounded-lg p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-90">
                  Total Units in Stock
                </p>
                <p className="text-2xl font-bold">{stats.totalUnits}</p>
                <p className="text-xs mt-1 opacity-90">Sum of stock values</p>
              </div>
              <div className="text-3xl opacity-90">📊</div>
            </div>

            {/* Card: Low Stock */}
            <div className="rounded-lg p-4 bg-gradient-to-r from-pink-500 to-red-500 text-white shadow flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-90">Low Stock (≤5)</p>
                <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                <p className="text-xs mt-1 opacity-90">Needs restock</p>
              </div>
              <div className="text-3xl opacity-90">⚠️</div>
            </div>

            {/* Card: Out of Stock */}
            <div className="rounded-lg p-4 bg-gradient-to-r from-green-400 to-teal-500 text-white shadow flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-90">Out of Stock</p>
                <p className="text-2xl font-bold">{stats.totalOutOfStock}</p>
                <p className="text-xs mt-1 opacity-90">Sold out items</p>
              </div>
              <div className="text-3xl opacity-90">❌</div>
            </div>
          </div>

          {/* Category distribution + low stock list appear under cards on larger screens */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-3">Category Distribution</h4>
              <div className="space-y-2">
                {Object.entries(stats.byCategory).length === 0 && (
                  <p className="text-sm text-gray-500">No categories</p>
                )}
                {Object.entries(stats.byCategory).map(([cat, count]) => {
                  const percent = Math.round(
                    (count / Math.max(1, stats.totalProducts)) * 100
                  );
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{cat}</span>
                        <span>
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-3">Top Low Stock Items</h4>
              {list
                .filter(
                  (p) =>
                    (typeof p.stock === "number"
                      ? p.stock
                      : Number(p.stock || 0)) <= 5
                )
                .slice(0, 6).length === 0 ? (
                <p className="text-sm text-gray-500">No low stock items</p>
              ) : (
                <ul className="space-y-2">
                  {list
                    .filter(
                      (p) =>
                        (typeof p.stock === "number"
                          ? p.stock
                          : Number(p.stock || 0)) <= 5
                    )
                    .sort((a, b) => (a.stock || 0) - (b.stock || 0))
                    .slice(0, 6)
                    .map((p) => (
                      <li key={p._id} className="flex items-center gap-3">
                        <img
                          src={p.image?.url || "https://via.placeholder.com/40"}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">
                            {p.category}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-red-600">
                          {p.stock}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Last updated: {new Date().toLocaleString("en-IN")}
          </div>
        </div>
      )}

      {/* Main content: table for md+ and mobile cards for small */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop / Tablet Table */}
        <div
          id="admin-product-table"
          className="hidden sm:block overflow-x-auto"
        >
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#F0D800] text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  SL
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Added
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paged.map((item, index) => {
                const stock =
                  typeof item.stock === "number"
                    ? item.stock
                    : Number(item.stock || 0);
                const stockBadge =
                  stock <= 0
                    ? "bg-red-100 text-red-700"
                    : stock <= 5
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700";
                return (
                  <tr
                    key={item._id}
                    className="odd:bg-gray-50 hover:bg-blue-50 transition"
                  >
                    <td className="px-4 py-3">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={
                          item.image?.url || "https://via.placeholder.com/80"
                        }
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.subCategory || ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.category || "—"}</td>
                    <td className="px-4 py-3">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${stockBadge}`}
                      >
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => removeList(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden p-3 space-y-3">
          {paged.map((item, index) => {
            const stock =
              typeof item.stock === "number"
                ? item.stock
                : Number(item.stock || 0);
            const stockBadge =
              stock <= 0
                ? "bg-red-100 text-red-700"
                : stock <= 5
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700";
            return (
              <div
                key={item._id}
                className="border rounded-lg p-3 flex gap-3 items-start"
              >
                <img
                  src={item.image?.url || "https://via.placeholder.com/80"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.category || "—"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      #{(page - 1) * PAGE_SIZE + index + 1}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </div>
                      <div
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${stockBadge}`}
                      >
                        {stock}
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => removeList(item._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {item.subCategory && (
                    <div className="mt-2 text-xs text-gray-500">
                      {item.subCategory}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Added:{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>
            );
          })}

          {paged.length === 0 && (
            <div className="text-center text-gray-600 py-6">
              No products match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {paged.length} of {filtered.length} products (Total:{" "}
          {list.length})
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-3 py-1 bg-white border rounded">
            {page} / {totalPages}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Product</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-3 border rounded p-3">
                <img
                  src={
                    imagePreview ||
                    editData.image?.url ||
                    "https://via.placeholder.com/200"
                  }
                  alt="preview"
                  className="w-56 h-56 object-cover rounded"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <input
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Name"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  rows="4"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                    placeholder="Price"
                  />
                  <input
                    value={editData.stock}
                    onChange={(e) =>
                      setEditData({ ...editData, stock: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                    placeholder="Stock"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                    placeholder="Category"
                  />
                  <input
                    value={editData.subCategory}
                    onChange={(e) =>
                      setEditData({ ...editData, subCategory: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                    placeholder="Subcategory"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        editData.isCustomizable === true ||
                        editData.isCustomizable === "true"
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          isCustomizable: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Customizable</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;
