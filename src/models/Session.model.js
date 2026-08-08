import mongoose from "mongoose";
import User from "./User.model.js";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  clockIn: {
    type: Date,
    required: true,
  },

  clockOut: {
    type: Date,
    default: null,
  },

  durationMinutes: {
    type: Number,
    default: 0,
    set: (v) => Math.round(v * 1000) / 1000,
  },

  isClosed: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session