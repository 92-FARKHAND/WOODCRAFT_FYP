import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Minimum 6 character password is required"],
      minlength: 6,
    },
    address: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["admin", "customer", "employee", "supplier"],
      default: "customer",
      required:[true,"Role is required"]
    },
    hourlyRate: {
      type: Number,
      min:[0,"Hourly Rate must be greater than 0"],
      set: (v) => Math.round(v * 1000) / 1000,
    },
    totalTime: {
      type: Number,
      default: 0,
      set: (v) => Math.round(v * 1000) / 1000,
    },
    hoursToPaid: {
      type: Number,
      default: 0,
      set: (v) => Math.round(v * 1000) / 1000,
    },

    wage: {
      type: Number,
      default: 0,
      set: (v) => Math.round(v * 1000) / 1000,
    },
    workStatus: {
      type: String,
      enum: ["Idle", "Working"],
      default: "Idle"
    },
    contact: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    skill: {
      type: String,
      default: "General"
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;