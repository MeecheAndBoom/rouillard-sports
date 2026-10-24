import { Schema, model, models } from "mongoose";

export const ORDER_STATUSES = [
  "Placed",
  "Awaiting Payment",
  "Payment Pending",
  "Awaiting Payment Proof",
  "Payment Proof Submitted",
  "Payment Received",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
  "Cancelled",
] as const;

const ProofSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: String,
    note: String,
    decision: { type: String, enum: ["approved", "rejected"] },
    decisionNote: String,
    decidedAt: Date,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    lang: { type: String, enum: ["fr", "en"], default: "fr" },
    items: [
      {
        slug: String,
        title: String,
        image: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: String,
      notes: String,
    },
    delivery: {
      method: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
      address: {
        line1: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
      estimatedDate: Date,
    },
    payment: {
      method: { type: String, required: true },
      methodOther: String,
      label: String,
      instructions: String,
      amountDue: Number,
      dueDate: Date,
      status: {
        type: String,
        enum: ["pending", "awaiting-proof", "proof-submitted", "received"],
        default: "pending",
      },
      receivedAt: Date,
      requireProofUpload: { type: Boolean, default: false },
      proofMethod: { type: String, enum: ["email", "upload"] },
      paymentDetails: String,
      proof: { type: ProofSchema, default: undefined },
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Placed",
      index: true,
    },
    statusHistory: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
    adminNotes: String,
  },
  { timestamps: true },
);

export const Order = models.Order ?? model("Order", OrderSchema);
