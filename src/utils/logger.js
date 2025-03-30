const winston = require('winston');
const path = require('path');

// Mendefinisikan format logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Konfigurasi logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'salman-sustainability' },
  transports: [
    // Menulis log ke console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
        )
      ),
    }),
    // Menulis semua log ke combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Menulis log error ke error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Jika bukan production, log juga ke console dengan format yang lebih sederhana
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Menangkap uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(__dirname, '../logs/exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Menangkap unhandled rejections
process.on('unhandledRejection', (ex) => {
  throw ex;
});

module.exports = { logger };