/**
 * Utilitaire de logging sécurisé pour le système de paiement
 *
 * Ce module fournit des fonctions de logging adaptées au traitement des paiements,
 * en s'assurant qu'aucune donnée sensible n'est exposée dans les logs.
 */

/**
 * Liste des champs sensibles à masquer dans les logs
 */
const SENSITIVE_FIELDS = [
  "cardNumber",
  "cvv",
  "cvc",
  "expiryDate",
  "expirationDate",
  "expiry",
  "password",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "apiKey",
  "key",
  "privateKey",
  "secretKey",
  "ssn",
  "socialSecurityNumber",
  "taxId",
  "dob",
  "dateOfBirth",
  "accountNumber",
  "iban",
  "routingNumber",
  "sortCode",
  "bic",
  "swift",
];

/**
 * Expression régulière pour détecter les numéros de carte de crédit
 */
const CREDIT_CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;

/**
 * Vérifie si une valeur est un objet (non null)
 * @param {*} value - Valeur à vérifier
 * @returns {boolean} Vrai si c'est un objet
 */
const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

/**
 * Masque une chaîne de caractères en ne laissant visible que les premiers et derniers caractères
 * @param {string} value - Chaîne à masquer
 * @param {number} visibleStart - Nombre de caractères visibles au début
 * @param {number} visibleEnd - Nombre de caractères visibles à la fin
 * @returns {string} Chaîne masquée
 */
const maskString = (value, visibleStart = 0, visibleEnd = 4) => {
  if (typeof value !== "string" || value.length <= visibleStart + visibleEnd) {
    return "***";
  }

  const start = value.substring(0, visibleStart);
  const end = value.substring(value.length - visibleEnd);
  const masked = "*".repeat(
    Math.min(value.length - visibleStart - visibleEnd, 8)
  );

  return `${start}${masked}${end}`;
};

/**
 * Nettoyage récursif des données sensibles
 * @param {Object} data - Données à sanitiser
 * @param {Array<string>} path - Chemin actuel de la propriété (pour le nesting)
 * @returns {Object} Données sanitisées
 */
const sanitizeData = (data, path = []) => {
  // Si null ou non-objet, vérifier s'il s'agit d'une donnée sensible
  if (!isObject(data) && !Array.isArray(data)) {
    // Si c'est une chaîne, vérifier si elle contient un numéro de carte
    if (typeof data === "string" && CREDIT_CARD_REGEX.test(data)) {
      return maskString(data, 0, 4);
    }

    // Si c'est une propriété sensible, masquer
    const currentKey = path[path.length - 1];
    if (
      currentKey &&
      SENSITIVE_FIELDS.some((field) =>
        currentKey.toLowerCase().includes(field.toLowerCase())
      )
    ) {
      return typeof data === "string" ? maskString(data, 0, 4) : "***";
    }

    return data;
  }

  // Pour les tableaux, sanitiser chaque élément
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, path));
  }

  // Pour les objets, traiter récursivement chaque propriété
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    // Vérifier si la clé elle-même est sensible
    const isSensitiveKey = SENSITIVE_FIELDS.some((field) =>
      key.toLowerCase().includes(field.toLowerCase())
    );

    if (isSensitiveKey && !isObject(value) && !Array.isArray(value)) {
      sanitized[key] =
        typeof value === "string" ? maskString(value, 0, 4) : "***";
    } else {
      sanitized[key] = sanitizeData(value, [...path, key]);
    }
  }

  return sanitized;
};

/**
 * Journalise un message d'information
 * @param {Object|string} data - Données à journaliser
 */
const info = (data) => {
  const timestamp = new Date().toISOString();
  const sanitizedData = typeof data === "object" ? sanitizeData(data) : data;

  // En production, utiliser un service de logging structuré comme Winston ou Pino
  console.log(
    JSON.stringify({
      level: "info",
      timestamp,
      ...(typeof sanitizedData === "object"
        ? sanitizedData
        : { message: sanitizedData }),
    })
  );
};

/**
 * Journalise un message d'avertissement
 * @param {Object|string} data - Données à journaliser
 */
const warn = (data) => {
  const timestamp = new Date().toISOString();
  const sanitizedData = typeof data === "object" ? sanitizeData(data) : data;

  console.warn(
    JSON.stringify({
      level: "warn",
      timestamp,
      ...(typeof sanitizedData === "object"
        ? sanitizedData
        : { message: sanitizedData }),
    })
  );
};

/**
 * Journalise une erreur
 * @param {Object|string|Error} data - Données d'erreur à journaliser
 */
const error = (data) => {
  const timestamp = new Date().toISOString();
  let errorData;

  if (data instanceof Error) {
    errorData = {
      message: data.message,
      stack: process.env.NODE_ENV === "development" ? data.stack : undefined,
      name: data.name,
    };
  } else {
    errorData = typeof data === "object" ? data : { message: data };
  }

  const sanitizedData = sanitizeData(errorData);

  console.error(
    JSON.stringify({
      level: "error",
      timestamp,
      ...sanitizedData,
    })
  );
};

/**
 * Journalise un événement de transaction/paiement
 * @param {string} event - Type d'événement
 * @param {Object} data - Données associées à l'événement
 */
const transaction = (event, data) => {
  info({
    event,
    ...data,
  });
};

export const logger = {
  info,
  warn,
  error,
  transaction,
};

export default logger;
