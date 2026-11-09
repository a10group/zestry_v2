import { getAuthContext } from "@/server/auth/context";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { redirect } from "next/navigation";
import { primaryRoleLabel } from "@/modules/authorization/roles";
import Link from "next/link";
import { connection } from "next/server";
import { daysUntilArchive } from "@/modules/businesses/onboarding-policy";

async function HubContent({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  await connection();
  const { user, memberships } = await getAuthContext();
  const { all } = await searchParams;

  if (
    memberships.length === 1 &&
    memberships[0].business.status === "ACTIVE" &&
    !all
  ) {
    redirect(`/b/${memberships[0].business.id}`);
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">Hello, {user.firstName}</p>
        <SignOutButton />
      </div>
      <h1 className="text-xl font-semibold">
        Where would you like to work today?
      </h1>

      {memberships.length === 0 && (
        <p className="text-sm text-neutral-600">
          You don't have a business yet.
        </p>
      )}
      <ul className="space-y-2">
        {memberships.map((m) => {
          const setup = m.business.status === "ONBOARDING";
          const left = setup ? daysUntilArchive(m.business.updatedAt) : null;
          return (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{m.business.name}</p>
                <p className="text-sm text-neutral-600">
                  {primaryRoleLabel(m.roleAssignments.map((r) => r.roleKey))}
                  {setup && " · Setup not finished"}
                  {left !== null &&
                    `. removed in ${left} day${left === 1 ? "" : "s"}`}
                </p>
              </div>
              <Link
                href={
                  setup ? `/onboarding/${m.business.id}` : `/b/${m.business.id}`
                }
                className="rounded-lg bg-black px-3 py-1.5 text-sm text-white"
              >
                {setup ? "Continue setup" : "Open"}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/onboarding/new"
        className="block rounded-lg border p-3 text-center text-sm"
      >
        Register a new business
      </Link>
    </main>
  );
}

export default function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-neutral-500">Loading hub...</div>
      }
    >
      <HubContent searchParams={searchParams} />
    </Suspense>
  );
}
