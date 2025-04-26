const Joi = require("joi");

/**
 * Middleware de validation pour les données de réservation
 */
const validateBookingData = (req, res, next) => {
  const schema = Joi.object({
    clientName: Joi.string().trim().min(2).max(100).required().messages({
      "string.base": "Le nom doit être une chaîne de caractères.",
      "string.empty": "Le nom est requis.",
      "string.min": "Le nom doit contenir au moins {#limit} caractères.",
      "string.max": "Le nom ne doit pas dépasser {#limit} caractères.",
      "any.required": "Le nom est requis.",
    }),

    clientEmail: Joi.string().email().required().messages({
      "string.base": "L'email doit être une chaîne de caractères.",
      "string.empty": "L'email est requis.",
      "string.email": "Veuillez fournir un email valide.",
      "any.required": "L'email est requis.",
    }),

    clientPhone: Joi.string()
      .pattern(/^[0-9+\s()-]{8,20}$/)
      .required()
      .messages({
        "string.base":
          "Le numéro de téléphone doit être une chaîne de caractères.",
        "string.empty": "Le numéro de téléphone est requis.",
        "string.pattern.base": "Le numéro de téléphone n'est pas valide.",
        "any.required": "Le numéro de téléphone est requis.",
      }),

    date: Joi.date().min("now").required().messages({
      "date.base": "La date doit être une date valide.",
      "date.min": "La date ne peut pas être dans le passé.",
      "any.required": "La date est requise.",
    }),

    time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.base": "L'heure doit être une chaîne de caractères.",
        "string.empty": "L'heure est requise.",
        "string.pattern.base": "L'heure doit être au format HH:MM.",
        "any.required": "L'heure est requise.",
      }),

    service: Joi.string()
      .valid("Service A", "Service B", "Service C", "Service D")
      .required()
      .messages({
        "string.base": "Le service doit être une chaîne de caractères.",
        "string.empty": "Le service est requis.",
        "any.only": "Le service choisi n'est pas valide.",
        "any.required": "Le service est requis.",
      }),

    message: Joi.string().max(500).allow("", null).messages({
      "string.base": "Le message doit être une chaîne de caractères.",
      "string.max": "Le message ne doit pas dépasser {#limit} caractères.",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message: errorMessages,
    });
  }

  next();
};

/**
 * Middleware de validation pour les données utilisateur
 */
const validateUserData = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.base": "Le nom doit être une chaîne de caractères.",
      "string.empty": "Le nom est requis.",
      "string.min": "Le nom doit contenir au moins {#limit} caractères.",
      "string.max": "Le nom ne doit pas dépasser {#limit} caractères.",
      "any.required": "Le nom est requis.",
    }),

    email: Joi.string().email().required().messages({
      "string.base": "L'email doit être une chaîne de caractères.",
      "string.empty": "L'email est requis.",
      "string.email": "Veuillez fournir un email valide.",
      "any.required": "L'email est requis.",
    }),

    password: Joi.string()
      .min(6)
      .max(30)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      .messages({
        "string.base": "Le mot de passe doit être une chaîne de caractères.",
        "string.empty": "Le mot de passe est requis.",
        "string.min":
          "Le mot de passe doit contenir au moins {#limit} caractères.",
        "string.max":
          "Le mot de passe ne doit pas dépasser {#limit} caractères.",
        "string.pattern.base":
          "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.",
      }),

    phone: Joi.string()
      .pattern(/^[0-9+\s()-]{8,20}$/)
      .allow("", null)
      .messages({
        "string.base":
          "Le numéro de téléphone doit être une chaîne de caractères.",
        "string.pattern.base": "Le numéro de téléphone n'est pas valide.",
      }),
  });

  // Si c'est une création d'utilisateur, le mot de passe est requis
  if (req.path === "/register") {
    schema.append({
      password: schema.extract("password").required(),
    });
  }

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message: errorMessages,
    });
  }

  next();
};

/**
 * Middleware de validation pour les données de contact
 */
const validateContactData = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.base": "Le nom doit être une chaîne de caractères.",
      "string.empty": "Le nom est requis.",
      "string.min": "Le nom doit contenir au moins {#limit} caractères.",
      "string.max": "Le nom ne doit pas dépasser {#limit} caractères.",
      "any.required": "Le nom est requis.",
    }),

    email: Joi.string().email().required().messages({
      "string.base": "L'email doit être une chaîne de caractères.",
      "string.empty": "L'email est requis.",
      "string.email": "Veuillez fournir un email valide.",
      "any.required": "L'email est requis.",
    }),

    subject: Joi.string().trim().min(2).max(100).required().messages({
      "string.base": "Le sujet doit être une chaîne de caractères.",
      "string.empty": "Le sujet est requis.",
      "string.min": "Le sujet doit contenir au moins {#limit} caractères.",
      "string.max": "Le sujet ne doit pas dépasser {#limit} caractères.",
      "any.required": "Le sujet est requis.",
    }),

    message: Joi.string().min(10).max(1000).required().messages({
      "string.base": "Le message doit être une chaîne de caractères.",
      "string.empty": "Le message est requis.",
      "string.min": "Le message doit contenir au moins {#limit} caractères.",
      "string.max": "Le message ne doit pas dépasser {#limit} caractères.",
      "any.required": "Le message est requis.",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message: errorMessages,
    });
  }

  next();
};

module.exports = {
  validateBookingData,
  validateUserData,
  validateContactData,
};
