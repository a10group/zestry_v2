import { cache } from "react";
import { fetchProfile, getSignedInSubject } from "@/server/auth/identity";
import { notFound, redirect } from "next/navigation";
import { ensureUser, findUserBySubject } from "@/server/auth/ensure-user";
import { db } from "@/server/db";

export const getAuthContext = cache(async () => {
  const subject = await getSignedInSubject();
  if (!subject) redirect("/sign-in");

  let user = await findUserBySubject("CLERK", subject);
  if (!user) {
    const profile = await fetchProfile();
    if (!profile) redirect("/sign-in");
    user = await ensureUser(profile);
  }

  const memberships = await db.membership.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
      business: { status: { not: "ARCHIVED" } },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          status: true,
          vertical: true,
          onboardingStep: true,
          updatedAt: true,
        },
      },
      roleAssignments: { select: { roleKey: true, siteId: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return { user, memberships };
});

export const requireBusinessContext = cache(async (businessId: string) => {
  const { user, memberships } = await getAuthContext();
  const membership = memberships.find((m) => m.business.id === businessId);
  if (!membership) notFound();
  return {
    user,
    business: membership.business,
    membership,
    roleKeys: membership.roleAssignments
      .filter((r) => r.siteId === null)
      .map((r) => r.roleKey),
  };
});
