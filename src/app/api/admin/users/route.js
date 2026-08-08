
import User from "@/models/User.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = authMiddleware( apiHandler(async (req) => {

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const query = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  return users;
}))
