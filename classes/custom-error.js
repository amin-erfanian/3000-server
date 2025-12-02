class CustomError extends Error {
  constructor(statusCode, errorCode, message, logDetails = null) {
    super();
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.message = message; // message contains fa and en
    this.logDetails = logDetails;

    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
