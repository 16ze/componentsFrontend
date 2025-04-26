const logger = require("../utils/logger");

/**
 * Middleware de gestion d'erreurs centralisé
 */
const errorHandler = (err, req, res, next) => {
  // Journaliser l'erreur
  logger.error(`${err.name}: ${err.message}`, {
    method: req.method,
    url: req.url,
    body: req.body,
    stack: err.stack,
  });

  // Déterminer le statut HTTP
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Répondre au client
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

/**
 * Middleware pour capturer les routes non trouvées
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
