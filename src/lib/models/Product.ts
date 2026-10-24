import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleEn: { type: String },
    partNumber: { type: String, required: true, index: true },
    sku: { type: String, index: true },
    brand: { type: String, required: true, index: true },
    make: { type: String, required: true, index: true },
    model: { type: String, required: true },
    yearFrom: Number,
    yearTo: Number,
    yearRange: String,
    fitment: [String],
    condition: {
      type: String,
      enum: ["new", "refurb", "used"],
      default: "new",
    },
    category: { type: String, required: true, index: true },
    subcategory: String,
    price: { type: Number, required: true, index: true },
    listPrice: Number,
    stock: { type: Number, required: true, min: 0, default: 0, index: true },
    weightKg: Number,
    dimensions: {
      l: Number,
      w: Number,
      h: Number,
      unit: { type: String, enum: ["cm", "mm", "in"], default: "cm" },
    },
    specs: { type: Map, of: String, default: {} },
    description: String,
    descriptionEn: String,
    features: [String],
    images: [String],
    status: { type: String, enum: ["live", "draft"], default: "live", index: true },
    featured: { type: Boolean, default: false },
    tags: [String],
    oemNumbers: [String],
  },
  { timestamps: true },
);

export const Product = models.Product ?? model("Product", ProductSchema);
