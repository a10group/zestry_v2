import { BusinessInfo } from "@/modules/businesses/schema";
import { db } from "@/server/db";
import { toE164 } from "@/lib/phone";

export async function createBusinessWithOwner(
  user: { id: string; name: string },
  d: BusinessInfo,
) {
  return db.$transaction(async (tx) => {
    // Serialise this user's creates so a double click can't make two businesses
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;

    const recent = await tx.business.findFirst({
      where: {
        name: d.name,
        status: "ONBOARDING",
        createdAt: { gt: new Date(Date.now() - 60_000) },
        memberships: { some: { userId: user.id } },
      },
      select: { id: true },
    });
    if (recent) return recent;

    const business = await tx.business.create({
      data: {
        name: d.name,
        vertical: d.vertical,
        country: d.country,
        currency: d.currency,
        timeZone: d.timeZone,
        phone: d.phone ? toE164(d.phone) : null,
        email: d.email ?? null,
        address: d.address ?? null,
        status: "ONBOARDING",
        onboardingStep: "LOCATION_BRANDING_TAX",
      },
      select: { id: true },
    });

    const membership = await tx.membership.create({
      data: {
        userId: user.id,
        businessId: business.id,
        status: "ACTIVE",
        displayName: user.name,
      },
      select: { id: true },
    });

    await tx.roleAssignment.create({
      data: {
        membershipId: membership.id,
        businessId: business.id,
        siteId: null,
        roleKey: "OWNER",
      },
    });

    return business;
  });
}
