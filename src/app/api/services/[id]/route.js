import Service from "@/models/Service.model";
import { apiHandler } from "@/lib/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";

// export const GET = apiHandler(async (req, { params }) => {
//   const { id } = await params;
//   const service = await Service.findById(id).populate("employeeId", "name email");
//   if (!service) {
//     throw new Error("Service not found");
//   }
//   return service;
// });

export const PATCH = apiHandler(async (req, { params }) => {
      const session = await getServerSession(authOptions);
    
      if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

  const { id } = await params;
  const body = await req.json();
  const service = await Service.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
});

export const DELETE = apiHandler(async (req, { params }) => {
        const session = await getServerSession(authOptions);
    
      if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

  const { id } = await params;
  const service = await Service.findByIdAndDelete(id);
  if (!service) {
    throw new Error("Service not found");
  }
  return { message: "Service deleted successfully" };
});
