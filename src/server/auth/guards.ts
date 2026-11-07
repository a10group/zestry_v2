import { Area, canAccess, homeAreaFor } from "@/modules/authorization/access";
import { requireBusinessContext } from "@/server/auth/context";
import { notFound, redirect } from "next/navigation";

export async function requireArea(businessId: string, area: Area) {
  const ctx = await requireBusinessContext(businessId);
  if (ctx.business.status === "ONBOARDING")
    redirect(`/onboarding/${businessId}`);

  if (!canAccess(ctx.roleKeys, area)) {
    const home = homeAreaFor(ctx.roleKeys);
    if (!home) notFound();
    redirect(`b/${businessId}/${home}`);
  }
  return ctx;
}
