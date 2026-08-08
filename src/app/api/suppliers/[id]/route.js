import User from "@/models/User.model";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const supplier = await User.findOne({ _id: id, role: "supplier" }).select("-password");
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  return supplier;
});

export const PATCH = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  
  // Prevent role change via this route if needed, or ensure it remains supplier
  if (body.role && body.role !== "supplier") {
     delete body.role;
  }

  const supplier = await User.findOneAndUpdate(
    { _id: id, role: "supplier" },
    body,
    { new: true, runValidators: true }
  ).select("-password");

  if (!supplier) {
    throw new Error("Supplier not found");
  }
  return supplier;
});

export const DELETE = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const supplier = await User.findOneAndDelete({ _id: id, role: "supplier" });
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  return { message: "Supplier deleted successfully" };
});
