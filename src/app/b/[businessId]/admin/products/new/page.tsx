import Link from "next/link";
import { db } from "@/server/db";
import { requireArea } from "@/server/auth/guards";
import { ProductForm } from "@/components/products/product-form";

export const instant = false;

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const { business } = await requireArea(businessId, "admin");

  const cats = await db.productCategory.findMany({
    where: { businessId: business.id, isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const restaurant = business.vertical === "RESTAURANT";

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-semibold">
        {restaurant ? "Add menu item" : "Add product"}
      </h1>
      <ProductForm
        businessId={business.id}
        vertical={business.vertical}
        categories={cats.map((c) => c.name)}
      />
      <Link
        href={`/b/${business.id}/admin/products`}
        className="text-sm underline"
      >
        Cancel
      </Link>
    </main>
  );
}
