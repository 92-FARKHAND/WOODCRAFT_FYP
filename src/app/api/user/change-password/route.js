import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { apiHandler } from "@/lib/apiHandler";

export const POST = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    throw new Error("Missing required fields");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(session.user.id).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Incorrect current password");
  }

  // Hash the new password is handled by pre-save hook in model
  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
});
