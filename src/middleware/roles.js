export const isRole =
  (...roles) =>
  (req, _res, next) => {
    const role = req.user?.role || "unassigned";
    if (!roles.includes(role))
      return next({ status: 403, message: "Insufficient role" });
    next();
  };
