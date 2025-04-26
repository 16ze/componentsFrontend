const mongoose = require("mongoose");

const cartItemSchema = mongoose.Schema(
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
      default: 1,
      min: [1, "La quantité ne peut pas être inférieure à 1"],
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
    },
    items: [cartItemSchema],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    paymentMethod: {
      type: String,
    },
    shippingMethod: {
      type: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    discountCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 20, // 20% par défaut (TVA française standard)
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    itemsPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: "3d" }, // Le panier expire après 3 jours
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ updatedAt: 1 });

// Middleware pour calculer automatiquement les prix
cartSchema.pre("save", function (next) {
  // Calculer le prix des articles
  this.itemsPrice = this.items.reduce((total, item) => {
    const itemPrice = item.priceDiscount || item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Calculer la TVA
  this.taxAmount = (this.itemsPrice * this.taxRate) / 100;

  // Calculer le prix total
  this.totalPrice =
    this.itemsPrice + this.taxAmount + this.shippingPrice - this.discountAmount;

  next();
});

// Méthodes du panier
cartSchema.methods.clearItems = function () {
  this.items = [];
  return this.save();
};

cartSchema.methods.addItem = async function (
  productId,
  quantity = 1,
  attributes = {}
) {
  const Product = mongoose.model("Product");
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Produit introuvable");
  }

  if (product.countInStock < quantity) {
    throw new Error("Quantité insuffisante en stock");
  }

  // Vérifier si le produit est déjà dans le panier
  const existingItemIndex = this.items.findIndex(
    (item) =>
      item.product.toString() === productId.toString() &&
      JSON.stringify(item.attributes) === JSON.stringify(attributes)
  );

  if (existingItemIndex > -1) {
    // Mettre à jour la quantité
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Ajouter un nouvel article
    this.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      priceDiscount: product.priceDiscount,
      quantity,
      attributes,
    });
  }

  return this.save();
};

cartSchema.methods.removeItem = function (itemId) {
  this.items = this.items.filter(
    (item) => item._id.toString() !== itemId.toString()
  );
  return this.save();
};

cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const itemIndex = this.items.findIndex(
    (item) => item._id.toString() === itemId.toString()
  );

  if (itemIndex > -1) {
    this.items[itemIndex].quantity = quantity;
    return this.save();
  }

  throw new Error("Article introuvable dans le panier");
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
