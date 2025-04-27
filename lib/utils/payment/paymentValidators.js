/**
 * Utilitaires de validation pour les données de paiement
 */

/**
 * Implémentation de l'algorithme de Luhn pour la validation des numéros de carte
 * @param {string} cardNumber - Numéro de carte à valider
 * @returns {boolean} Vrai si le numéro est valide selon l'algorithme de Luhn
 */
export const luhnCheck = (cardNumber) => {
  if (!cardNumber) return false;

  // Supprimer les espaces et autres caractères non numériques
  const digits = cardNumber.replace(/\D/g, "");

  if (!digits || digits.length < 12) return false;

  // Appliquer l'algorithme de Luhn
  let sum = 0;
  let shouldDouble = false;

  // Parcourir les chiffres de droite à gauche
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Valide un numéro de carte de crédit
 * @param {string} cardNumber - Numéro de carte à valider
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) {
    return {
      isValid: false,
      error: "Le numéro de carte est requis",
    };
  }

  // Supprimer les espaces et autres caractères non numériques
  const digits = cardNumber.replace(/\D/g, "");

  if (digits.length < 12 || digits.length > 19) {
    return {
      isValid: false,
      error: "Le numéro de carte doit comporter entre 12 et 19 chiffres",
    };
  }

  if (!luhnCheck(digits)) {
    return {
      isValid: false,
      error: "Numéro de carte invalide",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un code de sécurité (CVV/CVC)
 * @param {string} cvv - Code de sécurité à valider
 * @param {string} cardType - Type de carte (visa, amex, etc.)
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validateCVV = (cvv, cardType = "") => {
  if (!cvv) {
    return {
      isValid: false,
      error: "Le code de sécurité est requis",
    };
  }

  // Supprimer les espaces et autres caractères non numériques
  const digits = cvv.replace(/\D/g, "");

  // American Express utilise un code à 4 chiffres, les autres cartes à 3 chiffres
  const expectedLength = cardType.toLowerCase() === "amex" ? 4 : 3;

  if (digits.length !== expectedLength) {
    return {
      isValid: false,
      error: `Le code de sécurité doit comporter ${expectedLength} chiffres`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide une date d'expiration
 * @param {string|number} month - Mois d'expiration (1-12)
 * @param {string|number} year - Année d'expiration (2 ou 4 chiffres)
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validateExpiryDate = (month, year) => {
  if (!month || !year) {
    return {
      isValid: false,
      error: "La date d'expiration est requise",
    };
  }

  // Convertir en nombres
  const numericMonth = parseInt(month, 10);
  let numericYear = parseInt(year, 10);

  if (isNaN(numericMonth) || isNaN(numericYear)) {
    return {
      isValid: false,
      error: "Date d'expiration invalide",
    };
  }

  if (numericMonth < 1 || numericMonth > 12) {
    return {
      isValid: false,
      error: "Le mois doit être compris entre 1 et 12",
    };
  }

  // Gestion des années à 2 ou 4 chiffres
  if (numericYear < 100) {
    numericYear += 2000; // Convertir 23 en 2023
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() retourne 0-11
  const currentYear = now.getFullYear();

  if (
    numericYear < currentYear ||
    (numericYear === currentYear && numericMonth < currentMonth)
  ) {
    return {
      isValid: false,
      error: "La carte a expiré",
    };
  }

  // Vérifier que la date n'est pas trop loin dans le futur (généralement 10 ans max)
  if (numericYear > currentYear + 10) {
    return {
      isValid: false,
      error: "Date d'expiration trop éloignée",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un titulaire de carte
 * @param {string} cardholderName - Nom du titulaire à valider
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validateCardholderName = (cardholderName) => {
  if (!cardholderName) {
    return {
      isValid: false,
      error: "Le nom du titulaire est requis",
    };
  }

  if (cardholderName.trim().length < 3) {
    return {
      isValid: false,
      error: "Le nom du titulaire doit comporter au moins 3 caractères",
    };
  }

  // Vérifier qu'il y a au moins deux mots (prénom + nom)
  const nameParts = cardholderName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return {
      isValid: false,
      error: "Veuillez saisir le prénom et le nom du titulaire",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un code postal
 * @param {string} postalCode - Code postal à valider
 * @param {string} countryCode - Code pays (FR, US, etc.)
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validatePostalCode = (postalCode, countryCode = "FR") => {
  if (!postalCode) {
    return {
      isValid: false,
      error: "Le code postal est requis",
    };
  }

  const cleanedPostalCode = postalCode.trim();

  // Validation spécifique par pays
  switch (countryCode.toUpperCase()) {
    case "FR":
      // Code postal français: 5 chiffres
      if (!/^\d{5}$/.test(cleanedPostalCode)) {
        return {
          isValid: false,
          error: "Le code postal français doit comporter 5 chiffres",
        };
      }
      break;
    case "US":
      // Code postal américain: 5 chiffres ou 5+4 chiffres
      if (!/^\d{5}(-\d{4})?$/.test(cleanedPostalCode)) {
        return {
          isValid: false,
          error:
            "Le code postal américain doit être au format 12345 ou 12345-6789",
        };
      }
      break;
    case "CA":
      // Code postal canadien: A1A 1A1
      if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(cleanedPostalCode)) {
        return {
          isValid: false,
          error: "Le code postal canadien doit être au format A1A 1A1",
        };
      }
      break;
    case "GB":
      // Code postal britannique: formats variés
      if (
        !/^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/.test(cleanedPostalCode)
      ) {
        return {
          isValid: false,
          error: "Format de code postal britannique invalide",
        };
      }
      break;
    default:
      // Validation générique: au moins 3 caractères
      if (cleanedPostalCode.length < 3) {
        return {
          isValid: false,
          error: "Le code postal doit comporter au moins 3 caractères",
        };
      }
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un numéro de téléphone
 * @param {string} phoneNumber - Numéro de téléphone à valider
 * @param {string} countryCode - Code pays (FR, US, etc.)
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validatePhoneNumber = (phoneNumber, countryCode = "FR") => {
  if (!phoneNumber) {
    return {
      isValid: false,
      error: "Le numéro de téléphone est requis",
    };
  }

  // Supprimer les espaces, tirets et parenthèses
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Validation spécifique par pays
  switch (countryCode.toUpperCase()) {
    case "FR":
      // Numéro français: 10 chiffres commençant par 0
      if (!/^0\d{9}$/.test(cleanedNumber)) {
        return {
          isValid: false,
          error:
            "Le numéro français doit comporter 10 chiffres et commencer par 0",
        };
      }
      break;
    case "US":
    case "CA":
      // Numéro nord-américain: 10 chiffres
      if (!/^\+?1?\d{10}$/.test(cleanedNumber)) {
        return {
          isValid: false,
          error: "Le numéro nord-américain doit comporter 10 chiffres",
        };
      }
      break;
    default:
      // Validation générique: au moins 8 chiffres
      if (!/^\+?[0-9]{8,}$/.test(cleanedNumber)) {
        return {
          isValid: false,
          error: "Le numéro de téléphone doit comporter au moins 8 chiffres",
        };
      }
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un IBAN
 * @param {string} iban - IBAN à valider
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validateIBAN = (iban) => {
  if (!iban) {
    return {
      isValid: false,
      error: "L'IBAN est requis",
    };
  }

  // Supprimer les espaces et convertir en majuscules
  const cleanedIban = iban.replace(/\s/g, "").toUpperCase();

  // Vérification de la longueur (varie selon les pays, mais généralement entre 15 et 34)
  if (cleanedIban.length < 15 || cleanedIban.length > 34) {
    return {
      isValid: false,
      error: "La longueur de l'IBAN est incorrecte",
    };
  }

  // Vérification du format de base: 2 lettres suivies de chiffres/lettres
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleanedIban)) {
    return {
      isValid: false,
      error: "Le format de l'IBAN est incorrect",
    };
  }

  // Déplacement des 4 premiers caractères à la fin
  const rearranged = cleanedIban.substring(4) + cleanedIban.substring(0, 4);

  // Conversion des lettres en chiffres (A=10, B=11, etc.)
  let expanded = "";
  for (let i = 0; i < rearranged.length; i++) {
    const c = rearranged.charAt(i);
    if (c >= "A" && c <= "Z") {
      expanded += c.charCodeAt(0) - "A".charCodeAt(0) + 10;
    } else {
      expanded += c;
    }
  }

  // Calcul du modulo 97
  let remainder = 0;
  for (let i = 0; i < expanded.length; i++) {
    remainder = (remainder * 10 + parseInt(expanded.charAt(i), 10)) % 97;
  }

  if (remainder !== 1) {
    return {
      isValid: false,
      error: "IBAN invalide",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un BIC/SWIFT
 * @param {string} bic - BIC à valider
 * @returns {Object} Résultat de la validation avec message d'erreur si invalide
 */
export const validateBIC = (bic) => {
  if (!bic) {
    return {
      isValid: false,
      error: "Le BIC est requis",
    };
  }

  // Supprimer les espaces et convertir en majuscules
  const cleanedBic = bic.replace(/\s/g, "").toUpperCase();

  // BIC: 8 ou 11 caractères
  // Format: 4 lettres (code banque) + 2 lettres (code pays) + 2 caractères (code localité) + 3 caractères (code branche, optionnel)
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanedBic)) {
    return {
      isValid: false,
      error: "Le format du BIC est incorrect",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valide un formulaire complet de paiement par carte
 * @param {Object} formData - Données du formulaire
 * @returns {Object} Résultat de la validation avec erreurs par champ
 */
export const validatePaymentForm = (formData) => {
  const {
    cardNumber,
    cardholderName,
    expiryMonth,
    expiryYear,
    cvv,
    postalCode,
    countryCode,
  } = formData;

  const cardType = getCardTypeFromNumber(cardNumber);

  const cardNumberValidation = validateCardNumber(cardNumber);
  const cardholderValidation = validateCardholderName(cardholderName);
  const expiryValidation = validateExpiryDate(expiryMonth, expiryYear);
  const cvvValidation = validateCVV(cvv, cardType);
  const postalCodeValidation = validatePostalCode(postalCode, countryCode);

  const hasErrors =
    !cardNumberValidation.isValid ||
    !cardholderValidation.isValid ||
    !expiryValidation.isValid ||
    !cvvValidation.isValid ||
    !postalCodeValidation.isValid;

  return {
    isValid: !hasErrors,
    fieldErrors: {
      cardNumber: cardNumberValidation.error,
      cardholderName: cardholderValidation.error,
      expiry: expiryValidation.error,
      cvv: cvvValidation.error,
      postalCode: postalCodeValidation.error,
    },
  };
};

/**
 * Détecte le type de carte à partir du numéro
 * @param {string} cardNumber - Numéro de carte
 * @returns {string} Type de carte (visa, mastercard, amex, etc.)
 */
const getCardTypeFromNumber = (cardNumber) => {
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

export default {
  luhnCheck,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  validateCardholderName,
  validatePostalCode,
  validatePhoneNumber,
  validateIBAN,
  validateBIC,
  validatePaymentForm,
};
