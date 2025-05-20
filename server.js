require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const db = require('./src/config/db.config');

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Endpoint untuk autentikasi pengguna
 *   - name: Users
 *     description: Endpoint untuk manajemen data pengguna
 */

const PORT = process.env.PORT;
const HOST = process.env.HOST;

async function startServer() {
  try {
    await db.testConnection();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API documentation available at http://${HOST}:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();