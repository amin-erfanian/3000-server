// middlewares/role.js
module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    const authUser = req.auth || req.user || req.seller || req.admin;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز',
      });
    }

    if (!allowedRoles.includes(authUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'شما به این بخش دسترسی ندارید',
      });
    }

    next();
  };
};
