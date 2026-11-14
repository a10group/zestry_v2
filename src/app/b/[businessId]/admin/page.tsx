import { requireArea } from "@/server/auth/guards";
import { primaryRoleLabel } from "@/modules/authorization/roles";
import Link from "next/link";
import { getReadiness } from "@/modules/businesses/readiness";
import { Suspense } from "react";

async function AdminHomeContent({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const { business, roleKeys } = await requireArea(businessId, "admin");
  const { items, ready } = await getReadiness(business.id, business.vertical);

  return (
    <main className="mx-auto max-w-md space-y-3 p-6">
      <h1 className="text-xl font-semibold">{business.name}</h1>
      <p className="text-sm font-semibold">
        Administration - {primaryRoleLabel(roleKeys)} - {business.vertical}
      </p>

      {!ready && (
        <section className="rounded-lg border p-3">
          <h1 className="text-xl font-semibold">Get ready to sell </h1>
          <ul>
            {items.map((i) => (
              <li key={i.key}>
                {i.done ? "✓" : "☐"} {i.label}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Link
        href={`/b/${business.id}/admin/products`}
        className="block rounded-lg border p-3 text-sm"
      >
        {business.vertical === "RESTAURANT" ? "Menu" : "Products"}
      </Link>
      <Link href="/hub?all=1" className="text-sm underline">
        Switch business
      </Link>
    </main>
  );
}

export default function AdminHome({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-neutral-500">Loading admin...</div>
      }
    >
      <AdminHomeContent params={params} />
    </Suspense>
  );
}
