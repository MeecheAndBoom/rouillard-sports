import type { BlogCategory, OrderStatus, PartCategory, PartCondition, PaymentStatus, ProofMethod } from "./constants";

export type ProductSpecs = Record<string, string>;

export type Dimensions = { l: number; w: number; h: number; unit: "cm" | "mm" | "in" };

/** A spare part listing. Base language is French; *En fields fall back. */
export type Product = {
  slug: string;
  title: string;
  titleEn?: string;
  partNumber: string;
  sku?: string;
  brand: string;
  make: string;
  /** Comma-separated or array of models this part fits. */
  model: string;
  yearFrom?: number;
  yearTo?: number;
  yearRange?: string;
  fitment: string[];
  condition: PartCondition;
  category: PartCategory | string;
  subcategory?: string;
  price: number;
  listPrice?: number;
  stock: number;
  weightKg?: number;
  dimensions?: Dimensions;
  specs: ProductSpecs;
  description: string;
  descriptionEn?: string;
  features: string[];
  images: string[];
  status: "live" | "draft";
  featured: boolean;
  tags: string[];
  oemNumbers: string[];
  createdAt?: string;
};

export type ProductInput = Omit<Product, "slug" | "createdAt"> & { slug?: string };

export type TaxonomyTile = {
  id: string;
  name: string;
  type: "category" | "make" | "brand" | "model";
  image: string;
  /** Optional filter value when the tile name differs from the filter key. */
  href?: string;
  /** Optional display order (sorted ascending before name). */
  order?: number;
};

export type BlogPost = {
  slug: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  category: BlogCategory | string;
  tags: string[];
  author: string;
  date: string;
  image: string;
  body: string;
  bodyEn?: string;
  readMinutes?: number;
  featured: boolean;
  status: "live" | "draft";
  createdAt?: string;
};

export type BlogPostInput = Omit<BlogPost, "slug" | "createdAt"> & { slug?: string };

export type Review = {
  name: string;
  city?: string;
  email?: string;
  rating: number;
  title?: string;
  body: string;
  purchased?: string;
  date: string;
  published: boolean;
};

export type Enquiry = {
  id: string;
  kind: "contact" | "quote" | "affiliate" | "review" | "part";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  handled: boolean;
  createdAt: string;
};

export type OrderItem = {
  slug: string;
  title: string;
  image: string;
  price: number;
  qty: number;
};

export type OrderStatusEvent = {
  status: string;
  note?: string;
  at: string;
};

export type PaymentProof = {
  url: string;
  publicId?: string;
  uploadedAt: string;
  uploadedBy?: string;
  note?: string;
  /** Set by admin on review. */
  decision?: "approved" | "rejected";
  decisionNote?: string;
  decidedAt?: string;
};

export type OrderRecord = {
  reference: string;
  /** Locale the customer ordered in — drives email language. */
  lang: "fr" | "en";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customer: { name: string; email: string; phone?: string; notes?: string };
  delivery: {
    method: "pickup" | "delivery";
    address?: { line1?: string; city?: string; state?: string; zip?: string; country?: string };
    estimatedDate?: string;
  };
  payment: {
    method: string;
    methodOther?: string;
    label: string;
    instructions?: string;
    amountDue?: number;
    dueDate?: string;
    status: PaymentStatus;
    receivedAt?: string;
    requireProofUpload?: boolean;
    proofMethod?: ProofMethod;
    /** Shown on the Track page when proofMethod = 'upload'. */
    paymentDetails?: string;
    proof?: PaymentProof;
  };
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  adminNotes?: string;
  createdAt?: string;
};
