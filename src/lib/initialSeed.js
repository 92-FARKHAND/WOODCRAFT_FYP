import User from "../models/User.model.js";

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin1@example.com";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Admin already exists, do nothing as requested
      return;
    }

    const adminData = {
      name: "Admin",
      email: adminEmail,
      password: "abc@1234",
      role: "admin",
      status: "Approved",
    };

    const admin = new User(adminData);
    await admin.save();
    console.log("Initial admin user seeded successfully.");
  } catch (error) {
    console.error("Error during initial admin seeding:", error);
  }
};
