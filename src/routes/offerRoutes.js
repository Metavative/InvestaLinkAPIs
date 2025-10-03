import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import {
  createOffer,
  listOffersForDeal,
  updateOfferStatus,
} from "../controllers/offerController.js";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listOffersForDeal);
router.post("/", requireAuth, [body("amount").isNumeric()], createOffer);
router.post(
  "/:offerId/status",
  requireAuth,
  [body("status").isIn(["accepted", "rejected", "withdrawn"])],
  updateOfferStatus
);

export default router;
