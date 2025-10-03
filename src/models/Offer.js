import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
      index: true,
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    message: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

offerSchema.index({ dealId: 1, investorId: 1, createdAt: -1 });

export const Offer = mongoose.model("Offer", offerSchema);
