// lib/models/Registration.ts
import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
  regCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, required: true },
  mobile: { type: String, required: true },
  badgeUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  qrCodeData: { type: String },
});

export const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);
