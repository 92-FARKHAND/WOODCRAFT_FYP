import Order from "@/models/Order.model";
import Invoice from "@/models/Invoice.model";
import Payment from "@/models/Payment.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import { apiHandler } from "@/lib/apiHandler";

export const POST = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const { invoiceId, amount, method, note } = await req.json();

  if (!invoiceId || !amount) {
    throw new Error("Missing required fields: invoiceId and amount");
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Create payment record
  const payment = await Payment.create({
    invoiceId,
    customerId: invoice.customerId,
    amount,
    method: method || 'cash',
    note,
    status: 'completed'
  });

  // Update Invoice
  const newAmountPaid = (invoice.amountPaid || 0) + Number(amount);
  invoice.amountPaid = newAmountPaid;
  
  if (newAmountPaid >= invoice.amount) {
    invoice.status = 'paid';
  } else if (newAmountPaid > 0) {
    invoice.status = 'partially_paid';
  }
  await invoice.save();

  // Update Order
  const order = await Order.findById(invoice.orderId);
  if (order) {
    if (invoice.status === 'paid') {
      order.paymentStatus = 'Paid';
    } else if (invoice.status === 'partially_paid') {
      order.paymentStatus = 'Partially Paid';
    }
    await order.save();
  }

  return { payment, invoice };
});

export const GET = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  const payments = await Payment.find()
    .populate("customerId", "name email")
    .populate("invoiceId")
    .sort({ createdAt: -1 });

  return payments;
});
