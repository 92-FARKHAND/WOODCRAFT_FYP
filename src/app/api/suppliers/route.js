import User from "@/models/User.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    const suppliers = await User.find({ role: "supplier" }).select("-password");
    return suppliers;
  }, ["admin"])
);

export const POST = apiHandler(
  authMiddleware(async (req) => {
    const body = await req.json();
    // Ensure the role is set to supplier
    const supplierData = { ...body, role: "supplier", status: "Approved" };
    const supplier = await User.create(supplierData);

    // Return without password
    const { password, ...rest } = supplier._doc;
    return rest;
  }, ["admin"])
);

