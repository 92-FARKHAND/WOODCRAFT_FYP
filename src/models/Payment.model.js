import mongoose from 'mongoose'
import User from "./User.model"
import Invoice from "./Invoice.model"

const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true,"Invoice ID is required"]
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Customer ID is required"]
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min:[1,"Amount must be greater than zero"],
      set: (v) => Math.round(v * 1000) / 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      required: [true, "Payment Status is required"]
    },
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'other'],
      default: 'cash',
      required:[true,"Payment method is required"]
    },
    note: { type: String },
    paidAt: {
      type: Date,
      default: Date.now
    },
  },
  { timestamps: true }
)

export default mongoose.models.Payment ?? mongoose.model('Payment', PaymentSchema)