import { z } from "zod";
import { COUNTRIES } from "@/modules/businesses/countries";
import { toE164 } from "@/lib/phone";

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const businessInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the business name.")
    .max(80, "the name is too long."),
  vertical: z
    .string()
    .refine(
      (v) => v === "RESTAURANT" || v === "RETAIL",
      "Choose a business type",
    ),
  country: z
    .string()
    .refine((c) => COUNTRIES.some((x) => x.code === c), "Choose a country."),
  currency: z.string().regex(/^[A-Z]{3}$/, "Choose a currency."),
  timeZone: z.string().refine(isValidTimeZone, "Choose a time zone."),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || toE164(v) !== null,
      "Enter a valid business phone number.",
    ),
  email: z.email("Enter a valid business email address.").optional(),
  address: z.string().max(200, "That address is too long.").optional(),
});

export const locationTaxSchema = z
  .object({
    locationName: z
      .string()
      .trim()
      .min(2, "Enter a location name.")
      .max(60, "That name is too lang."),
    taxMode: z
      .string()
      .refine(
        (v) => ["RATE", "NONE", "LATER"].includes(v),
        "Choose a tax option.",
      )
      .transform((v) => v as "RATE" | "NONE" | "LATER"),
    taxRate: z.string().optional(),
    taxInclusive: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.taxMode === "RATE") {
      const n = Number(d.taxRate);
      if (!d.taxRate || !Number.isFinite(n) || n <= 0 || n > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["taxRate"],
          message: "Enter a tax rate between 0 and 100.",
        });
      }
    }
  });

export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type LocationTax = z.infer<typeof locationTaxSchema>;
