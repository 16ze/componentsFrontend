const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API CRM",
      version: "1.0.0",
      description: "Documentation de l'API du CRM",
      contact: {
        name: "Équipe de développement",
        email: "dev@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Serveur de développement",
      },
      {
        url: "https://api.votredomaine.com/api",
        description: "Serveur de production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
