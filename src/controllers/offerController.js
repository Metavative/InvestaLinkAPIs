import createError from "http-errors";
import { Offer } from "../models/Offer.js";
import { Deal } from "../models/Deal.js";
import { DealActivity } from "../models/DealActivity.js";

export const createOffer = async (req, res) => {
  if (req.user?.role !== "investor" && req.user?.role !== "admin")
    throw createError(403, "Only investors can create offers");
  const { dealId } = req.params;
  const { amount, currency = "PKR", message } = req.body;
  const deal = await Deal.findById(dealId);
  if (!deal) throw createError(404, "Deal not found");
  if (deal.visibility !== "public" || deal.status === "draft")
    throw createError(403, "Deal not open for offers");
  const offer = await Offer.create({
    dealId,
    investorId: req.user.sub,
    amount,
    currency,
    message,
  });
  await DealActivity.create({
    dealId,
    actorId: req.user.sub,
    type: "offer.created",
    meta: { offerId: offer._id, amount },
  });
  res.status(201).json(offer);
};

export const listOffersForDeal = async (req, res) => {
  const { dealId } = req.params;
  const role = req.user?.role;
  const filter = { dealId };
  if (role === "investor") filter.investorId = req.user.sub;
  const offers = await Offer.find(filter).sort("-createdAt");
  res.json(offers);
};

export const updateOfferStatus = async (req, res) => {
  const { offerId } = req.params;
  const { status } = req.body;
  const offer = await Offer.findById(offerId);
  if (!offer) throw createError(404, "Offer not found");
  if (status === "withdrawn") {
    if (req.user?.sub !== offer.investorId.toString())
      throw createError(403, "Only owner can withdraw");
  } else {
    const deal = await Deal.findById(offer.dealId);
    const isDealOwner =
      deal?.createdBy?.toString() === req.user?.sub ||
      req.user?.role === "admin";
    if (!isDealOwner)
      throw createError(403, "Only deal owner can accept/reject");
  }
  offer.status = status;
  await offer.save();
  await DealActivity.create({
    dealId: offer.dealId,
    actorId: req.user.sub,
    type: "offer.updated",
    meta: { offerId: offer._id, status },
  });
  res.json(offer);
};
