import { Router } from "express";
import { body } from "express-validator";
import { authLimiter, sensitiveLimiter } from "../middleware/rateLimiters.js";
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  selectRole,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").isString().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isStrongPassword({ minLength: 8, minSymbols: 0 }),
  ],
  register
);

router.post(
  "/verify-email",
  sensitiveLimiter,
  [body("uid").isString(), body("code").isLength({ min: 5, max: 5 })],
  verifyEmail
);

router.post(
  "/resend-verification",
  sensitiveLimiter,
  [body("email").isEmail().normalizeEmail()],
  resendVerification
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8 }),
  ],
  login
);

router.post("/refresh", refresh);
router.post("/logout", logout);

router.post(
  "/forgot-password",
  sensitiveLimiter,
  [body("email").isEmail().normalizeEmail()],
  forgotPassword
);

router.post(
  "/reset-password",
  sensitiveLimiter,
  [
    body("uid").isString(),
    body("code").isLength({ min: 5, max: 5 }),
    body("password").isStrongPassword({ minLength: 8, minSymbols: 0 }),
  ],
  resetPassword
);

router.post(
  "/select-role",
  [body("uid").isString(), body("role").isIn(["sourcer", "investor"])],
  selectRole
);

router.get("/me", requireAuth, async (req, res) => {
  const u = await User.findById(req.user.sub).lean();
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json({
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailVerified: u.emailVerified,
      profile_picture: u.profile_picture || null,
    },
  });
});

export default router;
