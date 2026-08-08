
import mongoose from "mongoose";
import User from "./User.model.js"
import Order from "./Order.model.js";

const InvoiceSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true,"Order ID is required"]
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true,"Customer ID is required"]
  },
  amount: {
    type: Number,
    required: [true,"Amount is required"],
    min:[1,"Amount must be greater than zero"],
    set: (v) => Math.round(v * 1000) / 1000,
  },
  status: {
    type: String,
    enum: ['draft', 'unpaid', 'partially_paid', 'paid'],
    default: 'unpaid',
    required:[true,"Invoice status is required"]
  },
  amountPaid: {
    type: Number,
    default: 0,
    required:[true,"Paid amount is required"],
    set: (v) => Math.round(v * 1000) / 1000,
  }
},
  { timestamps: true }
);

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export default Invoice;