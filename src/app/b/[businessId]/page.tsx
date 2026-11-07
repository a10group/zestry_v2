import { requireBusinessContext } from "@/server/auth/context";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";
import { homeAreaFor } from "@/modules/authorization/access";

async function BusinessHomeContent({
  params,
}: {
  params: Promise<{ businessId: string }>;
}): Promise<React.ReactNode> {
  const { businessId } = await params;
  const { business, roleKeys } = await requireBusinessContext(businessId);
  if (business.status === "ONBOARDING") redirect(`/onboarding/${business.id}`);

  const home = homeAreaFor(roleKeys);
  if (!home) notFound();
  redirect(`/b/${business.id}/${home}`);
}

export default function BusinessHome({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-neutral-500">Loading business...</div>
      }
    >
      <BusinessHomeContent params={params} />
    </Suspense>
  );
}
