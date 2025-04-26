const mongoose = require("mongoose");

const contactSubmissionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Veuillez fournir votre nom"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Veuillez fournir votre email"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir un email valide",
      ],
    },
    subject: {
      type: String,
      required: [true, "Veuillez fournir un sujet"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Veuillez fournir un message"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "spam", "archived"],
      default: "new",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Méthode virtuelle pour savoir si le message a été lu
contactSubmissionSchema.virtual("isRead").get(function () {
  return this.status !== "new";
});

// Méthode virtuelle pour savoir si le message nécessite une action
contactSubmissionSchema.virtual("requiresAction").get(function () {
  return ["new", "read"].includes(this.status);
});

// Nettoyer les données sensibles avant de les retourner au client
contactSubmissionSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.ipAddress;
    delete ret.userAgent;
    return ret;
  },
  virtuals: true,
});

// Index pour optimiser les recherches par statut
contactSubmissionSchema.index({ status: 1 });
// Index pour optimiser les recherches par date de création
contactSubmissionSchema.index({ createdAt: -1 });

const ContactSubmission = mongoose.model(
  "ContactSubmission",
  contactSubmissionSchema
);

module.exports = ContactSubmission;
