const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Personal Budget API",
      version: "1.0.0",
      description: "API for managing budger envelopes and transactions",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./envelopes.js", "./transactions.js"], //paths to route files
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
