"use server";

import { FormState } from "@/modules/businesses/action";
import { requireArea } from "@/server/auth/guards";
import { productSchema } from "@/modules/products/schema";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

function val(f: FormData, key: string) {
  const v = String(f.get(key) ?? "").trim();
  return v === "" ? undefined : v;
}

export async function createProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const businessId = String(formData.get("businessId") ?? "");
  const { business } = await requireArea(businessId, "admin"); // re-checked on every submit
  const restaurant = business.vertical === "RESTAURANT";

  const parsed = productSchema.safeParse({
    name: val(formData, "name"),
    price: val(formData, "price"),
    categoryName: val(formData, "categoryName"),
    sku: restaurant ? undefined : val(formData, "sku"),
    cost: restaurant ? undefined : val(formData, "cost"),
    trackStock: restaurant ? false : formData.get("trackStock") === "on",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the from.",
    };
  }
  const d = parsed.data;

  await db.$transaction(async (tx) => {
    const category = d.categoryName
      ? await tx.productCategory.upsert({
          where: {
            businessId_name: { businessId: business.id, name: d.categoryName },
          },
          update: {},
          create: { businessId: business.id, name: d.categoryName },
          select: { id: true },
        })
      : null;

    await tx.product.create({
      data: {
        businessId: business.id,
        name: d.name,
        price: d.price,
        cost: d.cost ?? null,
        sku: d.sku ?? null,
        categoryId: category?.id ?? null,
        trackStock: d.trackStock,
      },
    });
  });

  redirect(`/b/${business.id}/admin/products`);
}
