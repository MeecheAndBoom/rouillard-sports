import { Schema, model, models } from "mongoose";

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "Admin" },
    passwordHash: { type: String, required: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const Admin = models.Admin ?? model("Admin", AdminSchema);
