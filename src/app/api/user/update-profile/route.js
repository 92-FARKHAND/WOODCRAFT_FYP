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

  const body = await req.json();
  const { name, email, contact, address, skill, hourlyRate } = body;

  // Basic validation
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    throw new Error("Invalid email format");
  }

  // Check if email is already taken by another user
  if (email && email !== session.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    session.user.id,
    {
      ...(name && { name }),
      ...(email && { email }),
      ...(contact && { contact }),
      ...(address && { address }),
      ...(skill && { skill }),
      ...(hourlyRate !== undefined && { hourlyRate }),
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  // Revalidate paths to clear Next.js cache
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return {
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      contact: updatedUser.contact,
      address: updatedUser.address,
      role: updatedUser.role,
      hourlyRate: updatedUser.hourlyRate,
    }
  };
});
