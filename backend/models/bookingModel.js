const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    clientName: {
      type: String,
      required: [true, "Veuillez fournir votre nom"],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, "Veuillez fournir votre email"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir un email valide",
      ],
    },
    clientPhone: {
      type: String,
      required: [true, "Veuillez fournir votre numéro de téléphone"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Veuillez sélectionner une date"],
    },
    time: {
      type: String,
      required: [true, "Veuillez sélectionner une heure"],
    },
    service: {
      type: String,
      required: [true, "Veuillez sélectionner un service"],
      enum: ["Service A", "Service B", "Service C", "Service D"],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Méthode virtuelle pour afficher la date formatée
bookingSchema.virtual("formattedDate").get(function () {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return this.date.toLocaleDateString("fr-FR", options);
});

// Méthode pour vérifier si une réservation peut être annulée (24h avant)
bookingSchema.methods.canCancel = function () {
  const now = new Date();
  const bookingDate = new Date(this.date);
  const bookingTime = this.time.split(":");
  bookingDate.setHours(parseInt(bookingTime[0]), parseInt(bookingTime[1]));

  // Différence en heures
  const diffHours = (bookingDate - now) / (1000 * 60 * 60);

  return diffHours >= 24;
};

// Index pour optimiser les recherches par date
bookingSchema.index({ date: 1 });
// Index pour optimiser les recherches par utilisateur et statut
bookingSchema.index({ user: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
