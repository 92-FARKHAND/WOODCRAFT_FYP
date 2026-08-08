import Invoice from "@/models/Invoice.model";
import Order from "@/models/Order.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { id } = (await params);
  const invoice = await Invoice.findById(id)
    .populate({
        path: 'orderId',
        populate: {
            path: 'serviceId materialId usedMaterials.materialId customerId assignEmployeeId'
        }
    })
    .populate("customerId", "name email contact address");

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Check if user is admin or the customer who owns the invoice
  if (session.user.role !== "admin" && invoice.customerId?._id?.toString() !== session.user.id) {
    throw new Error("Forbidden");
  }

  return invoice;
});
