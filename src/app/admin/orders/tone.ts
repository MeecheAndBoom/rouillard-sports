import type { OrderStatus } from "@/lib/constants";

/** Shared status → badge tone map for every admin order surface. */
export const STATUS_TONE: Partial<
  Record<OrderStatus, "neutral" | "success" | "warning" | "danger" | "accent">
> = {
  Placed: "neutral",
  "Awaiting Payment": "warning",
  "Payment Pending": "warning",
  "Awaiting Payment Proof": "warning",
  "Payment Proof Submitted": "accent",
  "Payment Received": "success",
  Preparing: "accent",
  "Ready for Pickup": "accent",
  "Out for Delivery": "accent",
  Completed: "success",
  Cancelled: "danger",
};
