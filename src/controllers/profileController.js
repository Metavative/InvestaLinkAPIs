import createError from "http-errors";
import { User } from "../models/User.js";
import { InvestorProfile } from "../models/InvestorProfile.js";

// Authenticated: PATCH /profile/investor
export const updateInvestorProfile = async (req, res) => {
  const uid = req.user.sub; // from access token
  const { asset_type = [], budget = "", tags = [], location = "" } = req.body;

  // upsert profile
  const profile = await InvestorProfile.findOneAndUpdate(
    { userId: uid },
    { asset_type, budget, tags, location },
    { upsert: true, new: true }
  );

  // ensure role is investor
  const user = await User.findById(uid);
  if (!user) throw createError(404, "User not found");
  if (user.role !== "investor") {
    user.role = "investor";
    await user.save();
  }

  res.json({
    message: "Investor profile updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile_picture: user.profile_picture || null,
    },
    profile,
  });
};

// Optional public fallback: POST /profile/investor/setup  (no token, uses uid)
export const investorSetup = async (req, res) => {
  const {
    uid,
    asset_type = [],
    budget = "",
    tags = [],
    location = "",
  } = req.body;
  if (!uid) throw createError(400, "Missing uid");

  const user = await User.findById(uid);
  if (!user) throw createError(404, "User not found");
  if (!user.emailVerified) throw createError(400, "Email not verified");

  const profile = await InvestorProfile.findOneAndUpdate(
    { userId: uid },
    { asset_type, budget, tags, location },
    { upsert: true, new: true }
  );

  if (user.role !== "investor") {
    user.role = "investor";
    await user.save();
  }

  res.json({ message: "Investor profile saved", role: user.role, profile });
};
