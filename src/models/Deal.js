// src/models/Deal.js
import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  { key: String, url: String, width: Number, height: Number, caption: String },
  { _id: false }
);

const dealSchema = new mongoose.Schema(
  {
    // Step 1
    title: { type: String, required: true },
    listing_type: { type: String, enum: ["Rent", "Buy"], required: true },
    property_category: {
      type: String,
      enum: ["House", "Apartment", "Hotel", "Land"],
      required: true,
    },
    deal_type: {
      type: String,
      enum: [
        "BRR Deal",
        "Rent to SA",
        "Rent to HMO",
        "Flip",
        "Land Development",
        "Rent to Hotel",
      ],
      required: true,
    },

    // Common
    location: String,
    ai_details: String,
    rent_tags: { type: [String], default: [] },
    sell_tags: { type: [String], default: [] },

    // BRR / Flip
    purchase_price: Number,
    tenure: { type: String, enum: ["Freehold", "Leasehold"] },
    lease_length: Number,
    lease_extension: Number,
    refurb_cost: Number,
    estimate_refurbishment_cost: Number,
    stamp_duty: Number,
    legals: Number,
    legal_fee: Number,
    other_costs: String,
    gdv: Number,
    roi: Number,
    money_left: Number,

    // Rent / HMO / Hotel
    monthly_rent: Number,
    deposit: Number,
    bills: Number,
    nightly_rate: Number,
    bedrooms: Number,
    bathrooms: Number,
    parking: Boolean,
    parking_available: Boolean,
    company_let: Boolean,
    furnished: { type: String, enum: ["Furnished", "Unfurnished"] },
    profit_50: Number,
    profit_70: Number,
    profit_100: Number,
    management: Boolean,
    gross_monthly_income: Number,
    monthly_profit: Number,

    // Land
    planning_approved: Boolean,
    build_cost: Number,

    // Extra
    additional_details: String,
    extra_details: String,
    sourcing_fee: Number,

    // Media
    photos: { type: [photoSchema], default: [] },

    featured: { type: Boolean, default: false },

    // Ownership/visibility
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "published",
        "reserved",
        "sold",
        "archived",
      ],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

dealSchema.index({
  title: "text",
  location: "text",
  additional_details: "text",
  extra_details: "text",
});

export const Deal = mongoose.model("Deal", dealSchema);
