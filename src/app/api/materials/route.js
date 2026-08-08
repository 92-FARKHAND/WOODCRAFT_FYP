import Material from "@/models/Material.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    const materials = await Material.find({ isActive: true }).populate("supplierId", "name email");
    return materials;
  }, ["admin", "employee"])
);

export const POST = apiHandler(
  authMiddleware(async (req) => {
    const body = await req.json();
    const material = await Material.create(body);
    return material;
  }, ["admin"])
);

