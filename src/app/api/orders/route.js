import { apiHandler } from "@/lib/apiHandler";
import Order from "@/models/Order.model";
import Notification from "@/models/Notification.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";

export const GET = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { user } = session;
  let query = {};

  if (user.role === "customer") {
    query = { customerId: user.id };
  } else if (user.role === "employee") {
    query = { assignEmployeeId: user.id };
  }
  // Admin sees all

  const orders = await Order.find(query)
    .populate("customerId", "name email contact")
    .populate("assignEmployeeId", "name email")
    .populate("serviceId", "name")
    .sort({ createdAt: -1 });

  return orders;
});

export const POST = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { serviceId, description, totalAmount, estimatedCost } = await req.json();

  if (!serviceId) {
    throw new Error("Service is required");
  }

  const newOrder = await Order.create({
    customerId: session.user.id,
    serviceId,
    description,
    totalAmount: totalAmount ,
    estimatedCost: estimatedCost || { labor: 0, material: 0, total: 0 },
    status: "Pending",
    paymentStatus: "Unpaid",
  });

  // Create notification for Admin
  await Notification.create({
    title: "New Order Received",
    message: `A new order has been placed by ${session.user.name}. Order ID: ${newOrder._id}`,
    type: "new_order",
    targetRole: "admin",
    relatedId: newOrder._id,
    onModel: "Order"
  });

  return newOrder;
});
