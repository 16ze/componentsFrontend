const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Veuillez fournir un nom de catégorie"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "category-default.png",
    },
    image: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    metadata: {
      title: { type: String },
      description: { type: String },
      keywords: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals pour obtenir les sous-catégories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Méthode pour générer un slug unique à partir du nom
categorySchema.methods.generateSlug = function () {
  return this.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// Index pour améliorer les performances des requêtes
categorySchema.index({ parent: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ order: 1 });

// Middleware pour cascader la suppression aux sous-catégories
categorySchema.pre("remove", async function (next) {
  const childCategories = await this.model("Category").find({
    parent: this._id,
  });

  for (const childCategory of childCategories) {
    await childCategory.remove();
  }

  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
