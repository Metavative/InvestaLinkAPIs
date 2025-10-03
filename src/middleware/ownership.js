import mongoose from "mongoose";
import { Deal } from "../models/Deal.js";

export const requireDealOwnerOrAdmin = async (req, _res, next) => {
  try {
    const id = req.params.id || req.params.dealId;
    if (!mongoose.isValidObjectId(id))
      return next({ status: 400, message: "Invalid id" });
    const deal = await Deal.findById(id).select("createdBy");
    if (!deal) return next({ status: 404, message: "Deal not found" });

    const isOwner = deal.createdBy?.toString() === req.user?.sub;
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin)
      return next({ status: 403, message: "Forbidden" });
    req._deal = deal;
    next();
  } catch (e) {
    next(e);
  }
};
