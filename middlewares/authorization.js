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
    req.seller = { ...decodedToken, _id: decodedToken._id ?? decodedToken.id };
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
