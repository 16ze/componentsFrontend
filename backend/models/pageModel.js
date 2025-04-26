const mongoose = require("mongoose");

const pageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Veuillez fournir un titre de page"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Veuillez fournir du contenu pour la page"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "L'extrait ne doit pas dépasser 300 caractères"],
      trim: true,
    },
    template: {
      type: String,
      default: "default",
      enum: ["default", "landing", "contact", "full-width", "sidebar"],
    },
    status: {
      type: String,
      enum: ["published", "draft", "private"],
      default: "draft",
    },
    isHomepage: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
    },
    gallery: [
      {
        type: String,
      },
    ],
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      metaKeywords: { type: String },
      canonical: { type: String },
      ogTitle: { type: String },
      ogDescription: { type: String },
      ogImage: { type: String },
    },
    sections: [
      {
        type: {
          type: String,
          enum: [
            "hero",
            "text",
            "gallery",
            "features",
            "testimonials",
            "cta",
            "contact-form",
          ],
          required: true,
        },
        title: { type: String },
        subtitle: { type: String },
        content: { type: String },
        bgColor: { type: String },
        textColor: { type: String },
        alignment: {
          type: String,
          enum: ["left", "center", "right"],
          default: "left",
        },
        items: [
          {
            title: { type: String },
            subtitle: { type: String },
            description: { type: String },
            image: { type: String },
            link: { type: String },
            buttonText: { type: String },
          },
        ],
        settings: {
          type: Map,
          of: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    showInMenu: {
      type: Boolean,
      default: false,
    },
    showInFooter: {
      type: Boolean,
      default: false,
    },
    customCss: {
      type: String,
    },
    customJs: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes pour améliorer les performances
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1 });
pageSchema.index({ parent: 1 });
pageSchema.index({ order: 1 });
pageSchema.index({ showInMenu: 1 });
pageSchema.index({ isHomepage: 1 });
pageSchema.index({
  "seo.metaTitle": "text",
  "seo.metaDescription": "text",
  title: "text",
  content: "text",
});

// Virtuals pour obtenir les sous-pages
pageSchema.virtual("children", {
  ref: "Page",
  localField: "_id",
  foreignField: "parent",
});

// Méthode pour générer un slug unique à partir du titre
pageSchema.methods.generateSlug = function () {
  return this.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// Vérifier qu'il n'existe qu'une seule page d'accueil
pageSchema.pre("save", async function (next) {
  // Si cette page est définie comme page d'accueil
  if (this.isHomepage) {
    // Chercher s'il existe déjà une page d'accueil (autre que celle-ci)
    const existingHomepage = await this.constructor.findOne({
      isHomepage: true,
      _id: { $ne: this._id },
    });

    // Si une autre page est déjà définie comme page d'accueil, désactiver son statut
    if (existingHomepage) {
      await this.constructor.updateOne(
        { _id: existingHomepage._id },
        { isHomepage: false }
      );
    }
  }
  next();
});

// Middleware pour cascader la suppression aux sous-pages
pageSchema.pre("remove", async function (next) {
  const childPages = await this.model("Page").find({
    parent: this._id,
  });

  for (const childPage of childPages) {
    await childPage.remove();
  }

  next();
});

// Méthode pour publier une page
pageSchema.methods.publish = function () {
  this.status = "published";
  return this.save();
};

// Méthode pour mettre une page en brouillon
pageSchema.methods.draft = function () {
  this.status = "draft";
  return this.save();
};

// Méthode statique pour trouver une page par son slug
pageSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, status: "published" });
};

// Méthode statique pour trouver toutes les pages affichées dans le menu
pageSchema.statics.findMenuPages = function () {
  return this.find({ showInMenu: true, status: "published" })
    .sort({ order: 1 })
    .select("title slug parent order");
};

const Page = mongoose.model("Page", pageSchema);

module.exports = Page;
