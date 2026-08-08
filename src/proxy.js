import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Helper to determine if a request is for an API route
 */
const isApiRequest = (req) => req.nextUrl.pathname.startsWith("/api");


function authProxy(req, token) {
  const { pathname } = req.nextUrl;
  const isPublicPath = pathname === "/" || pathname === "/Auth" || pathname.startsWith("/api/auth");

  if (!token && !isPublicPath) {
    if (isApiRequest(req)) {
      return NextResponse.json({ message: "Unauthorized: Please log in" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
  return null;
}

/**
 *  Account Status Check
 * If status is "Pending", restrict access to all routes except /, /Auth, and /profile.
 */
function statusProxy(req, token) {
  const { pathname } = req.nextUrl;
  const status = token?.status?.toLowerCase();
  const isRestricted = status === "pending" || status === "rejected";

  // Profile is located at /dashboard/profile
  const allowedForRestricted = ["/", "/Auth", "/dashboard/profile", "/api/auth", "/api/user"];

  if (isRestricted) {
    const isAllowed = allowedForRestricted.some((path) =>
      pathname === path || pathname.startsWith(path)
    );
    if (!isAllowed) {
      if (isApiRequest(req)) {
        return NextResponse.json({ message: `Access restricted: Account status is ${status}` }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard/profile", req.url));
    }
  }
  return null;
}

/**
 *  Role & Sensitive Action Check
 * Protects specific actions like order status changes, adding suppliers, and user management.
 * These are allowed only for "Approved" users with appropriate roles.
 */
function roleProxy(req, token) {
  const { pathname, method } = req.nextUrl;
  const role = token?.role?.toLowerCase();
  const status = token?.status?.toLowerCase();
  const isApproved = status === "approved";

  // 1. Order status and detail management (PATCH/PUT/DELETE to /api/orders)
  if (pathname.startsWith("/api/orders") && ["PATCH", "PUT", "DELETE"].includes(method)) {
    if (!isApproved || (role !== "admin" && role !== "employee")) {
      return NextResponse.json({ message: "Action restricted to Approved Admin/Employees" }, { status: 403 });
    }
  }

  // 2. Supplier management (POST/PATCH/PUT/DELETE to /api/suppliers)
  if (pathname.startsWith("/api/suppliers") && ["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    if (!isApproved || role !== "admin") {
      return NextResponse.json({ message: "Action restricted to Admin" }, { status: 403 });
    }
  }

  // 3. Admin User management & Catch-all Admin APIs
  if (pathname.startsWith("/api/admin")) {
    if (!isApproved || role !== "admin") {
      return NextResponse.json({ message: "Admin resource restricted" }, { status: 403 });
    }
  }

  // 4. Admin Only Frontend Routes
  const adminOnlyRoutes = [
    "/dashboard/inventory",
    "/dashboard/employees",
    "/dashboard/customers",
    "/dashboard/suppliers",
    "/dashboard/billing",
    "/dashboard/reports",
  ];
  if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (!isApproved || role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 5. Employee Only Routes (Frontend and API)
  const employeeOnlyRoutes = [
    "/dashboard/payments",
    "/api/employee",
  ];
  if (employeeOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (!isApproved || role !== "employee") {
      if (isApiRequest(req)) {
        return NextResponse.json({ message: "Employee resource restricted" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 6. Customer Only Routes (Frontend)
  const customerOnlyRoutes = [
    "/dashboard/invoices",
  ];
  if (customerOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (!isApproved || role !== "customer") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return null;
}

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;

    // Chain the proxies. First one to return a Response wins.
    const authResponse = authProxy(req, token);
    if (authResponse) return authResponse;

    const statusResponse = statusProxy(req, token);
    if (statusResponse) return statusResponse;

    const roleResponse = roleProxy(req, token);
    if (roleResponse) return roleResponse;

    return NextResponse.next();
  },
  {
    callbacks: {
      // By returning true here, we ensure our middleware function always runs, 
      // allowing us to handle redirects manually in our proxies even when token is null.
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
