import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
   serviceTitle: {
      type: String,
      required: [true,"Service title is required"]
   },
   description: {
      type: String,
      required: [true,"Service description is required"]
   },
   basePrice: {
      type: Number,
      required:true,
      min: [1, "Base price must be greater than 0"],
   },
   estimatedTime: {
      type: String
   },
   estimatedCost: {
      type: Number,
      required:true,
      min: [1, "Base price must be greater than 0"],
   }
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export default Service;