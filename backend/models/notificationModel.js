const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ios", "android", "web", "desktop"],
      required: true,
    },
    deviceId: {
      type: String,
    },
    model: {
      type: String,
    },
    osVersion: {
      type: String,
    },
    appVersion: {
      type: String,
    },
    language: {
      type: String,
      default: "fr",
    },
    timezone: {
      type: String,
    },
    lastActive: {
      type: Date,
      default: Date.now,
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

const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    type: {
      type: String,
      enum: [
        "system",
        "message",
        "order",
        "payment",
        "promotion",
        "reminder",
        "alert",
        "other",
      ],
      default: "system",
    },
    priority: {
      type: String,
      enum: ["normal", "high", "critical"],
      default: "normal",
    },
    icon: {
      type: String,
    },
    image: {
      type: String,
    },
    sound: {
      type: String,
      default: "default",
    },
    badge: {
      type: Number,
    },
    action: {
      screen: { type: String },
      params: { type: Map, of: mongoose.Schema.Types.Mixed },
      url: { type: String },
    },
    category: {
      type: String,
    },
    channel: {
      type: String,
      default: "default",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "canceled"],
      default: "pending",
    },
    errorDetails: {
      code: { type: String },
      message: { type: String },
      timestamp: { type: Date },
      provider: { type: String },
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    scheduled: {
      type: Boolean,
      default: false,
    },
    scheduledFor: {
      type: Date,
    },
    deliveryPlatforms: {
      type: [String],
      enum: ["push", "inapp", "email", "sms", "all"],
      default: ["push", "inapp"],
    },
    silent: {
      type: Boolean,
      default: false,
    },
    batchId: {
      type: String,
    },
    groupId: {
      type: String,
    },
    deviceTokens: [
      {
        type: String,
      },
    ],
    analytics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      firstOpenedAt: { type: Date },
      lastOpenedAt: { type: Date },
      openCount: { type: Number, default: 0 },
    },
    sender: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String },
      system: { type: Boolean, default: false },
    },
    templateId: {
      type: String,
    },
    localization: {
      type: Map,
      of: {
        title: String,
        body: String,
      },
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

// Indexes pour optimiser les recherches courantes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ deliveryStatus: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ batchId: 1 });
notificationSchema.index({ type: 1 });

// Modèle pour les préférences de notification utilisateur
const notificationPreferencesSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    channels: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inapp: { type: Boolean, default: true },
    },
    categories: {
      system: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          inapp: { type: Boolean, default: true },
        },
      },
      message: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          inapp: { type: Boolean, default: true },
        },
      },
      order: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          inapp: { type: Boolean, default: true },
        },
      },
      payment: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          inapp: { type: Boolean, default: true },
        },
      },
      promotion: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          inapp: { type: Boolean, default: true },
        },
      },
      reminder: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          inapp: { type: Boolean, default: true },
        },
      },
      alert: {
        enabled: { type: Boolean, default: true },
        channels: {
          push: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          inapp: { type: Boolean, default: true },
        },
      },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" },
      end: { type: String, default: "08:00" },
      timezone: { type: String },
      excludeHighPriority: { type: Boolean, default: true },
    },
    devices: [deviceSchema],
    emailFrequency: {
      type: String,
      enum: ["immediate", "daily_digest", "weekly_digest"],
      default: "immediate",
    },
    mobileSettings: {
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true },
      showPreview: { type: Boolean, default: true },
      badgeCount: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour marquer la notification comme lue
notificationSchema.methods.markAsRead = function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

// Méthode pour marquer la notification comme envoyée
notificationSchema.methods.markAsSent = function () {
  this.deliveryStatus = "sent";
  this.sentAt = new Date();
  return this.save();
};

// Méthode pour marquer la notification comme livrée
notificationSchema.methods.markAsDelivered = function () {
  this.deliveryStatus = "delivered";
  this.deliveredAt = new Date();
  return this.save();
};

// Méthode pour marquer la notification comme échouée
notificationSchema.methods.markAsFailed = function (errorDetails) {
  this.deliveryStatus = "failed";
  if (errorDetails) {
    this.errorDetails = {
      ...errorDetails,
      timestamp: new Date(),
    };
  }
  return this.save();
};

// Méthode pour suivre les ouvertures de notification
notificationSchema.methods.trackOpen = function () {
  if (!this.analytics.firstOpenedAt) {
    this.analytics.firstOpenedAt = new Date();
  }
  this.analytics.lastOpenedAt = new Date();
  this.analytics.openCount += 1;

  // Marquer également comme lue
  this.isRead = true;
  this.readAt = new Date();

  return this.save();
};

// Méthode pour vérifier si la notification est expirée
notificationSchema.methods.isExpired = function () {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
};

// Méthode pour annuler l'envoi d'une notification programmée
notificationSchema.methods.cancel = function () {
  if (this.deliveryStatus === "pending" && this.scheduled) {
    this.deliveryStatus = "canceled";
    return this.save();
  }
  throw new Error(
    "Seules les notifications en attente et programmées peuvent être annulées"
  );
};

// Méthode statique pour obtenir les notifications non lues d'un utilisateur
notificationSchema.statics.getUnreadByUser = function (userId, options = {}) {
  const { limit = 20, offset = 0, type = null } = options;

  const query = {
    user: userId,
    isRead: false,
    deliveryStatus: { $ne: "canceled" },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  };

  if (type) {
    query.type = type;
  }

  return this.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
};

// Méthode statique pour marquer toutes les notifications d'un utilisateur comme lues
notificationSchema.statics.markAllAsRead = function (userId, options = {}) {
  const { type = null } = options;

  const query = {
    user: userId,
    isRead: false,
  };

  if (type) {
    query.type = type;
  }

  return this.updateMany(query, {
    $set: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// Méthode pour obtenir les préférences de notification pour un type spécifique
notificationPreferencesSchema.methods.getPreferencesForType = function (
  notificationType
) {
  if (!this.categories[notificationType]) {
    return {
      enabled: true,
      channels: this.channels,
    };
  }

  return {
    enabled: this.categories[notificationType].enabled,
    channels: this.categories[notificationType].channels,
  };
};

// Méthode pour ajouter un appareil aux préférences d'un utilisateur
notificationPreferencesSchema.methods.addDevice = function (deviceData) {
  // Vérifier si l'appareil existe déjà
  const existingDeviceIndex = this.devices.findIndex(
    (device) => device.token === deviceData.token
  );

  if (existingDeviceIndex !== -1) {
    // Mettre à jour l'appareil existant
    this.devices[existingDeviceIndex] = {
      ...this.devices[existingDeviceIndex].toObject(),
      ...deviceData,
      lastActive: new Date(),
      isActive: true,
    };
  } else {
    // Ajouter le nouvel appareil
    this.devices.push({
      ...deviceData,
      lastActive: new Date(),
      isActive: true,
    });
  }

  return this.save();
};

// Méthode pour désactiver un appareil
notificationPreferencesSchema.methods.deactivateDevice = function (token) {
  const deviceIndex = this.devices.findIndex(
    (device) => device.token === token
  );

  if (deviceIndex !== -1) {
    this.devices[deviceIndex].isActive = false;
    return this.save();
  }

  return this;
};

// Méthode pour vérifier si l'envoi est autorisé selon les heures calmes
notificationPreferencesSchema.methods.canSendNow = function (
  priority = "normal"
) {
  if (!this.quietHours.enabled) {
    return true;
  }

  // Les notifications critiques ou de haute priorité peuvent contourner les heures calmes
  if (
    priority === "critical" ||
    (priority === "high" && this.quietHours.excludeHighPriority)
  ) {
    return true;
  }

  const now = new Date();
  const userTimezone = this.quietHours.timezone || "Europe/Paris";

  // Convertir l'heure actuelle dans le fuseau horaire de l'utilisateur
  const userTime = new Intl.DateTimeFormat("fr-FR", {
    hour: "numeric",
    minute: "numeric",
    timeZone: userTimezone,
  }).format(now);

  const currentHour = parseInt(userTime.split(":")[0], 10);
  const currentMinute = parseInt(userTime.split(":")[1], 10);

  const startHour = parseInt(this.quietHours.start.split(":")[0], 10);
  const startMinute = parseInt(this.quietHours.start.split(":")[1], 10);

  const endHour = parseInt(this.quietHours.end.split(":")[0], 10);
  const endMinute = parseInt(this.quietHours.end.split(":")[1], 10);

  // Convertir en minutes depuis minuit pour faciliter la comparaison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  // Vérifier si l'heure actuelle est dans la plage des heures calmes
  if (startTimeInMinutes < endTimeInMinutes) {
    // Cas simple: début et fin le même jour
    return (
      currentTimeInMinutes < startTimeInMinutes ||
      currentTimeInMinutes >= endTimeInMinutes
    );
  } else {
    // Cas où les heures calmes s'étendent sur deux jours (ex: 22:00 à 08:00)
    return (
      currentTimeInMinutes < endTimeInMinutes ||
      currentTimeInMinutes >= startTimeInMinutes
    );
  }
};

// Modèles
const Notification = mongoose.model("Notification", notificationSchema);
const NotificationPreferences = mongoose.model(
  "NotificationPreferences",
  notificationPreferencesSchema
);
const Device = mongoose.model("Device", deviceSchema);

module.exports = { Notification, NotificationPreferences, Device };
