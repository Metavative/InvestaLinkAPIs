import { Favorite } from "../models/Favorite.js";
import { DealActivity } from "../models/DealActivity.js";

export const addFavorite = async (req, res) => {
  const { dealId } = req.params;
  const doc = await Favorite.findOneAndUpdate(
    { dealId, userId: req.user.sub },
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await DealActivity.create({
    dealId,
    actorId: req.user.sub,
    type: "favorite.added",
    meta: {},
  });
  res.status(201).json(doc);
};

export const removeFavorite = async (req, res) => {
  const { dealId } = req.params;
  await Favorite.findOneAndDelete({ dealId, userId: req.user.sub });
  await DealActivity.create({
    dealId,
    actorId: req.user.sub,
    type: "favorite.removed",
    meta: {},
  });
  res.json({ message: "Removed" });
};

export const listMyFavorites = async (req, res) => {
  const favs = await Favorite.find({ userId: req.user.sub }).sort("-createdAt");
  res.json(favs);
};
