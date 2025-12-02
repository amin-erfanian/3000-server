const util = require('util');
const extractEssentialErrorInfo = require('../utilities/extract-error');
const CustomError = require('../classes/custom-error');
const logger = require('../classes/custom-logger');

const UTILS_CONFIG = { depth: null, compact: true, breakLength: Infinity };
const errorHandlerMiddleware = (error, req, res, _next) => {
  if (error instanceof CustomError) {
    logger.error(
      `[${error.statusCode} - ${error.errorCode}] ${error.message.en} ${
        error.logDetails ? `\n--- Details: ${error.logDetails}` : ''
      }`,
    );

    return res.status(error.statusCode).json({
      error_code: error.errorCode,
      message: error.message || {
        en: 'Unknown error',
        fa: 'خطای ناشناخته',
      },
    });
  }

  // For unknown errors, send a generic response
  logger.error(
    `[500 - UNKNOWN_ERROR]\n---Details: ${util.inspect(extractEssentialErrorInfo(error), UTILS_CONFIG)}`,
  );
  return res.status(500).json({
    error_code: 'UNKNOWN_ERROR',
    message: {
      en: 'An unexpected error occurred. Please try again later.',
      fa: 'خطای ناشناخته. لطفا بعدا تلاش کنید.',
    },
  });
};

module.exports = errorHandlerMiddleware;
