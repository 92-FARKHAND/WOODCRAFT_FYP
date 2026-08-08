import Notification from "@/models/Notification.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    // Only admins see these notifications
    const notifications = await Notification.find({ 
      targetRole: "admin" 
    }).sort({ createdAt: -1 }).limit(50);
    
    return notifications;
  }, ["admin"])
);

export const PATCH = apiHandler(
  authMiddleware(async (req) => {
    const { id, isRead } = await req.json();
    if (id) {
        const notification = await Notification.findByIdAndUpdate(id, { isRead }, { new: true });
        return notification;
    }
    // Mark all as read if no ID
    await Notification.updateMany({ targetRole: "admin" }, { isRead: true });
    return { success: true };
  }, ["admin"])
);
