import { db } from "@/server/db";

export type ReadinessItem = {
  key: "location" | "tax" | "products";
  label: string;
  done: boolean;
};

export async function getReadiness(
  businessId: string,
  vertical: "RESTAURANT" | "RETAIL",
) {
  const [business, sites, products] = await Promise.all([
    db.business.findUnique({
      where: { id: businessId },
      select: { taxConfiguredAt: true },
    }),
    db.site.count({ where: { businessId, isActive: true } }),
    db.product.count({ where: { businessId, isActive: true } }),
  ]);

  const items: ReadinessItem[] = [
    { key: "location", label: "Add a location", done: sites > 0 },
    {
      key: "tax",
      label: "Set up tax",
      done: business?.taxConfiguredAt != null,
    },
    {
      key: "products",
      label:
        vertical === "RESTAURANT"
          ? "Add your first menu item"
          : "Add your first product",
      done: products > 0,
    },
  ];
  return { items, ready: items.every((i) => i.done) };
}
