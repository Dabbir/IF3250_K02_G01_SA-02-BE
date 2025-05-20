const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Salman Sustainability Report API',
      version: '1.0.0',
      description: 'API documentation for Salman Sustainability Report',
      contact: {
        name: 'Kelompok 01',
      },
    },
    servers: [
      {
        url: 'https://if3250k02g01sa-02-be-production.up.railway.app',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };