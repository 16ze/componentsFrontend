const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "card",
        "paypal",
        "stripe",
        "bank_transfer",
        "cash_on_delivery",
        "apple_pay",
        "google_pay",
      ],
    },
    paymentProvider: {
      name: { type: String, required: true },
      transactionId: { type: String },
      transactionFee: { type: Number, default: 0 },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "EUR",
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ],
      default: "pending",
    },
    paymentDetails: {
      cardBrand: { type: String },
      cardLast4: { type: String },
      expiryMonth: { type: String },
      expiryYear: { type: String },
      billingDetails: {
        name: { type: String },
        email: { type: String },
        address: {
          line1: { type: String },
          line2: { type: String },
          city: { type: String },
          postalCode: { type: String },
          country: { type: String },
        },
      },
    },
    refunds: [
      {
        amount: { type: Number, required: true },
        reason: { type: String },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        refundedAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      type: Map,
      of: String,
    },
    notes: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    successUrl: {
      type: String,
    },
    cancelUrl: {
      type: String,
    },
    webhookReceived: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ "paymentProvider.transactionId": 1 });
paymentSchema.index({ createdAt: -1 });

// Méthode pour marquer un paiement comme complété
paymentSchema.methods.markAsCompleted = function (transactionId) {
  this.status = "completed";
  this.completedAt = Date.now();

  if (transactionId) {
    this.paymentProvider.transactionId = transactionId;
  }

  return this.save();
};

// Méthode pour ajouter un remboursement
paymentSchema.methods.addRefund = function (amount, reason) {
  if (amount <= 0) {
    throw new Error("Le montant du remboursement doit être supérieur à 0");
  }

  // Vérifier que le montant total des remboursements ne dépasse pas le montant du paiement
  const totalRefunded = this.refunds.reduce(
    (sum, refund) => sum + refund.amount,
    0
  );

  if (totalRefunded + amount > this.amount) {
    throw new Error(
      "Le montant total des remboursements ne peut pas dépasser le montant du paiement"
    );
  }

  this.refunds.push({
    amount,
    reason,
    status: "pending",
    refundedAt: Date.now(),
  });

  // Mettre à jour le statut du paiement
  if (totalRefunded + amount === this.amount) {
    this.status = "refunded";
  } else {
    this.status = "partially_refunded";
  }

  return this.save();
};

// Méthode pour marquer un paiement comme échoué
paymentSchema.methods.markAsFailed = function (errorMessage) {
  this.status = "failed";

  if (errorMessage) {
    this.errorMessage = errorMessage;
  }

  return this.save();
};

// Méthode pour annuler un paiement
paymentSchema.methods.cancel = function () {
  if (this.status === "completed") {
    throw new Error("Impossible d'annuler un paiement déjà complété");
  }

  this.status = "cancelled";
  return this.save();
};

// Méthode pour obtenir le montant total remboursé
paymentSchema.methods.getTotalRefunded = function () {
  return this.refunds.reduce((sum, refund) => {
    if (refund.status === "completed") {
      return sum + refund.amount;
    }
    return sum;
  }, 0);
};

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
