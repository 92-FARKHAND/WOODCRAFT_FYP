import { getServerSession } from "next-auth";
import { authOptions } from "./authOpts";
import { NextResponse } from "next/server";

/**
 * Middleware to protect API routes and check user roles.
 * @param {Function} handler - The API route handler function.
 * @param {Array} allowedRoles - Optional array of roles allowed to access the route.
 * @returns {Function} - Wrapped handler function.
 */
export const authMiddleware = (handler, allowedRoles = []) => {
  return async (req, context) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Please log in to access this resource" },
          { status: 401 }
        );
      }

      const userRole = session.user?.role;

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: `Forbidden: ${userRole} does not have permission to perform this action` },
          { status: 403 }
        );
      }

      // Add session user to the request object for use in the handler
      req.user = session.user;

      return handler(req, context);
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error during authentication" },
        { status: 500 }
      );
    }
  };
};
