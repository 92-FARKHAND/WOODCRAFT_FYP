import Invoice from "@/models/Invoice.model";
import Order from "@/models/Order.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Customers can only see their own invoices
  const invoices = await Invoice.find({ customerId: session.user.id })
    .populate({
        path: 'orderId',
        populate: {
            path: 'serviceId materialId'
        }
    })
    .sort({ createdAt: -1 });

  return invoices;
});
