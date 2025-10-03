import mongoose from "mongoose";

const investorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
      required: true,
    },
    asset_type: { type: [String], default: [] }, // e.g. ["House","Apartment"]
    budget: { type: String, default: "" }, // keep string to match your app
    tags: { type: [String], default: [] },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

export const InvestorProfile = mongoose.model(
  "InvestorProfile",
  investorProfileSchema
);
