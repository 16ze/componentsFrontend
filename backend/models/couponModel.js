const mongoose = require("mongoose");

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Veuillez fournir un code de coupon"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Veuillez spécifier le type de réduction"],
      enum: ["percentage", "fixed", "free_shipping"],
      default: "percentage",
    },
    value: {
      type: Number,
      required: function () {
        return this.type !== "free_shipping";
      },
      min: [0, "La valeur ne peut pas être négative"],
      validate: {
        validator: function (val) {
          // Pour les pourcentages, la valeur doit être entre 0 et 100
          if (this.type === "percentage" && val > 100) {
            return false;
          }
          return true;
        },
        message: "Pour un pourcentage, la valeur doit être entre 0 et 100",
      },
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, "Le montant minimum d'achat ne peut pas être négatif"],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, "La réduction maximale ne peut pas être négative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: null,
    },
    userRestrictions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    productRestrictions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    categoryRestrictions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validUntil: 1 });
couponSchema.index({ createdBy: 1 });

// Méthodes
couponSchema.methods.isValid = function () {
  const now = new Date();

  // Vérifier si le coupon est actif
  if (!this.isActive) return false;

  // Vérifier si le coupon a expiré
  if (this.validUntil && now > this.validUntil) return false;

  // Vérifier si le coupon n'est pas encore valide
  if (now < this.validFrom) return false;

  // Vérifier si la limite d'utilisation est atteinte
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit)
    return false;

  return true;
};

couponSchema.methods.calculateDiscount = function (cartTotal, items = []) {
  if (!this.isValid()) return 0;

  // Vérifier le montant minimum d'achat
  if (cartTotal < this.minPurchase) return 0;

  let discount = 0;

  switch (this.type) {
    case "percentage":
      discount = cartTotal * (this.value / 100);
      break;
    case "fixed":
      discount = this.value;
      break;
    case "free_shipping":
      // La valeur de la livraison gratuite doit être gérée séparément
      discount = 0;
      break;
  }

  // Appliquer la réduction maximale si définie
  if (this.maxDiscount !== null && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }

  // S'assurer que la réduction ne dépasse pas le total du panier
  if (discount > cartTotal) {
    discount = cartTotal;
  }

  return discount;
};

couponSchema.methods.incrementUsage = function () {
  this.usedCount += 1;
  return this.save();
};

couponSchema.statics.findValidByCode = async function (code) {
  const now = new Date();

  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: null },
      { validUntil: { $gt: now } },
    ],
    $or: [
      { usageLimit: { $exists: false } },
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  });
};

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
