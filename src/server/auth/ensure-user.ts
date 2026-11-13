import { db } from "@/server/db";
import { ExternalProfile } from "./identity";

export async function findUserBySubject(provider: "CLERK", subject: string) {
  const row = await db.externalIdentity.findUnique({
    where: { provider_subject: { provider, subject } },
    include: { user: true },
  });
  return row?.user ?? null;
}

export async function ensureUser(p: ExternalProfile) {
  const existing = await findUserBySubject(p.provider, p.subject);
  if (existing) return existing;

  try {
    return await db.user.create({
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        otherNames: p.otherNames,
        phone: p.phone,
        contactPhone: p.contactPhone,
        email: p.email,
        externalIdentities: {
          create: {
            provider: p.provider,
            subject: p.subject,
          },
        },
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      const again = await findUserBySubject(p.provider, p.subject);
      if (again) return again;
    }
    throw e;
  }
}
