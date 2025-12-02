const jwt = require('jsonwebtoken');
const CustomError = require('../classes/custom-error');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

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
    req.user = decodedToken;
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
