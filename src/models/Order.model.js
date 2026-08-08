import mongoose from "mongoose";
import User from "./User.model";
import Material from "./Material.model";
import Service from "./Service.model";
import Invoice from "./Invoice.model";

//remove materialId
const OrderSchema = new mongoose.Schema({
   customerId :{
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     required: true,
     index: true,
    },
    description: {
      type: String,
      required: [true,"Description is required"],
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      index: true,
    },
    assignEmployeeId :{
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In-Progress", "Completed", "Delivered"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
    },
    invoiceAvailable: {
      type: Boolean,
      default: false,
    },
    usedMaterials: [
    {
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
      },

      quantity: {
        type: Number,
        required: true,
        set: (v) => Math.round(v * 1000) / 1000,
      },

      priceAtTime: {
        type: Number, // snapshot of price
        required: true,
        set: (v) => Math.round(v * 1000) / 1000,
      },
    },
  ],

   totalAmount: {
     type: Number,
     required:[true,"Total amount is required"],
     min:[1,"Amount must be greater than 0"],
     set: (v) => Math.round(v * 1000) / 1000,
   },
   estimatedCost: {
      labor: { type: Number, default: 0, set: (v) => Math.round(v * 1000) / 1000 },
      material: { type: Number, default: 0, set: (v) => Math.round(v * 1000) / 1000 },
      total: { type: Number, default: 0, set: (v) => Math.round(v * 1000) / 1000 }
   },
   actualCost: {
     labor: { type: Number, default: 0, set: (v) => Math.round(v * 1000) / 1000 },
     material: { type: Number, default: 0, set: (v) => Math.round(v * 1000) / 1000 },
     total: { type: Number, default: 0, set: (v) => Math.round(v * 1000) / 1000 },
   },
   completedAt: {
     type: Date,
   },
},
{ timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order