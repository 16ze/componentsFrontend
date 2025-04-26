const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Veuillez fournir un nom de produit"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Veuillez fournir une image"],
    },
    additionalImages: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
      required: [true, "Veuillez fournir une marque"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Veuillez sélectionner une catégorie"],
      ref: "Category",
    },
    description: {
      type: String,
      required: [true, "Veuillez fournir une description"],
      minlength: [10, "La description doit contenir au moins 10 caractères"],
    },
    shortDescription: {
      type: String,
      required: [true, "Veuillez fournir une description courte"],
      maxlength: [
        200,
        "La description courte ne doit pas dépasser 200 caractères",
      ],
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Veuillez fournir un prix"],
      default: 0,
      min: [0, "Le prix ne peut pas être négatif"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Le prix réduit doit être inférieur au prix original
          return val < this.price;
        },
        message:
          "Le prix réduit ({VALUE}) doit être inférieur au prix original",
      },
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    sku: {
      type: String,
      required: [true, "Veuillez fournir un SKU"],
      unique: true,
      trim: true,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    taxRate: {
      type: Number,
      default: 20, // 20% par défaut (TVA française standard)
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index de recherche en texte
productSchema.index({ name: "text", description: "text", tags: "text" });

// Index pour améliorer les performances des requêtes courantes
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });

// Calcul du prix TTC
productSchema.virtual("priceTTC").get(function () {
  return this.price * (1 + this.taxRate / 100);
});

// Méthode pour calculer le prix remisé TTC
productSchema.virtual("discountPriceTTC").get(function () {
  if (this.priceDiscount) {
    return this.priceDiscount * (1 + this.taxRate / 100);
  }
  return null;
});

// Middleware pour mettre à jour la note moyenne lors d'un ajout/modification d'avis
productSchema.pre("save", async function (next) {
  if (this.isModified("reviews")) {
    const totalRating = this.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.numReviews = this.reviews.length;
    this.rating = this.numReviews > 0 ? totalRating / this.numReviews : 0;
  }
  next();
});

// Méthode pour vérifier si le produit est en stock
productSchema.methods.isInStock = function () {
  return this.countInStock > 0;
};

// Méthode pour générer un slug unique à partir du nom
productSchema.methods.generateSlug = function () {
  return this.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
