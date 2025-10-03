// src/routes/dealRoutes.js
import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { isRole } from "../middleware/roles.js";
import { createDealLocal, listMyDeals } from "../controllers/dealController.js";
import { listDeals } from "../controllers/dealController.js";

const storage = multer.diskStorage({
  destination: "uploads/", // make sure this folder exists
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

const router = Router();

router.get("/", listDeals);

router.post(
  "/",
  requireAuth,
  isRole("sourcer", "admin"),
  upload.array("photos"), // handles multiple photos
  [
    body("title").isString().isLength({ min: 2 }),
    body("listing_type").isIn(["Rent", "Buy"]),
    body("property_category").isIn(["House", "Apartment", "Hotel", "Land"]),
    body("deal_type").isIn([
      "BRR Deal",
      "Rent to SA",
      "Rent to HMO",
      "Flip",
      "Land Development",
      "Rent to Hotel",
    ]),
  ],
  createDealLocal
);

router.get("/mine", requireAuth, isRole("sourcer", "admin"), listMyDeals);

export default router;
