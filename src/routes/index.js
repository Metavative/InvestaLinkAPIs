import { Router } from "express";
import authRoutes from "./authRoutes.js";
import dealRoutes from "./dealRoutes.js";
import offerRoutes from "./offerRoutes.js";
import profileRoutes from "./profileRoutes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/auth", authRoutes);
router.use("/deals", dealRoutes);
router.use("/deals/:dealId/offers", offerRoutes);
router.use("/profile", profileRoutes);

export default router;
