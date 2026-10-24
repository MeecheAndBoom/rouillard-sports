import { Schema, model, models } from "mongoose";

const BlogSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleEn: String,
    excerpt: { type: String, required: true },
    excerptEn: String,
    category: { type: String, default: "Guides", index: true },
    tags: [String],
    author: { type: String, default: "Rouillard Sport" },
    date: { type: String, required: true },
    image: String,
    body: { type: String, required: true },
    bodyEn: String,
    readMinutes: Number,
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["live", "draft"], default: "live", index: true },
  },
  { timestamps: true },
);

export const Blog = models.Blog ?? model("Blog", BlogSchema);
