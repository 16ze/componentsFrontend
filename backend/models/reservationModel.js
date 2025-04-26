const mongoose = require("mongoose");

const timeSlotSchema = mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    maxCapacity: {
      type: Number,
      default: 1,
      min: [1, "La capacité doit être d'au moins 1"],
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    specialPrice: {
      type: Number,
    },
  },
  {
    _id: true,
    timestamps: false,
  }
);

// Vérifier que l'heure de début est avant l'heure de fin
timeSlotSchema.pre("validate", function (next) {
  if (this.startTime >= this.endTime) {
    this.invalidate(
      "startTime",
      "L'heure de début doit être antérieure à l'heure de fin"
    );
  }
  next();
});

const resourceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Veuillez fournir un nom pour la ressource"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ["room", "equipment", "service", "vehicle", "person", "other"],
      default: "other",
    },
    location: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    priceUnit: {
      type: String,
      enum: ["hour", "day", "night", "person", "session", "flat"],
      default: "hour",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    _id: true,
    timestamps: false,
  }
);

const reservationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: function () {
        return !this.resourceData;
      },
    },
    resourceData: resourceSchema,
    reservationNumber: {
      type: String,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    timeSlots: [timeSlotSchema],
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no-show",
        "rescheduled",
      ],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["unpaid", "partially_paid", "paid", "refunded", "credit"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "bank_transfer", "on_site", "other"],
    },
    paymentDetails: {
      id: { type: String },
      amount: { type: Number },
      date: { type: Date },
      provider: { type: String },
    },
    deposit: {
      required: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      paidAt: { type: Date },
    },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      notes: { type: String },
    },
    partySize: {
      type: Number,
      default: 1,
      min: 1,
    },
    specialRequests: {
      type: String,
    },
    internalNotes: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict", "non_refundable"],
      default: "moderate",
    },
    checkInInstructions: {
      type: String,
    },
    recurrence: {
      isRecurring: { type: Boolean, default: false },
      pattern: {
        type: String,
        enum: ["daily", "weekly", "monthly", "custom"],
      },
      endDate: { type: Date },
      exceptions: [{ type: Date }],
    },
    notifications: [
      {
        type: { type: String, enum: ["email", "sms", "push"] },
        recipient: { type: String },
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        template: { type: String },
      },
    ],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    source: {
      type: String,
      enum: ["website", "app", "phone", "walk_in", "partner", "other"],
      default: "website",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes pour améliorer les performances
reservationSchema.index({ user: 1 });
reservationSchema.index({ resource: 1 });
reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ startDate: 1, endDate: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ "customer.email": 1 });
reservationSchema.index({ "customer.phone": 1 });
reservationSchema.index({ createdAt: -1 });

// Vérifier que la date de début est avant la date de fin
reservationSchema.pre("validate", function (next) {
  if (this.startDate >= this.endDate) {
    this.invalidate(
      "startDate",
      "La date de début doit être antérieure à la date de fin"
    );
  }
  next();
});

// Générer un numéro de réservation unique
reservationSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    this.reservationNumber = `RES-${year}${month}${day}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Calcul automatique des disponibilités
reservationSchema.statics.checkAvailability = async function (
  resourceId,
  startDate,
  endDate,
  partySize = 1,
  excludeReservationId = null
) {
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  if (startDateTime >= endDateTime) {
    throw new Error("La date de début doit être antérieure à la date de fin");
  }

  // Vérifier si la ressource existe
  const Resource = mongoose.model("Resource");
  const resource = await Resource.findById(resourceId);

  if (!resource) {
    throw new Error("Ressource introuvable");
  }

  if (!resource.isActive) {
    throw new Error("Cette ressource n'est pas disponible à la réservation");
  }

  // Vérifier la capacité
  if (partySize > resource.capacity) {
    throw new Error("Le nombre de personnes dépasse la capacité disponible");
  }

  // Trouver les réservations existantes qui se chevauchent avec la période demandée
  const overlappingReservations = await this.find({
    resource: resourceId,
    status: { $nin: ["cancelled", "no-show"] },
    $or: [
      {
        // La réservation existante commence pendant la nouvelle période
        startDate: { $gte: startDateTime, $lt: endDateTime },
      },
      {
        // La réservation existante finit pendant la nouvelle période
        endDate: { $gt: startDateTime, $lte: endDateTime },
      },
      {
        // La réservation existante englobe complètement la nouvelle période
        startDate: { $lte: startDateTime },
        endDate: { $gte: endDateTime },
      },
    ],
    // Exclure la réservation en cours d'édition si ID fourni
    ...(excludeReservationId && { _id: { $ne: excludeReservationId } }),
  });

  // Calculer les créneaux disponibles
  const availableTimeSlots = [];
  let currentDate = new Date(startDateTime);

  // Avancer par créneaux d'une heure (ou autre intervalle souhaité)
  const incrementHours = 1;

  while (currentDate < endDateTime) {
    const slotStart = new Date(currentDate);
    currentDate.setHours(currentDate.getHours() + incrementHours);
    const slotEnd = new Date(currentDate);

    // S'assurer que le dernier créneau ne dépasse pas la date de fin
    if (slotEnd > endDateTime) {
      slotEnd.setTime(endDateTime.getTime());
    }

    // Vérifier si ce créneau chevauche des réservations existantes
    const isSlotAvailable = !overlappingReservations.some((reservation) => {
      return (
        (slotStart >= new Date(reservation.startDate) &&
          slotStart < new Date(reservation.endDate)) ||
        (slotEnd > new Date(reservation.startDate) &&
          slotEnd <= new Date(reservation.endDate)) ||
        (slotStart <= new Date(reservation.startDate) &&
          slotEnd >= new Date(reservation.endDate))
      );
    });

    if (isSlotAvailable) {
      availableTimeSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
        maxCapacity: resource.capacity,
        isAvailable: true,
        price: resource.basePrice,
      });
    }
  }

  return {
    resource,
    isAvailable: availableTimeSlots.length > 0,
    availableTimeSlots,
  };
};

// Méthode pour confirmer une réservation
reservationSchema.methods.confirm = function () {
  this.status = "confirmed";
  return this.save();
};

// Méthode pour annuler une réservation
reservationSchema.methods.cancel = function (reason) {
  this.status = "cancelled";
  if (reason) {
    this.cancellationReason = reason;
  }
  return this.save();
};

// Méthode pour marquer une réservation comme terminée
reservationSchema.methods.complete = function () {
  this.status = "completed";
  return this.save();
};

// Méthode pour marquer une réservation comme payée
reservationSchema.methods.markAsPaid = function (paymentDetails) {
  this.paymentStatus = "paid";
  if (paymentDetails) {
    this.paymentDetails = {
      ...this.paymentDetails,
      ...paymentDetails,
      date: new Date(),
    };
  }
  return this.save();
};

// Méthode pour calculer le prix d'une réservation en fonction des créneaux sélectionnés
reservationSchema.methods.calculatePrice = function () {
  let total = 0;

  if (this.timeSlots && this.timeSlots.length > 0) {
    total = this.timeSlots.reduce((sum, slot) => {
      const price =
        slot.specialPrice !== undefined ? slot.specialPrice : slot.price;
      return sum + price;
    }, 0);
  } else if (this.resourceData && this.resourceData.basePrice) {
    // Calculer en fonction de la durée et du type de tarification
    const durationMs = this.endDate - this.startDate;
    const durationHours = durationMs / (1000 * 60 * 60);
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    switch (this.resourceData.priceUnit) {
      case "hour":
        total = this.resourceData.basePrice * Math.ceil(durationHours);
        break;
      case "day":
        total = this.resourceData.basePrice * Math.ceil(durationDays);
        break;
      case "night":
        total = this.resourceData.basePrice * Math.floor(durationDays);
        break;
      case "person":
        total = this.resourceData.basePrice * this.partySize;
        break;
      case "session":
      case "flat":
      default:
        total = this.resourceData.basePrice;
    }
  }

  this.totalPrice = total;
  return total;
};

// Créer un modèle distinct pour les ressources
const Resource = mongoose.model("Resource", resourceSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = { Reservation, Resource };
