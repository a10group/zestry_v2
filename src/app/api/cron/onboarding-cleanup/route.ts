import { NextResponse } from "next/server";
import {
  archiveStaleOnboarding,
  purgedEmptyArchived,
} from "@/modules/businesses/onboarding-cleaup";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized Access Denied!", { status: 401 });
  }

  const archived = archiveStaleOnboarding();
  const purged = await purgedEmptyArchived();
  return NextResponse.json({ archived, purged });
}
