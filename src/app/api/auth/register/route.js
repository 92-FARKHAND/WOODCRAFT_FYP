import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User.model";

export const POST = apiHandler(async (req) => {
  console.log("API HIT");

  const body = await req.json();
  console.log("BODY:", body);

  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new Error("User with this email already exists");
  }

  const user = await User.create({ name, email, password, role: role || "customer" });

  // remove password before returning
  const { password: _, ...safeUser } = JSON.parse(JSON.stringify(user));

  return {
    message: "User registered successfully",
    user: safeUser,
  };
});