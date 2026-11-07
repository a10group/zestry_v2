import { getAuthContext } from "@/server/auth/context";
import { BusinessInfoForm } from "@/components/onboarding/business-info-form";
import { Suspense } from "react";

async function OnboardingContent() {
  await getAuthContext();

  return <BusinessInfoForm />;
}

export default function OnboardingBusinessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-neutral-500">
          Loading onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
