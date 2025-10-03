export function buildDealFilters(q) {
  const f = {};
  if (q.q) f.$text = { $search: q.q };
  if (q.status) f.status = { $in: q.status.split(",") };
  if (q.type) f.propertyType = { $in: q.type.split(",") };
  if (q.minPrice || q.maxPrice) {
    f.price = {};
    if (q.minPrice) f.price.$gte = Number(q.minPrice);
    if (q.maxPrice) f.price.$lte = Number(q.maxPrice);
  }
  if (q.minBeds || q.maxBeds) {
    f.bedrooms = {};
    if (q.minBeds) f.bedrooms.$gte = Number(q.minBeds);
    if (q.maxBeds) f.bedrooms.$lte = Number(q.maxBeds);
  }
  if (q.city) f["address.city"] = new RegExp(`^${q.city}$`, "i");
  if (q.createdBy) f.createdBy = q.createdBy; // for "my deals"
  if (q.publishedOnly === "1") f.visibility = "public";
  return f;
}
