import { Schema, model, models } from "mongoose";

/**
 * Singleton settings document (key = "site"). Env vars win over stored
 * values so a redeploy can override anything the admin has saved.
 */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    site: {
      name: String,
      tagline: String,
      taglineEn: String,
      location: String,
      address: String,
      phone: String,
      phoneHref: String,
      email: String,
      hours: [
        {
          days: String,
          daysEn: String,
          time: String,
        },
      ],
      announcement: String,
    },
    paymentMethods: [
      {
        id: String,
        label: String,
        labelEn: String,
        hint: String,
        hintEn: String,
        enabled: { type: Boolean, default: true },
        sendEmailAfterOrder: { type: Boolean, default: true },
        defaultPaymentDetails: String,
        defaultPaymentDetailsEn: String,
      },
    ],
    delivery: {
      fee: Number,
      freeThreshold: Number,
    },
    cloudinary: {
      cloudName: String,
      apiKey: String,
      apiSecret: String,
    },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      pass: String,
      from: String,
      notify: String,
    },
  },
  { timestamps: true },
);

export const Settings = models.Settings ?? model("Settings", SettingsSchema);
