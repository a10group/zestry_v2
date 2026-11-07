import { requireArea } from "@/server/auth/guards";
import { primaryRoleLabel } from "@/modules/authorization/roles";
import Link from "next/link";
import { getReadiness } from "@/modules/businesses/readiness";

export default async function AdminHome({
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
                {i.done ? "&check;" : "&#9744"} {i.label}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Link href="/hub?all=1" className="text-sm underline">
        Switch business
      </Link>
    </main>
  );
}
