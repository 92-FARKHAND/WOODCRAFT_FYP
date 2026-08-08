import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import User from "@/models/User.model";
import Session from "@/models/Session.model";
import { apiHandler } from "@/lib/apiHandler";
import { revalidatePath } from "next/cache";

export const POST = apiHandler(async (req) => {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "employee") {
    throw new Error("Unauthorized");
  }

  if(session.user.hourlyRate <= 0) {    
      throw new Error("Set hourly rate first");
    }

  const userId = session.user.id;

  // Check if already clocked in
  const activeSession = await Session.findOne({ userId, isClosed: false });
  if (activeSession) {
    throw new Error("Already clocked in");
  }

  // Create new session
  const newSession = await Session.create({
    userId,
    clockIn: new Date(),
  });

  // Update user status
  await User.findByIdAndUpdate(userId, { workStatus: "Working" });

  revalidatePath("/dashboard");

  return newSession;
});
