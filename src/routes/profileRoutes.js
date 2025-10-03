import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import {
  updateInvestorProfile,
  investorSetup,
} from "../controllers/profileController.js";

const router = Router();

// ensure folder exists
const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${req.user.sub}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// POST /api/profile/avatar  (field name 'avatar')
router.post(
  "/avatar",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const url = `/uploads/avatars/${req.file.filename}`;
    const update = { profile_picture: { key: req.file.filename, url } };

    const user = await User.findByIdAndUpdate(req.user.sub, update, {
      new: true,
    });
    res.json({
      message: "Avatar updated",
      profile_picture: user.profile_picture,
    });
  }
);

// (optional) PATCH name only (email stays immutable)
router.patch("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.sub,
    { ...(name ? { name } : {}) },
    { new: true }
  );
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_picture: user.profile_picture || null,
    },
  });
});

router.patch("/investor", requireAuth, updateInvestorProfile);

router.post("/investor/setup", investorSetup);

export default router;
