
import mongoose from "mongoose";
import User from "./User.model";

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,"Material name is required"],
    trim: true,
  },
  category: {
    type: String,
    enum: ['wood', 'paint', 'hardware', 'tools', 'polish', 'other'],
    required: [true,"Select material category"]
  },
  unit: {
    type: String,
    required: [true,"Select type of unit"],
    enum: ['piece', 'kg', 'liter', 'meter', 'box', 'set'],
  },
  quantity: {
    type: Number,
    required: [true,"Quantity is required"],
    min: [1,"Quantity must be greater than 0"],
    set: (v) => Math.round(v * 1000) / 1000,
  },
  minStockLevel: {
    type: Number,
    required:[true,"Minimum stock level is required"],
    min: [0,"Min stock must be greater than equal to 0"],
    set: (v) => Math.round(v * 1000) / 1000,
  },
  pricePerUnit: {
    type: Number,
    required: [true,"Price per unit is required"],
    min: [1,"Price per unit must be greater than 0"],
    set: (v) => Math.round(v * 1000) / 1000,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:[true,"Supplier Id is required"]
  },
  description:{
    type: String,
    required:[true,"Description is required"]
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Virtual for low stock alert
materialSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);
export default Material;