const jwt = require('jsonwebtoken');
const CustomError = require('../classes/custom-error');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new CustomError(
      401,
      'INVALID_ACCESS',
      { fa: 'دسترسی غیر مجاز', en: 'Invalid access' },
      JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        ip: req.ip,
      }),
    );
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const authUser = { ...decodedToken, _id: decodedToken._id ?? decodedToken.id };
    req.auth = authUser;

    if (authUser.role === 'seller') {
      req.seller = authUser;
    } else if (authUser.role === 'admin') {
      req.admin = authUser;
    } else if (authUser.role === 'user') {
      req.user = authUser;
    }

    next();
  } catch (error) {
    throw new CustomError(
      401,
      'INVALID_TOKEN',
      { fa: 'توکن معتبر نیست.', en: 'Invalid token' },
      JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        ip: req.ip,
      }),
    );
  }
};

module.exports = authMiddleware;
