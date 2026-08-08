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

  const userId = session.user.id;

  // Find active session
  const activeSession = await Session.findOne({ userId, isClosed: false });
  if (!activeSession) {
    throw new Error("No active session found");
  }

  const clockOutTime = new Date();
  const clockInTime = new Date(activeSession.clockIn);
  
  // Calculate duration in minutes
  const diffMs = clockOutTime - clockInTime;
  const durationMinutes = Math.floor(diffMs / 60000);
  const durationHours = durationMinutes / 60;

  // Update session
  activeSession.clockOut = clockOutTime;
  activeSession.durationMinutes = durationMinutes;
  activeSession.isClosed = true;
  await activeSession.save();

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalTime: durationHours,
      hoursToPaid: durationHours
    },
    workStatus: "Idle"
  });

  revalidatePath("/dashboard");

  return activeSession;
});
