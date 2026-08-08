import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Material', 'Wage', 'Utility', 'Rent', 'Other'],
    required: [true , "Select any category"]
  },
  amount: {
    type: Number,
    required: [true,"Amount is required"],
    min:[1,"Amount must be greater than 0"],
    set: (v) => Math.round(v * 1000) / 1000,
  },
  description: {
    type: String,
    required: [true,"Description is required"]
  },
  date: {
    type: Date,
    default: Date.now
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }
}, { timestamps: true });

const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
export default Expense;
