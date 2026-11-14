import { z } from "zod";

const money = z
  .string()
  .regex(
    /^\d{1,10}(\.\d{1,2})?$/,
    "Enter a valid amount, dor example 25 or 25.50.",
  );

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a name.")
    .max(80, "That name is too long"),
  price: money.refine((v) => Number(v) > 0, "Price must be greater than zero"),
  categoryName: z
    .string()
    .trim()
    .max(40, "The category name is too long")
    .optional(),
  sku: z.string().trim().max(40).optional(),
  cost: money.optional(),
  trackStock: z.boolean(),
});
