import { requireBusinessContext } from "@/server/auth/context";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LocationTaxForm } from "@/components/onboarding/location-tax-form";
import { finishOnboardingAction } from "@/modules/businesses/action";
import { connection } from "next/server";

async function OnboardingPageContent({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  await connection();
  const { businessId } = await params;
  const { business, roleKeys } = await requireBusinessContext(businessId);

  if (!roleKeys.includes("OWNER")) redirect("/hub");
  if (business.status === "ACTIVE") redirect(`/b/${business.id}`);

  if (business.onboardingStep === "PRODUCT_SETUP") {
    return (
      <main className="mx-auto max-w-md space-y-4 p-6">
        <p className="text-sm text-neutral-600">Step 3 of 3</p>
        <h1 className="text-xl font-semibold">Add your products</h1>
        <p className="text-sm text-neutral-600">
          Adding products, and importing them from Excel or CSV, is built in the
          products module. For now you can skip this and add products later.
        </p>
        <form action={finishOnboardingAction}>
          <input type="hidden" name="businessId" value={business.id} />
          <button className="w-full rounded-lg bg-black px-3 py-2 text-white">
            Skip for now
          </button>
        </form>
      </main>
    );
  }

  return <LocationTaxForm businessId={business.id} />;
}

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-neutral-500">
          Loading business onboarding...
        </div>
      }
    >
      <OnboardingPageContent params={params} />
    </Suspense>
  );
}
