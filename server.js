require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const db = require('./src/config/db.config');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.testConnection();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();