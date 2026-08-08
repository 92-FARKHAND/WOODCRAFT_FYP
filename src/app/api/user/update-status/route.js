import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import User from "@/models/User.model";
import { apiHandler } from "@/lib/apiHandler";
import { revalidatePath } from "next/cache";

export const PATCH = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { workStatus } = await req.json();

  if (!["Idle", "Working"].includes(workStatus)) {
    throw new Error("Invalid work status");
  }

  const updatedUser = await User.findByIdAndUpdate(
    session.user.id,
    { workStatus },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  // Revalidate dashboard and profile
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return { 
    message: "Status updated successfully",
    workStatus: updatedUser.workStatus 
  };
});
