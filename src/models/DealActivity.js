import mongoose from "mongoose";

const dealActivitySchema = new mongoose.Schema(
  {
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "deal.created",
        "deal.updated",
        "deal.status_changed",
        "image.added",
        "image.removed",
        "doc.added",
        "doc.removed",
        "offer.created",
        "offer.updated",
        "favorite.added",
        "favorite.removed",
        "comment.added",
      ],
      index: true,
    },
    meta: {},
  },
  { timestamps: true }
);

export const DealActivity = mongoose.model("DealActivity", dealActivitySchema);
