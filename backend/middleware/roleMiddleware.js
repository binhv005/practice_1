const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Middleware này phải chạy sau authMiddleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }

    // Kiểm tra role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
