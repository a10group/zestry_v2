import { LocationTax } from "@/modules/businesses/schema";
import { db } from "@/server/db";

export async function saveLocationAndTax(businessId: string, d: LocationTax) {
  return db.$transaction(async (tx) => {
    const existing = await tx.site.findFirst({
      where: { businessId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (existing) {
      await tx.site.update({
        where: { id: existing.id },
        data: { name: d.locationName },
      });
    } else {
      await tx.site.create({ data: { businessId, name: d.locationName } });
    }

    const tax =
      d.taxMode === "LATER"
        ? {}
        : {
            taxRate:
              d.taxMode === "NONE"
                ? 0
                : Math.round(Number(d.taxRate) * 100) / 100,
            taxInclusive: d.taxInclusive !== "false",
            taxConfiguredAt: new Date(),
          };

    await tx.business.update({
      where: { id: businessId },
      data: { ...tax, onboardingStep: "PRODUCT_SETUP" },
    });
  });
}
