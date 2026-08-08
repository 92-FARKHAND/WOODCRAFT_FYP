import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import User from "@/models/User.model";
import { apiHandler } from "@/lib/apiHandler";

export const PATCH = apiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { id } = await params;
  const { status, role } = await req.json();

  const updateData = {};
  if (status) updateData.status = status;
  if (role) updateData.role = role;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
});

export const DELETE = apiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { id } = await params;
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found");
  }

  return { message: "User deleted successfully" };
});
