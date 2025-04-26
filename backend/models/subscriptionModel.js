const mongoose = require("mongoose");

const featureSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: true,
    },
    unit: {
      type: String,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const usageSchema = mongoose.Schema(
  {
    feature: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
    },
    resetDate: {
      type: Date,
    },
    history: [
      {
        value: { type: Number },
        date: { type: Date, default: Date.now },
        meta: { type: Map, of: String },
      },
    ],
  },
  {
    _id: true,
  }
);

const planSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Veuillez fournir un nom de plan"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Veuillez fournir un code unique pour ce plan"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    features: [featureSchema],
    price: {
      amount: {
        type: Number,
        required: [true, "Veuillez spécifier le prix"],
        min: 0,
      },
      currency: {
        type: String,
        default: "EUR",
      },
      billingCycle: {
        type: String,
        enum: ["monthly", "quarterly", "biannual", "annual", "custom"],
        default: "monthly",
      },
      customInterval: {
        type: Number,
        min: 1,
      },
    },
    setupFee: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "EUR",
      },
    },
    trialPeriod: {
      days: {
        type: Number,
        default: 0,
      },
      requiresPaymentMethod: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    maxSubscriptionsPerUser: {
      type: Number,
      default: null,
    },
    availablePaymentMethods: [
      {
        type: String,
        enum: ["card", "bank_transfer", "paypal", "apple_pay", "google_pay"],
      },
    ],
    minSubscriptionMonths: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const subscriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: function () {
        return !this.planData;
      },
    },
    planData: planSchema,
    subscriptionNumber: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "trial",
        "active",
        "past_due",
        "unpaid",
        "cancelled",
        "expired",
        "paused",
      ],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    isAutoRenew: {
      type: Boolean,
      default: true,
    },
    renewalReminderSent: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      id: { type: String },
      type: { type: String },
      brand: { type: String },
      last4: { type: String },
      expiryMonth: { type: String },
      expiryYear: { type: String },
      isDefault: { type: Boolean, default: true },
    },
    customPrice: {
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
      reason: { type: String },
    },
    discount: {
      couponCode: { type: String },
      percent: { type: Number },
      amount: { type: Number },
      currency: { type: String, default: "EUR" },
      duration: { type: String, enum: ["once", "forever", "repeating"] },
      durationInMonths: { type: Number },
    },
    nextBillingDate: {
      type: Date,
    },
    lastBillingDate: {
      type: Date,
    },
    lastPayment: {
      amount: { type: Number },
      currency: { type: String },
      date: { type: Date },
      status: { type: String, enum: ["succeeded", "failed", "pending"] },
      paymentId: { type: String },
    },
    usageData: [usageSchema],
    billingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      company: { type: String },
      vatNumber: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    invoiceSettings: {
      receiveInvoices: { type: Boolean, default: true },
      email: { type: String },
      invoicePrefix: { type: String },
      customerNotes: { type: String },
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        event: {
          type: String,
          enum: [
            "created",
            "updated",
            "renewed",
            "cancelled",
            "payment_succeeded",
            "payment_failed",
            "trial_started",
            "trial_ended",
            "status_changed",
            "plan_changed",
          ],
        },
        data: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes pour améliorer les performances
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ organization: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ subscriptionNumber: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ startDate: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ "billingAddress.email": 1 });
subscriptionSchema.index({ createdAt: -1 });

// Générer un numéro d'abonnement unique
subscriptionSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);

    this.subscriptionNumber = `SUB-${year}${month}-${(count + 1)
      .toString()
      .padStart(5, "0")}`;

    // Ajouter l'événement de création à l'historique
    this.history.push({
      date: new Date(),
      event: "created",
      data: {
        plan: this.plan || this.planData?.name,
        status: this.status,
      },
    });

    // Définir la date de fin de période courante si elle n'est pas définie
    if (!this.currentPeriodEnd) {
      this.currentPeriodEnd = this.calculateNextBillingDate();
    }

    // Définir la prochaine date de facturation
    this.nextBillingDate = this.currentPeriodEnd;
  }
  next();
});

// Méthode pour calculer la prochaine date de facturation
subscriptionSchema.methods.calculateNextBillingDate = function () {
  const currentDate = this.currentPeriodStart || new Date();
  const billingCycle = this.planData?.price?.billingCycle || "monthly";
  const customInterval = this.planData?.price?.customInterval || 1;

  const nextDate = new Date(currentDate);

  switch (billingCycle) {
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "biannual":
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case "annual":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case "custom":
      nextDate.setDate(nextDate.getDate() + (customInterval || 30));
      break;
  }

  return nextDate;
};

// Méthode pour renouveler l'abonnement
subscriptionSchema.methods.renew = function () {
  // Mettre à jour la période courante
  this.currentPeriodStart = this.nextBillingDate || new Date();
  this.currentPeriodEnd = this.calculateNextBillingDate();
  this.nextBillingDate = this.currentPeriodEnd;

  // Mettre à jour le statut si nécessaire
  if (this.status === "past_due" || this.status === "unpaid") {
    this.status = "active";
  }

  // Ajouter l'événement à l'historique
  this.history.push({
    date: new Date(),
    event: "renewed",
    data: {
      currentPeriodStart: this.currentPeriodStart,
      currentPeriodEnd: this.currentPeriodEnd,
    },
  });

  return this.save();
};

// Méthode pour annuler l'abonnement
subscriptionSchema.methods.cancel = function (cancellationOptions = {}) {
  const { cancelImmediately = false, reason = null } = cancellationOptions;

  if (cancelImmediately) {
    this.status = "cancelled";
    this.cancelledAt = new Date();
    this.endDate = new Date();
  } else {
    this.cancelAtPeriodEnd = true;
    this.cancelledAt = new Date();
  }

  // Ajouter l'événement à l'historique
  this.history.push({
    date: new Date(),
    event: "cancelled",
    data: {
      reason,
      immediate: cancelImmediately,
      effectiveDate: cancelImmediately ? new Date() : this.currentPeriodEnd,
    },
  });

  return this.save();
};

// Méthode pour mettre à jour le statut de paiement
subscriptionSchema.methods.updatePaymentStatus = function (paymentDetails) {
  const { status, amount, currency, paymentId } = paymentDetails;

  this.lastPayment = {
    amount,
    currency,
    date: new Date(),
    status,
    paymentId,
  };

  if (status === "succeeded") {
    this.lastBillingDate = new Date();
    if (this.status === "past_due" || this.status === "unpaid") {
      this.status = "active";
    }

    // Ajouter l'événement à l'historique
    this.history.push({
      date: new Date(),
      event: "payment_succeeded",
      data: {
        amount,
        currency,
        paymentId,
      },
    });
  } else if (status === "failed") {
    if (this.status === "active") {
      this.status = "past_due";
    }

    // Ajouter l'événement à l'historique
    this.history.push({
      date: new Date(),
      event: "payment_failed",
      data: {
        amount,
        currency,
        paymentId,
      },
    });
  }

  return this.save();
};

// Méthode pour changer de plan
subscriptionSchema.methods.changePlan = function (
  newPlanId,
  changeOptions = {}
) {
  const { immediate = false, prorated = true } = changeOptions;

  // Sauvegarder l'ancien plan pour l'historique
  const oldPlan = this.plan || (this.planData ? this.planData._id : null);

  // Mettre à jour le plan
  this.plan = newPlanId;
  this.planData = null; // Réinitialiser planData car on utilise une référence

  if (immediate) {
    // Réinitialiser la période courante
    this.currentPeriodStart = new Date();
    this.currentPeriodEnd = this.calculateNextBillingDate();
    this.nextBillingDate = this.currentPeriodEnd;
  }

  // Ajouter l'événement à l'historique
  this.history.push({
    date: new Date(),
    event: "plan_changed",
    data: {
      oldPlan,
      newPlan: newPlanId,
      immediate,
      prorated,
    },
  });

  return this.save();
};

// Méthode pour enregistrer l'utilisation d'une fonctionnalité
subscriptionSchema.methods.trackUsage = function (
  featureCode,
  usageValue,
  meta = {}
) {
  // Trouver l'entrée d'utilisation pour cette fonctionnalité
  const usageIndex = this.usageData.findIndex((u) => u.feature === featureCode);

  if (usageIndex === -1) {
    // Vérifier si la fonctionnalité existe dans le plan
    const feature = this.planData?.features?.find(
      (f) => f.code === featureCode
    );
    if (!feature) {
      throw new Error(`Fonctionnalité ${featureCode} non trouvée dans le plan`);
    }

    // Créer une nouvelle entrée d'utilisation
    const limit = typeof feature.value === "number" ? feature.value : 0;
    this.usageData.push({
      feature: featureCode,
      value: usageValue,
      limit,
      resetDate: this.currentPeriodEnd,
      history: [
        {
          value: usageValue,
          date: new Date(),
          meta,
        },
      ],
    });
  } else {
    // Mettre à jour l'entrée existante
    this.usageData[usageIndex].value += usageValue;
    this.usageData[usageIndex].history.push({
      value: usageValue,
      date: new Date(),
      meta,
    });
  }

  return this.save();
};

// Méthode pour vérifier si une limite d'utilisation est atteinte
subscriptionSchema.methods.checkUsageLimit = function (featureCode) {
  const usage = this.usageData.find((u) => u.feature === featureCode);

  if (!usage) {
    // Si pas d'entrée d'utilisation, trouver la limite dans le plan
    const feature = this.planData?.features?.find(
      (f) => f.code === featureCode
    );
    return {
      feature: featureCode,
      limit: feature
        ? typeof feature.value === "number"
          ? feature.value
          : Infinity
        : 0,
      current: 0,
      isLimitReached: false,
      remaining: feature
        ? typeof feature.value === "number"
          ? feature.value
          : Infinity
        : 0,
    };
  }

  const isLimitReached = usage.value >= usage.limit;

  return {
    feature: featureCode,
    limit: usage.limit,
    current: usage.value,
    isLimitReached,
    remaining: Math.max(0, usage.limit - usage.value),
  };
};

// Méthode pour vérifier si une fonctionnalité est disponible
subscriptionSchema.methods.hasFeature = function (featureCode) {
  // Vérifier si l'abonnement est actif
  if (this.status !== "active" && this.status !== "trial") {
    return false;
  }

  // Vérifier si la fonctionnalité existe dans le plan
  const feature = this.planData?.features?.find((f) => f.code === featureCode);

  if (!feature) {
    return false;
  }

  // Pour les fonctionnalités avec limite d'utilisation
  if (typeof feature.value === "number") {
    // Vérifier si la limite est atteinte
    const usageStatus = this.checkUsageLimit(featureCode);
    return !usageStatus.isLimitReached;
  }

  // Pour les fonctionnalités booléennes
  return feature.value === true;
};

// Modèle pour les plans
const Plan = mongoose.model("Plan", planSchema);
// Modèle pour les abonnements
const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { Plan, Subscription };
