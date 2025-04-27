/**
 * Utilitaires de formatage pour les données de paiement
 */

/**
 * Formate un numéro de carte de crédit en ajoutant des espaces
 * @param {string} cardNumber - Numéro de carte brut
 * @returns {string} Numéro formaté
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return "";

  // Supprimer tous les caractères non numériques
  const digitsOnly = cardNumber.replace(/\D/g, "");

  // Formater par groupes de 4 chiffres
  const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");

  return formatted;
};

/**
 * Masque un numéro de carte pour affichage
 * @param {string} cardNumber - Numéro de carte complet
 * @returns {string} Numéro masqué (ex: •••• •••• •••• 4242)
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return "";

  // Supprimer tous les caractères non numériques
  const digitsOnly = cardNumber.replace(/\D/g, "");

  // Ne garder que les 4 derniers chiffres
  const last4 = digitsOnly.slice(-4);

  // Remplacer les autres chiffres par des points
  const maskedPart = "•"
    .repeat(digitsOnly.length - 4)
    .replace(/(.{4})/g, "$1 ")
    .trim();

  return maskedPart ? `${maskedPart} ${last4}` : last4;
};

/**
 * Formate une date d'expiration de carte
 * @param {string|number} month - Mois d'expiration (1-12)
 * @param {string|number} year - Année d'expiration (2 ou 4 chiffres)
 * @returns {string} Date formatée (MM/YY)
 */
export const formatExpiryDate = (month, year) => {
  if (!month || !year) return "";

  // Convertir en nombres
  const numericMonth = parseInt(month, 10);
  let numericYear = parseInt(year, 10);

  // Validation de base
  if (isNaN(numericMonth) || isNaN(numericYear)) return "";
  if (numericMonth < 1 || numericMonth > 12) return "";

  // Si l'année est sur 4 chiffres, ne garder que les 2 derniers
  if (numericYear > 100) {
    numericYear = numericYear % 100;
  }

  // Formater avec leading zeros si nécessaire
  const formattedMonth = numericMonth.toString().padStart(2, "0");
  const formattedYear = numericYear.toString().padStart(2, "0");

  return `${formattedMonth}/${formattedYear}`;
};

/**
 * Extrait le mois et l'année d'une chaîne de date d'expiration
 * @param {string} expiryString - Chaîne de date d'expiration (MM/YY ou MM/YYYY)
 * @returns {Object} Objet contenant mois et année
 */
export const parseExpiryDate = (expiryString) => {
  if (!expiryString) {
    return { month: "", year: "" };
  }

  // Support pour plusieurs formats (MM/YY, MM/YYYY, MM-YY, etc.)
  const parts = expiryString.split(/[/\s-]+/);

  if (parts.length < 2) {
    return { month: "", year: "" };
  }

  return {
    month: parts[0].trim(),
    year: parts[1].trim(),
  };
};

/**
 * Détermine le type de carte de crédit en fonction du numéro
 * @param {string} cardNumber - Numéro de carte
 * @returns {string} Type de carte (visa, mastercard, amex, etc.)
 */
export const getCardType = (cardNumber) => {
  if (!cardNumber) return "";

  // Supprimer tous les caractères non numériques
  const digitsOnly = cardNumber.replace(/\D/g, "");

  // Règles de détection simplifiées
  if (/^4/.test(digitsOnly)) return "visa";
  if (/^5[1-5]/.test(digitsOnly)) return "mastercard";
  if (/^3[47]/.test(digitsOnly)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digitsOnly)) return "discover";
  if (/^(62|88)/.test(digitsOnly)) return "unionpay";
  if (/^(5[06-8]|6)/.test(digitsOnly)) return "maestro";
  if (/^(30[0-5]|36|38)/.test(digitsOnly)) return "diners";
  if (/^35/.test(digitsOnly)) return "jcb";

  return "unknown";
};

/**
 * Formate un montant pour affichage avec devise
 * @param {number} amount - Montant en centimes
 * @param {string} currency - Code devise (EUR, USD, etc.)
 * @param {string} locale - Locale pour le formatage (fr-FR, en-US, etc.)
 * @returns {string} Montant formaté avec symbole de devise
 */
export const formatAmount = (amount, currency = "EUR", locale = "fr-FR") => {
  if (amount === undefined || amount === null) return "";

  // Convertir des centimes à l'unité
  const unitAmount = amount / 100;

  // Utiliser l'API Intl pour formater selon la locale
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(unitAmount);
};

/**
 * Formate un IBAN pour affichage
 * @param {string} iban - IBAN brut
 * @returns {string} IBAN formaté avec espaces
 */
export const formatIBAN = (iban) => {
  if (!iban) return "";

  // Supprimer les espaces existants et convertir en majuscules
  const cleanedIban = iban.replace(/\s/g, "").toUpperCase();

  // Formater par groupes de 4 caractères
  return cleanedIban.replace(/(.{4})(?=.)/g, "$1 ");
};

/**
 * Masque un IBAN pour affichage sécurisé
 * @param {string} iban - IBAN complet
 * @returns {string} IBAN partiellement masqué
 */
export const maskIBAN = (iban) => {
  if (!iban) return "";

  // Supprimer les espaces
  const cleanedIban = iban.replace(/\s/g, "");

  if (cleanedIban.length < 10) return cleanedIban;

  // Garder les 4 premiers et 4 derniers caractères visibles
  const prefix = cleanedIban.substring(0, 4);
  const suffix = cleanedIban.substring(cleanedIban.length - 4);
  const maskedPart = "•".repeat(cleanedIban.length - 8);

  // Formater avec des espaces
  return `${prefix} ${maskedPart.replace(/(.{4})/g, "$1 ").trim()} ${suffix}`;
};

/**
 * Renvoie un objet avec des fonctions de formatage localisées
 * @param {string} locale - Locale pour le formatage (fr-FR, en-US, etc.)
 * @returns {Object} Fonctions de formatage localisées
 */
export const getLocalizedFormatters = (locale = "fr-FR") => {
  return {
    formatAmount: (amount, currency = "EUR") =>
      formatAmount(amount, currency, locale),
    formatDate: (date) => {
      if (!date) return "";

      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date));
    },
    formatTime: (date) => {
      if (!date) return "";

      return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    },
    formatDateTime: (date) => {
      if (!date) return "";

      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    },
  };
};

export default {
  formatCardNumber,
  maskCardNumber,
  formatExpiryDate,
  parseExpiryDate,
  getCardType,
  formatAmount,
  formatIBAN,
  maskIBAN,
  getLocalizedFormatters,
};
