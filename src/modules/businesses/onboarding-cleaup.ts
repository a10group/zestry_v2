import { db } from "@/server/db";
import {
  ARCHIVE_AFTER_DAYS,
  daysAgo,
  PURGE_AFTER_DAYS,
} from "@/modules/businesses/onboarding-policy";

export async function archiveStaleOnboarding() {
  const res = await db.business.updateMany({
    where: {
      status: "ONBOARDING",
      updatedAt: { lt: daysAgo(ARCHIVE_AFTER_DAYS) },
    },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });

  return res.count;
}

export async function purgedEmptyArchived() {
  const candidates = await db.business.findMany({
    where: {
      status: "ARCHIVED",
      archivedAt: { lt: daysAgo(PURGE_AFTER_DAYS) },
      // LEGACY
      users: { none: {} },
      products: { none: {} },
      customers: { none: {} },
      sales: { none: {} },
      stockMovements: { none: {} },
      expenses: { none: {} },
      suppliers: { none: {} },
      subscriptions: { none: {} },
    },
    select: { id: true },
    take: 100,
  });

  let purged = 0;
  for (const { id } of candidates) {
    try {
      await db.$transaction([
        db.roleAssignment.deleteMany({ where: { businessId: id } }),
        db.membership.deleteMany({ where: { businessId: id } }),
        db.site.deleteMany({ where: { businessId: id } }),
        db.business.delete({ where: { id } }),
      ]);
      purged++;
    } catch (e) {
      console.error("purge failed for business", id, e);
    }
  }
  return purged;
}
