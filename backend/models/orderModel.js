const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: false,
  }
);

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    billingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 20,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isShipped: {
      type: Boolean,
      required: true,
      default: false,
    },
    shippedAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes pour optimiser les requêtes fréquentes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "shippingAddress.email": 1 });

// Générer un numéro de commande unique
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    this.orderNumber = `CMD-${year}${month}${day}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Méthode pour marquer une commande comme payée
orderSchema.methods.markAsPaid = function (paymentResult) {
  this.isPaid = true;
  this.paymentStatus = "paid";
  this.paidAt = Date.now();

  if (paymentResult) {
    this.paymentResult = paymentResult;
  }

  return this.save();
};

// Méthode pour marquer une commande comme expédiée
orderSchema.methods.markAsShipped = function (trackingNumber) {
  this.isShipped = true;
  this.status = "shipped";
  this.shippedAt = Date.now();

  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }

  return this.save();
};

// Méthode pour marquer une commande comme livrée
orderSchema.methods.markAsDelivered = function () {
  this.isDelivered = true;
  this.status = "delivered";
  this.deliveredAt = Date.now();

  return this.save();
};

// Méthode pour annuler une commande
orderSchema.methods.cancel = function (reason) {
  this.status = "cancelled";

  if (reason) {
    this.cancelReason = reason;
  }

  return this.save();
};

// Méthode pour calculer le montant de remboursement
orderSchema.methods.getRefundAmount = function () {
  return this.totalPrice;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
