const mongoose = require("mongoose");

const galleryImageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Veuillez fournir un titre"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Veuillez fournir une catégorie"],
      enum: [
        "Général",
        "Services",
        "Événements",
        "Équipe",
        "Locaux",
        "Portfolio",
      ],
      default: "Général",
    },
    alt: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "L'URL de l'image est requise"],
    },
    filename: {
      type: String,
      required: [true, "Le nom du fichier est requis"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Méthode pour générer une URL absolue de l'image
galleryImageSchema.methods.getFullUrl = function (req) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}${this.imageUrl}`;
};

// Middleware pour nettoyer le chemin de l'image (retirer les doubles slashes)
galleryImageSchema.pre("save", function (next) {
  this.imageUrl = this.imageUrl.replace(/\/\//g, "/");
  next();
});

// Index pour optimiser les recherches par catégorie
galleryImageSchema.index({ category: 1 });
// Index pour optimiser les recherches par images en vedette
galleryImageSchema.index({ featured: 1 });

const GalleryImage = mongoose.model("GalleryImage", galleryImageSchema);

module.exports = GalleryImage;
