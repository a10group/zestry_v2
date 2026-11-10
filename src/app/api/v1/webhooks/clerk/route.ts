import { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { deactivateUserSubject, syncUser } from "@/server/auth/sync-user";
import { profileFromWebhook } from "@/server/auth/identity";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req); // reads CLERK_WEBHOOK_SIGNING_SECRET
  } catch (e) {
    console.error("Webhook verification failed", e);
    return new Response("Invalid Webhook", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await syncUser(profileFromWebhook(evt.data));
        break;
      case "user.deleted":
        if (evt.data.id) await deactivateUserSubject(evt.data.id);
        break;
    }
    return new Response("Ok", { status: 200 });
  } catch (e) {
    console.error("Webhook handler failed", evt.type, e);
    return new Response("Handler error", { status: 500 }); // Clerk will retry
  }
}
