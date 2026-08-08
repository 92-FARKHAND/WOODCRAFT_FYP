import Invoice from "@/models/Invoice.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const invoices = await Invoice.find()
    .populate("customerId", "name email")
    .populate("orderId")
    .sort({ createdAt: -1 });

  return invoices;
});
