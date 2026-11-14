import { ExternalProfile } from "@/server/auth/identity";
import { ensureUser, findUserBySubject } from "@/server/auth/ensure-user";
import { db } from "@/server/db";

export async function syncUser(p: ExternalProfile) {
  const user = await findUserBySubject(p.provider, p.subject);
  if (!user) return ensureUser(p); // webhook arrives before our just in time fallback

  try {
    return await db.user.update({
      where: { id: user.id },
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
      },
    });
  } catch (e) {
    // Unique clash with a stale row; log it and let a person look. Retrying wouldn't help.
    if ((e as { code?: string }).code === "P2002") {
      console.error(
        "sync: email or phone already belongs to another user",
        p.subject,
      );
    }
    throw e;
  }
}

export async function deactivateUserSubject(subject: string) {
  const user = await findUserBySubject("CLERK", subject);
  if (!user) return;

  await db.$transaction([
    db.membership.updateMany({
      where: { userId: user.id, status: "ACTIVE" },
      data: { status: "DISABLED", disabledAt: new Date() },
    }),
    db.user.update({
      where: { id: user.id },
      // Release the unique contact values so the person can sign up again later
      data: { email: null, phone: null, contactPhone: null },
    }),
  ]);
}

export async function deactivateUserBySubject(subject: string) {
  const user = await findUserBySubject("CLERK", subject);
  if (!user) return;

  await db.$transaction(async (tx) => {
    // Businesses where this person is currently an active business-wide owner.
    const owned = await tx.roleAssignment.findMany({
      where: {
        roleKey: "OWNER",
        siteId: null,
        membership: {
          userId: user.id,
          status: "ACTIVE",
          business: { status: { not: "ARCHIVED" } },
        },
      },
      select: { businessId: true },
    });

    for (const { businessId } of owned) {
      const otherOwners = await tx.roleAssignment.count({
        where: {
          businessId,
          roleKey: "OWNER",
          site: null,
          membership: { status: "ACTIVE", userId: { not: user.id } },
        },
      });
      if (otherOwners > 0) continue; // someone else already owns it

      const successor = await tx.membership.findFirst({
        where: {
          businessId,
          status: "ACTIVE",
          userId: { not: user.id },
          roleAssignments: { some: { roleKey: "MANAGER" } },
        },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!successor) {
        console.error("OWNERLESS BUSINESS: needs support", businessId);
        continue;
      }

      await tx.roleAssignment.create({
        data: {
          membershipId: successor.id,
          businessId,
          siteId: null,
          roleKey: "OWNER",
        },
      });
    }

    await tx.membership.updateMany({
      where: { userId: user.id, status: "ACTIVE" },
      data: { status: "DISABLED", disabledAt: new Date() },
    });
    await tx.user.update({
      where: { id: user.id },
      // Release the unique contact values so the person can sign up again later.
      data: { email: null, phone: null, contactPhone: null },
    });
  });
}
