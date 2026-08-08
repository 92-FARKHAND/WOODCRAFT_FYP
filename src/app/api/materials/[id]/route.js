import Material from "@/models/Material.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(authMiddleware(async (req, { params }) => {
  const { id } = await params;
  const material = await Material.findById(id).populate("supplierId", "name email");
  if (!material) {
    throw new Error("Material not found");
  }
  return material;
},["admin"]));

export const PATCH = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const material = await Material.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!material) {
    throw new Error("Material not found");
  }
  return material;
});

export const DELETE = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const material = await Material.findByIdAndDelete(id);
  if (!material) {
    throw new Error("Material not found");
  }
  return { message: "Material deleted successfully" };
});
