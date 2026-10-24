import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    name: { type: String, required: true },
    city: String,
    /** Never rendered publicly — only used to confirm verification by email. */
    email: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    purchased: String,
    date: { type: String, required: true },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Review = models.Review ?? model("Review", ReviewSchema);
