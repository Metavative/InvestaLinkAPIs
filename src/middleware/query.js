export function parsePagination(req, _res, next) {
  req.qp = {
    page: Math.max(1, parseInt(req.query.page || "1", 10)),
    limit: Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10))),
    sort: req.query.sort || "-createdAt",
  };
  next();
}
