module.exports = function extractEssentialErrorInfo(error) {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    stack: error.stack?.split('\n')[0], // only first line of stack
  };
};
