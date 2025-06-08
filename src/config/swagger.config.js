const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Salman Sustainability Report API',
      version: '1.0.0',
      description: `
        API documentation for Salman Sustainability Report
        
        ## Authentication
        This API uses JWT Bearer tokens for authentication.
        
        ## Rate Limiting
        API calls are limited to prevent abuse.
        
        ## Error Handling
        All errors return JSON with error message and status code.
      `,
      contact: {
        name: 'Kelompok 01',
        email: 'kelompok01@example.com',
        url: 'https://github.com/kelompok01/sustainability-report'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://if3250k02g01sa-02-be-production.up.railway.app',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>'
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unauthorized'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Reports',
        description: 'Sustainability report management'
      },
      {
        name: 'Users',
        description: 'User management'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };