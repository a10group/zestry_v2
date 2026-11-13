"use server";

import { getAuthContext, requireBusinessContext } from "@/server/auth/context";
import {
  businessInfoSchema,
  locationTaxSchema,
} from "@/modules/businesses/schema";
import { createBusinessWithOwner } from "@/modules/businesses/create-business";
import { redirect } from "next/navigation";
import { saveLocationAndTax } from "@/modules/businesses/save-location-tax";
import { db } from "@/server/db";

export type FormState = { error?: string } | null;

function val(f: FormData, key: string) {
  const v = String(f.get(key) ?? "").trim();
  return v === "" ? undefined : v;
}

export async function createBusinessAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { user } = await getAuthContext();

  const parsed = businessInfoSchema.safeParse({
    name: val(formData, "name"),
    vertical: val(formData, "vertical"),
    country: val(formData, "country"),
    currency: val(formData, "currency"),
    timeZone: val(formData, "timeZone"),
    phone: val(formData, "phone"),
    email: val(formData, "email"),
    address: val(formData, "address"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed";
  const business = await createBusinessWithOwner(
    { id: user.id, displayName },
    parsed.data,
  );
  redirect(`/onboarding/${business.id}`);
}

async function requireOnboardingOwner(businessId: string) {
  const ctx = await requireBusinessContext(businessId);
  if (!ctx.roleKeys.includes("OWNER") || ctx.business.status !== "ONBOARDING")
    return null;
  return ctx.business;
}

export async function saveLocationTaXAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const business = await requireOnboardingOwner(
    String(formData.get("businessId") ?? ""),
  );
  if (!business) return { error: "You can't change this business setup." };
  const parsed = locationTaxSchema.safeParse({
    locationName: val(formData, "locationName"),
    taxMode: val(formData, "taxMode"),
    taxRate: val(formData, "taxRate"),
    taxInclusive: val(formData, "taxInclusive"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  await saveLocationAndTax(business.id, parsed.data);
  redirect(`/onboarding/${business.id}`);
}

export async function finishOnboardingAction(
  formData: FormData,
): Promise<void> {
  const business = await requireOnboardingOwner(
    String(formData.get("businessId") ?? ""),
  );
  if (!business) redirect("/hub");

  const sites = await db.site.count({ where: { businessId: business.id } });
  if (sites === 0) redirect(`/onboarding/${business.id}`);

  await db.business.updateMany({
    where: { id: business.id, status: "ONBOARDING" },
    data: {
      status: "ACTIVE",
      onboardingStep: null,
      onboardingCompletedAt: new Date(),
    },
  });
}
