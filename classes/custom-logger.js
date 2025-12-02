const { createLogger, format, transports } = require('winston');

const levelFilter = (level) =>
  format((info) => {
    return info.level === level ? info : false;
  });

class Logger {
  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [
        new transports.File({
          level: 'error',
          filename: 'logs/error.log',
          format: format.combine(levelFilter('error')(), format.timestamp()),
        }),
        new transports.File({
          level: 'warn',
          filename: 'logs/warn.log',
          format: format.combine(levelFilter('warn')(), format.timestamp()),
        }),
        new transports.File({
          level: 'info',
          filename: 'logs/info.log',
          format: format.combine(levelFilter('info')(), format.timestamp()),
        }),
      ],
    });
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }
}

module.exports = new Logger();
