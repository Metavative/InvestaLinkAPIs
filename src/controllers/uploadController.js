import createError from "http-errors";
import { presignUpload } from "../utils/s3.js";

export const presignDealImage = async (req, res) => {
  const { contentType } = req.body;
  if (!contentType || !contentType.startsWith("image/"))
    throw createError(400, "Invalid contentType");
  const keyPrefix = `deals/${req.params.id}/images`;
  const signed = await presignUpload({ keyPrefix, contentType });
  res.json(signed);
};

export const presignDealDoc = async (req, res) => {
  const { contentType } = req.body;
  if (!contentType) throw createError(400, "contentType required");
  const keyPrefix = `deals/${req.params.id}/docs`;
  const signed = await presignUpload({ keyPrefix, contentType });
  res.json(signed);
};
