require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const db = require('./src/config/db.config');

// Add process error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection:', { reason, promise });
  process.exit(1);
});

// Set default values
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Railway needs 0.0.0.0

async function startServer() {
  try {
    console.log('Starting server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    console.log('Host:', HOST);
    
    // Test database connection
    console.log('Testing database connection...');
    await db.testConnection();
    console.log('Database connection successful');
    
    // Start server
    app.listen(PORT, HOST, () => {
      logger.info(`Server running on ${HOST}:${PORT}`);
      console.log(`Server running on ${HOST}:${PORT}`);
      console.log(`API documentation available at http://${HOST}:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();