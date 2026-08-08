import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";
import Order from "@/models/Order.model";
import User from "@/models/User.model";
import Material from "@/models/Material.model";
import Notification from "@/models/Notification.model";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    // 1. Fetch all orders once, reuse for revenue, totalOrders, and pendingOrders
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === "Pending").length;

    // 2. Total Employees
    const totalEmployees = await User.countDocuments({ role: "employee" });

    // 3. Inventory Alerts (Low stock items)
    const inventoryAlerts = await Material.countDocuments({
      $expr: { $lte: ["$quantity", "$minStockLevel"] }
    });

    // 4. Recent Orders (Latest 5)
    const recentOrders = await Order.find({})
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Notifications (Latest 10)
    const notifications = await Notification.find({ targetRole: "admin" })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      stats: {
        totalRevenue,
        totalEmployees,
        totalOrders,
        pendingOrders,
        inventoryAlerts,
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString().slice(-6).toUpperCase(),
        mongoId: order._id,
        customer: order.customerId?.name || "Anonymous",
        status: order.status,
        amount: `$${order.totalAmount.toLocaleString()}`,
        date: order.createdAt
      })),
      notifications: notifications.map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        date: n.createdAt,
        isRead: n.isRead
      }))
    };
  }, ["admin"])
);
