import { auth, currentUser } from "@clerk/nextjs/server";

export type ExternalProfile = {
  provider: "CLERK";
  subject: string; // Clerk user id
  firstName: string | null;
  lastName: string | null;
  otherNames: string | null;
  phone: string | null; // E.164
  contactPhone: string | null; // unverified
  email: string | null;
};

// Cheap: reads the session only, no network call.
export async function getSignedInSubject(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

// Costs a Clerk API call, so only use it when we have no local user yet.
export async function fetchProfile(): Promise<ExternalProfile | null> {
  const u = await currentUser();
  if (!u) return null;
  const other = u.unsafeMetadata?.otherNames;
  const cp = u.unsafeMetadata?.contactPhone;
  return {
    provider: "CLERK",
    subject: u.id,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    otherNames:
      typeof other === "string" ? other.trim().slice(0, 100) || null : null,
    contactPhone:
      typeof cp === "string" && /^\+[1-9]\d{6,14}$/i.test(cp) ? cp : null,
    phone: u.primaryPhoneNumber?.phoneNumber ?? null,
    email: u.primaryEmailAddress?.emailAddress ?? null,
  };
}
