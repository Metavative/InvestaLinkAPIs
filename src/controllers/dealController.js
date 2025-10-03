// src/controllers/dealController.js
import crypto from "crypto";
import createError from "http-errors";
import { Deal } from "../models/Deal.js";
import { DealActivity } from "../models/DealActivity.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials:
    process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }
      : undefined,
  forcePathStyle:
    !!process.env.S3_ENDPOINT && !/amazonaws/.test(process.env.S3_ENDPOINT),
});

const toNum = (v) =>
  v === "" || v === undefined || v === null ? undefined : Number(v);
const toBool = (v) =>
  v === true || v === "1" || v === 1 || v === "true"
    ? true
    : v === false || v === "0" || v === 0 || v === "false"
    ? false
    : undefined;
const arr = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);

const requiredByType = {
  "BRR Deal": [
    "location",
    "purchase_price",
    "tenure",
    "refurb_cost",
    "stamp_duty",
    "legals",
    "gdv",
    "roi",
    "money_left",
  ],
  "Flip": [
    "location",
    "purchase_price",
    "tenure",
    "estimate_refurbishment_cost",
    "stamp_duty",
    "legal_fee",
    "gdv",
    "roi",
  ],
  "Rent to SA": [
    "location",
    "monthly_rent",
    "deposit",
    "bills",
    "other_costs",
    "nightly_rate",
    "bedrooms",
    "bathrooms",
    "furnished",
    "profit_50",
    "profit_70",
    "profit_100",
  ],
  "Rent to HMO": [
    "location",
    "monthly_rent",
    "deposit",
    "bills",
    "other_costs",
    "bedrooms",
    "bathrooms",
    "furnished",
    "gross_monthly_income",
    "monthly_profit",
  ],
  "Land Development": ["location", "build_cost", "gdv"],
  "Rent to Hotel": [
    "location",
    "monthly_rent",
    "deposit",
    "bills",
    "other_costs",
    "nightly_rate",
    "bedrooms",
    "bathrooms",
    "furnished",
    "profit_50",
    "profit_70",
    "profit_100",
  ],
};

export const createDeal = async (req, res) => {
  // Build payload using the exact keys your app sends
  const b = req.body;
  const payload = {
    title: b.title,
    listing_type: b.listing_type,
    property_category: b.property_category,
    deal_type: b.deal_type,
    location: b.location,
    ai_details: b.ai_details,

    purchase_price: toNum(b.purchase_price),
    tenure: b.tenure,
    lease_length: toNum(b.lease_length),
    lease_extension: toNum(b.lease_extension),
    refurb_cost: toNum(b.refurb_cost),
    estimate_refurbishment_cost: toNum(b.estimate_refurbishment_cost),
    stamp_duty: toNum(b.stamp_duty),
    legals: toNum(b.legals),
    legal_fee: toNum(b.legal_fee),
    other_costs: b.other_costs,
    gdv: toNum(b.gdv),
    roi: toNum(b.roi),
    money_left: toNum(b.money_left),

    monthly_rent: toNum(b.monthly_rent),
    deposit: toNum(b.deposit),
    bills: toNum(b.bills),
    nightly_rate: toNum(b.nightly_rate),
    bedrooms: toNum(b.bedrooms),
    bathrooms: toNum(b.bathrooms),
    parking: toBool(b.parking),
    parking_available: toBool(b.parking_available),
    company_let: toBool(b.company_let),
    furnished: b.furnished,
    profit_50: toNum(b.profit_50),
    profit_70: toNum(b.profit_70),
    profit_100: toNum(b.profit_100),
    management: toBool(b.management),
    gross_monthly_income: toNum(b.gross_monthly_income),
    monthly_profit: toNum(b.monthly_profit),

    planning_approved: toBool(b.planning_approved),
    build_cost: toNum(b.build_cost),

    additional_details: b.additional_details,
    extra_details: b.extra_details,
    sourcing_fee: toNum(b.sourcing_fee),

    // arrays from repeated keys "rent_tags[]" / "sell_tags[]"
    rent_tags: arr(b["rent_tags[]"] ?? b.rent_tags),
    sell_tags: arr(b["sell_tags[]"] ?? b.sell_tags),

    featured: b.featured === "true" || b.featured === "1",

    status: "draft",
    visibility: "private",
    createdBy: req.user.sub,
  };

  // server-side validation compatible with your frontend rules
  const must = requiredByType[payload.deal_type] || [];
  const missing = must.filter(
    (k) => payload[k] === undefined || payload[k] === ""
  );
  if (missing.length)
    throw createError(422, `Missing required fields: ${missing.join(", ")}`);

  // create first (to use _id in S3 keys)
  const deal = await Deal.create(payload);

  // Handle photos posted as photos or photos[0..n]
  const photoFiles = (req.files || []).filter(
    (f) => f.fieldname === "photos" || /^photos\[\d+\]$/.test(f.fieldname)
  );

  if (photoFiles.length) {
    const bucket = process.env.S3_BUCKET;
    const publicBase = (
      process.env.S3_PUBLIC_BASE || `https://${bucket}.s3.amazonaws.com`
    ).replace("{bucket}", bucket);

    const uploads = await Promise.all(
      photoFiles.map(async (f) => {
        const key = `deals/${deal._id}/photos/${crypto.randomUUID()}_${
          f.originalname
        }`;
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: f.buffer,
            ContentType: f.mimetype,
            ACL: "public-read",
          })
        );
        return { key, url: `${publicBase}/${key}` };
      })
    );

    deal.photos.push(...uploads);
    await deal.save();
  }

  await DealActivity.create({
    dealId: deal._id,
    actorId: req.user.sub,
    type: "deal.created",
    meta: { photoCount: photoFiles.length },
  });
  res.status(201).json(deal);
};

export const createDealLocal = async (req, res) => {
  const deal = await Deal.create({
    ...req.body,
    createdBy: req.user.sub,
    featured: req.body.featured === "true" || req.body.featured === "1",
    photos: (req.files || []).map((f) => ({
      key: f.filename,
      url: `/uploads/${f.filename}`, // served by express.static
    })),
  });

  res.status(201).json(deal);
};

export const listMyDeals = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Deal.find({ createdBy: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Deal.countDocuments({ createdBy: req.user.sub }),
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

export const listDeals = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    featured,
    status,
    visibility,
    asset_type, // comma list of categories: "House,Apartment"
    mine, // if you also want /deals?mine=1 to work
  } = req.query;

  const q = {};

  // public defaults (investor home)
  if (!mine) {
    if (status) q.status = status; // e.g. "published"
    if (visibility) q.visibility = visibility; // e.g. "public"
  }

  if (featured === "1" || featured === "true") q.featured = true;

  if (asset_type) {
    const arr = asset_type
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) q.property_category = { $in: arr };
  }

  if (mine && req.user?.sub) {
    q.createdBy = req.user.sub; // requires auth if you use ?mine=1
  }

  const pageNum = Math.max(1, Number(page));
  const lim = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * lim;

  const [items, total] = await Promise.all([
    Deal.find(q).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Deal.countDocuments(q),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / lim) });
};
