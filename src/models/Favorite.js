import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ dealId: 1, userId: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);
