import { requireArea } from "@/server/auth/guards";
import { primaryRoleLabel } from "@/modules/authorization/roles";
import Link from "next/link";
import { getReadiness } from "@/modules/businesses/readiness";
import { Suspense } from "react";

async function PosHomeContent({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const { business, roleKeys } = await requireArea(businessId, "pos");
  const { ready } = await getReadiness(business.id, business.vertical);

  return (
    <main className="mx-auto max-w-md space-y-3 p-6">
      <h1 className="text-xl font-semibold">{business.name}</h1>
      <p className="text-sm font-semibold">
        Checkout - {primaryRoleLabel(roleKeys)}
      </p>
      {!ready && (
        <p className="rounded-lg border p-3 text-sm">
          This business isn&apos;t ready to sell yet. Ask the owner to finish
          setting it up.
        </p>
      )}
      <Link href="/hub?all=1" className="text-sm underline">
        Switch business
      </Link>
    </main>
  );
}

export default function PosHome({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-neutral-500">Loading checkout...</div>
      }
    >
      <PosHomeContent params={params} />
    </Suspense>
  );
}
