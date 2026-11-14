import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/server/db";
import { requireArea } from "@/server/auth/guards";

export const instant = false;

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const { business } = await requireArea(businessId, "admin");
  const restaurant = business.vertical === "RESTAURANT";

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {restaurant ? "Menu" : "Products"}
        </h1>
        <Link
          href={`/b/${business.id}/admin/products/new`}
          className="rounded-lg bg-black px-3 py-1.5 text-sm text-white"
        >
          Add
        </Link>
      </div>

      <Suspense fallback={<ProductsLoadingSkeleton />}>
        <ProductList businessId={business.id} />
      </Suspense>

      <Link href={`/b/${business.id}/admin`} className="text-sm underline">
        Back
      </Link>
    </main>
  );
}

async function ProductList({ businessId }: { businessId: string }) {
  const [products, biz] = await Promise.all([
    db.product.findMany({
      where: { businessId, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        price: true,
        productCategory: { select: { name: true } },
      },
    }),
    db.business.findUnique({
      where: { id: businessId },
      select: { currency: true },
    }),
  ]);

  if (products.length === 0) {
    return <p className="text-sm text-neutral-600">Nothing here yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-neutral-600">
              {p.productCategory?.name ?? "No category"}
            </p>
          </div>
          <p className="text-sm">
            {biz?.currency} {p.price.toFixed(2)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ProductsLoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-14 rounded-lg bg-neutral-100 border p-3" />
      <div className="h-14 rounded-lg bg-neutral-100 border p-3" />
      <div className="h-14 rounded-lg bg-neutral-100 border p-3" />
    </div>
  );
}
