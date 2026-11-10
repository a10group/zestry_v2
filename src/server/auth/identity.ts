import { auth, currentUser } from "@clerk/nextjs/server";
import { toE164 } from "@/lib/phone";

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

type ClerkUserJSON = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  primary_email_address_id: string | null;
  email_addresses: { id: string; email_address: string }[];
  primary_phone_number_id: string | null;
  phone_numbers: { id: string; phone_number: string }[];
  unsafe_metadata?: Record<string, unknown>;
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

export function profileFromWebhook(d: ClerkUserJSON): ExternalProfile {
  const email =
    d.email_addresses.find((e) => e.id === d.primary_email_address_id)
      ?.email_address ?? null;
  const phone =
    d.phone_numbers.find((e) => e.id === d.primary_phone_number_id)
      ?.phone_number ?? null;
  const other = d.unsafe_metadata?.otherNames;
  const cp = d.unsafe_metadata?.contactPhone;
  return {
    provider: "CLERK",
    subject: d.id,
    firstName: d.first_name ?? null,
    lastName: d.last_name ?? null,
    otherNames:
      typeof other === "string" ? other.trim().slice(0, 100) || null : null,
    phone,
    email,
    contactPhone: typeof cp === "string" ? toE164(cp) : null,
  };
}
