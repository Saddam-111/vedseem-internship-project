// controllers/admin.controllers.js
import Product from "../models/product.model.js";
import Blog from "../models/blog.model.js";
import Order from "../models/order.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { payment: true } }, // only paid orders
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      totalProducts,
      totalBlogs,
      totalOrders,
      totalRevenue: totalRevenue[0]?.revenue || 0,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Monthly Revenue Stats
export const getRevenueByMonth = async (req, res) => {
  try {
    const monthlyRevenue = await Order.aggregate([
      { $match: { payment: true } }, // only paid orders
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } }, // sort by month
    ]);

    // Format months (1-12 → Jan-Dec)
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const formattedData = months.map((m, i) => {
      const found = monthlyRevenue.find((r) => r._id === i + 1);
      return { month: m, revenue: found ? found.totalRevenue : 0 };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
