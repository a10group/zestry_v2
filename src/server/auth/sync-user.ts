import { ExternalProfile } from "@/server/auth/identity";
import { ensureUser, findUserBySubject } from "@/server/auth/ensure-user";
import { db } from "@/server/db";

export async function syncUser(p: ExternalProfile) {
  const user = await findUserBySubject(p.provider, p.subject);
  if (!user) return ensureUser(p); // webhook arrives before our just in time fallback

  const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || user.name;

  try {
    return await db.user.update({
      where: { id: user.id },
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        name,
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
      data: { email: null, phone: null, contactPhone: null, isActive: false },
    }),
  ]);
}
