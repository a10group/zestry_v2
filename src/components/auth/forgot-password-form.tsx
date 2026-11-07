"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { toE164 } from "@/lib/phone";

type Channel = "email" | "phone";
const field = "w-full rounded-lg border px-3 py-2";

export function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [step, setStep] = React.useState<"identify" | "code" | "password">(
    "identify",
  );
  const [channel, setChannel] = React.useState<Channel>("email");
  const [identifier, setIdentifier] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  const resetApi = (ch: Channel) =>
    ch === "email"
      ? signIn.resetPasswordEmailCode
      : signIn.resetPasswordPhoneCode;
  // Errors are logged, not shown, so the screen never reveals whether an account exists.
  async function requestCode(id: string, ch: Channel) {
    const { error: createError } = await signIn.create({
      identifier: id,
    });
    if (createError) {
      console.warn("reset: create failed", createError);
      return;
    }
    const { error: sendError } = await resetApi(ch).sendCode();
    if (sendError) {
      console.warn("reset: send failed", sendError);
      return;
    }
    setCooldown(60);
  }
  async function onIdentify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const raw = String(new FormData(e.currentTarget).get("identifier")).trim();
    const isEmail = raw.includes("@");
    const id = isEmail ? raw : toE164(raw);
    if (!id) {
      setError("Enter a valid email or phone number.");
      return;
    }
    const ch: Channel = isEmail ? "email" : "phone";
    setBusy(true);
    setError(null);
    try {
      await requestCode(id, ch);
      setIdentifier(id);
      setChannel(ch);
      setStep("code");
    } finally {
      setBusy(false);
    }
  }
  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const code = String(new FormData(e.currentTarget).get("code")).trim();
      const { error } = await resetApi(channel).verifyCode({ code });
      if (error) throw error;
      if (signIn.status === "needs_new_password") setStep("password");
      else setError("We couldn't verify that code. Try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setBusy(false);
    }
  }
  async function onSubmitPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error } = await resetApi(channel).submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (error) throw error;
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/hub");
            if (url.startsWith("http")) window.location.href = url;
            else router.push(url);
          },
        });
      } else {
        router.push("/sign-in"); // password is changed; another step is pending
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not set the password.",
      );
    } finally {
      setBusy(false);
    }
  }
  const disabled = busy || fetchStatus === "fetching";
  const button =
    "w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50";
  if (step === "password") {
    return (
      <form
        onSubmit={onSubmitPassword}
        className="mx-auto max-w-sm space-y-3 p-6"
      >
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <input
          name="password"
          type="password"
          placeholder="New password"
          className={field}
          required
        />
        <input
          name="confirm"
          type="password"
          placeholder="Confirm new password"
          className={field}
          required
        />
        {error && <p className="text-sm textred-600">{error}</p>}
        <button disabled={disabled} className={button}>
          Save password
        </button>
      </form>
    );
  }
  if (step === "code") {
    return (
      <form onSubmit={onVerify} className="mxauto max-w-sm space-y-3 p-6">
        <h1 className="text-xl font-semibold">Enter the code</h1>
        <p className="text-sm text-neutral-600">
          If an account exists for {identifier}, we sent a code. Didn't get it?
          Check the {channel === "email" ? "email address" : "number"} and try
          again.
        </p>
        <input
          name="code"
          inputMode="numeric"
          placeholder="6-digit code"
          className={field}
          required
        />
        {error && <p className="text-sm textred-600">{error}</p>}
        <button disabled={disabled} className={button}>
          Continue
        </button>
        <button
          type="button"
          disabled={disabled || cooldown > 0}
          onClick={async () => {
            setBusy(true);
            try {
              await requestCode(identifier, channel);
            } finally {
              setBusy(false);
            }
          }}
          className="w-full text-sm underline
disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("identify");
            setError(null);
          }}
          className="w-full text-sm underline"
        >
          Use a different email or phone
        </button>
      </form>
    );
  }
  return (
    <form onSubmit={onIdentify} className="mxauto max-w-sm space-y-3 p-6">
      <h1 className="text-xl font-semibold">Forgot your password?</h1>
      <p className="text-sm text-neutral-600">
        Enter the email or phone number you signed up with.
      </p>
      <input
        name="identifier"
        placeholder="Email or
phone number"
        className={field}
        required
      />
      {error && <p className="text-sm textred-600">{error}</p>}
      <button disabled={disabled} className={button}>
        Send code
      </button>
      <p className="text-center text-sm">
        <Link href="/sign-in" className="underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
