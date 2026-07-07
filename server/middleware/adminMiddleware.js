const adminMiddleware = (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};

module.exports = adminMiddleware;