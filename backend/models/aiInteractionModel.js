const mongoose = require("mongoose");

const aiModelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["openai", "google", "anthropic", "mistral", "local", "other"],
      default: "openai",
    },
    version: {
      type: String,
      required: true,
    },
    parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    capabilities: [
      {
        type: String,
        enum: [
          "text",
          "chat",
          "image",
          "audio",
          "code",
          "embedding",
          "function",
          "vision",
        ],
      },
    ],
    costPerToken: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
      currency: { type: String, default: "EUR" },
    },
    contextSize: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const inputDataSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image", "audio", "file", "vector", "function"],
      default: "text",
    },
    content: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "system", "assistant", "function"],
      default: "user",
    },
    name: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    tokenCount: {
      type: Number,
    },
    media: [
      {
        url: { type: String },
        type: { type: String },
        size: { type: Number },
        format: { type: String },
        metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    _id: true,
    timestamps: false,
  }
);

const functionCallSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    arguments: {
      type: String, // JSON stringified
    },
    response: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    error: {
      message: { type: String },
      code: { type: String },
      stack: { type: String },
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: true,
    timestamps: false,
  }
);

const aiInteractionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIModel",
    },
    modelData: aiModelSchema,
    type: {
      type: String,
      enum: [
        "chat",
        "completion",
        "image",
        "embedding",
        "moderation",
        "function",
      ],
      required: true,
      default: "chat",
    },
    inputs: [inputDataSchema],
    output: {
      content: {
        type: String,
      },
      role: {
        type: String,
        default: "assistant",
      },
      finishReason: {
        type: String,
        enum: [
          "stop",
          "length",
          "content_filter",
          "function_call",
          "error",
          "null",
        ],
      },
      tokenCount: {
        type: Number,
      },
      media: [
        {
          url: { type: String },
          type: { type: String },
          size: { type: Number },
          format: { type: String },
          metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
        },
      ],
      functionCalls: [functionCallSchema],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    errorDetails: {
      code: { type: String },
      message: { type: String },
      timestamp: { type: Date },
      data: { type: mongoose.Schema.Types.Mixed },
    },
    metrics: {
      requestStartTime: { type: Date },
      requestEndTime: { type: Date },
      responseTime: { type: Number }, // En millisecondes
      totalTokens: { type: Number, default: 0 },
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      cost: { type: Number, default: 0 },
      currency: { type: String, default: "EUR" },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      helpfulnessScore: { type: Number, min: -1, max: 1 },
      categories: [{ type: String }],
      timestamp: { type: Date },
    },
    contextualData: {
      location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
      },
      device: {
        type: { type: String },
        os: { type: String },
        browser: { type: String },
        appVersion: { type: String },
      },
      userPreferences: {
        language: { type: String, default: "fr" },
        theme: { type: String },
        timezone: { type: String },
      },
    },
    flags: {
      isSensitive: { type: Boolean, default: false },
      containsPII: { type: Boolean, default: false },
      isTrainingData: { type: Boolean, default: true },
      isHumanReviewed: { type: Boolean, default: false },
      moderationFlagged: { type: Boolean, default: false },
      moderationCategories: [{ type: String }],
      moderationScore: { type: Number },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes pour améliorer les performances
aiInteractionSchema.index({ user: 1, createdAt: -1 });
aiInteractionSchema.index({ sessionId: 1, createdAt: -1 });
aiInteractionSchema.index({ model: 1 });
aiInteractionSchema.index({ type: 1 });
aiInteractionSchema.index({ status: 1 });
aiInteractionSchema.index({ "flags.isSensitive": 1 });
aiInteractionSchema.index({ "flags.isTrainingData": 1 });
aiInteractionSchema.index({ "contextualData.userPreferences.language": 1 });
aiInteractionSchema.index({ category: 1 });
aiInteractionSchema.index({ tags: 1 });

// Schéma pour les collections de données d'entraînement
const trainingDatasetSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["finetuning", "evaluation", "testing", "research", "other"],
      default: "finetuning",
    },
    targetModel: {
      type: String,
    },
    dataFormat: {
      type: String,
      enum: ["jsonl", "csv", "txt", "custom"],
      default: "jsonl",
    },
    interactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AIInteraction",
      },
    ],
    dataStats: {
      totalExamples: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      avgTokensPerExample: { type: Number, default: 0 },
      categories: { type: Map, of: Number, default: {} },
    },
    status: {
      type: String,
      enum: ["draft", "processing", "ready", "in_use", "archived"],
      default: "draft",
    },
    privacy: {
      isPublic: { type: Boolean, default: false },
      shareWithProvider: { type: Boolean, default: false },
      dataRetentionDays: { type: Number },
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["viewer", "editor", "admin"],
          default: "viewer",
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Schéma pour les modèles personnalisés/affinés
const aiFineTuneSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    baseModel: {
      name: { type: String, required: true },
      provider: { type: String, required: true },
      version: { type: String, required: true },
    },
    trainingDataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingDataset",
      required: true,
    },
    validationDataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingDataset",
    },
    hyperparameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metrics: {
      trainingLoss: { type: Number },
      validationLoss: { type: Number },
      accuracy: { type: Number },
      precision: { type: Number },
      recall: { type: Number },
      f1Score: { type: Number },
      customMetrics: { type: Map, of: Number },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "training",
        "completed",
        "failed",
        "deployed",
        "archived",
      ],
      default: "pending",
    },
    trainingDetails: {
      startTime: { type: Date },
      endTime: { type: Date },
      duration: { type: Number }, // En secondes
      epochs: { type: Number },
      batchSize: { type: Number },
      learningRate: { type: Number },
      trainingSteps: { type: Number },
      provider: { type: String },
      providerJobId: { type: String },
      cost: { type: Number },
      currency: { type: String, default: "EUR" },
    },
    deploymentDetails: {
      endpoint: { type: String },
      deployedAt: { type: Date },
      version: { type: String },
      environment: {
        type: String,
        enum: ["development", "staging", "production"],
      },
      isActive: { type: Boolean, default: false },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessControl: {
      isPublic: { type: Boolean, default: false },
      authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      authorizedRoles: [{ type: String }],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Méthodes pour AIInteraction
aiInteractionSchema.methods.markAsCompleted = function (output, metrics) {
  this.status = "completed";

  if (output) {
    this.output = output;
  }

  if (metrics) {
    this.metrics = {
      ...this.metrics,
      ...metrics,
      requestEndTime: new Date(),
      responseTime: metrics.requestStartTime
        ? new Date() - new Date(metrics.requestStartTime)
        : new Date() - this.metrics.requestStartTime,
    };
  } else {
    this.metrics.requestEndTime = new Date();
    this.metrics.responseTime = this.metrics.requestStartTime
      ? new Date() - new Date(this.metrics.requestStartTime)
      : null;
  }

  return this.save();
};

aiInteractionSchema.methods.markAsFailed = function (error) {
  this.status = "failed";

  if (error) {
    this.errorDetails = {
      ...error,
      timestamp: new Date(),
    };
  }

  this.metrics.requestEndTime = new Date();
  this.metrics.responseTime = this.metrics.requestStartTime
    ? new Date() - new Date(this.metrics.requestStartTime)
    : null;

  return this.save();
};

aiInteractionSchema.methods.addFeedback = function (feedbackData) {
  this.feedback = {
    ...feedbackData,
    timestamp: new Date(),
  };

  return this.save();
};

aiInteractionSchema.methods.calculateTokenUsage = function () {
  // Calculer les tokens d'entrée
  const promptTokens = this.inputs.reduce(
    (total, input) => total + (input.tokenCount || 0),
    0
  );

  // Tokens de sortie
  const completionTokens = this.output?.tokenCount || 0;

  // Mise à jour des métriques
  this.metrics.promptTokens = promptTokens;
  this.metrics.completionTokens = completionTokens;
  this.metrics.totalTokens = promptTokens + completionTokens;

  // Calculer le coût si les informations de coût sont disponibles
  if (this.modelData?.costPerToken) {
    const inputCost = promptTokens * (this.modelData.costPerToken.input || 0);
    const outputCost =
      completionTokens * (this.modelData.costPerToken.output || 0);
    this.metrics.cost = inputCost + outputCost;
    this.metrics.currency = this.modelData.costPerToken.currency || "EUR";
  }

  return this.save();
};

// Méthodes pour récupérer l'historique des interactions
aiInteractionSchema.statics.getSessionHistory = function (
  sessionId,
  limit = 10
) {
  return this.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select({
      inputs: 1,
      output: 1,
      type: 1,
      createdAt: 1,
      status: 1,
      metrics: {
        responseTime: 1,
        totalTokens: 1,
      },
    });
};

// Méthodes pour les analyses de données
aiInteractionSchema.statics.getUsageStatsByUser = async function (
  userId,
  period = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalInteractions: { $sum: 1 },
        totalTokens: { $sum: "$metrics.totalTokens" },
        totalCost: { $sum: "$metrics.cost" },
        avgResponseTime: { $avg: "$metrics.responseTime" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ]);
};

// Modèles
const AIModel = mongoose.model("AIModel", aiModelSchema);
const AIInteraction = mongoose.model("AIInteraction", aiInteractionSchema);
const TrainingDataset = mongoose.model(
  "TrainingDataset",
  trainingDatasetSchema
);
const AIFineTune = mongoose.model("AIFineTune", aiFineTuneSchema);

module.exports = {
  AIModel,
  AIInteraction,
  TrainingDataset,
  AIFineTune,
};
