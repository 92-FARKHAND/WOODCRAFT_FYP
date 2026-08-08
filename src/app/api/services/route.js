import Service from "@/models/Service.model";
import { apiHandler } from "@/lib/apiHandler";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";

export const GET = apiHandler(async (req) => {
  const services = await Service.find({});
  return services;
});

export const POST = apiHandler(async (req) => {
    const session = await getServerSession(authOptions);
  
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
  
  const body = await req.json();
  const service = await Service.create(body);
  return service;
});
