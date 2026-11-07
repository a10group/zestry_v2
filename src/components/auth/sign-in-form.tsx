"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { toE164 } from "@/lib/phone";

type Channel = "email" | "phone";
const field =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black";

export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [step, setStep] = React.useState<"credentials" | "verify">(
    "credentials",
  );
  const [channel, setChannel] = React.useState<Channel>("email");
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function finish() {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/hub");
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
  }

  async function sendVerification(ch: Channel) {
    const { error } =
      ch === "email"
        ? await signIn.mfa.sendEmailCode()
        : await signIn.mfa.sendPhoneCode();

    if (error) throw error;
    setCooldown(60);
  }

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    const f = new FormData(e.currentTarget);
    const identifier = String(f.get("identifier")).trim();
    const password = String(f.get("password"));
    const isEmail = identifier.includes("@");

    let phone: string | null = null;
    if (!isEmail) {
      phone = toE164(identifier);
      if (!phone) {
        setError("Enter a valid email or phone number");
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const { error } = await signIn.password(
        isEmail
          ? { emailAddress: identifier, password }
          : { phoneNumber: phone!, password },
      );
      if (error) throw error;

      if (signIn.status === "complete") {
        await finish();
      } else if (signIn.status === "needs_client_trust") {
        const has = (s: string) =>
          signIn.supportedSecondFactors?.some((x) => x.strategy === s);

        const ch: Channel = isEmail
          ? has("email_code")
            ? "email"
            : "phone"
          : has("phone_code")
            ? "phone"
            : "email";

        if (!has(ch === "email" ? "email_code" : "phone_code")) {
          setError("We can't verify this device yet. Please contact support.");
        }

        setChannel(ch);
        await sendVerification(ch);
        setStep("verify");
      } else {
        setError("Sign-in needs another step that isn't supported.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const code = String(new FormData(e.currentTarget).get("code"));
      const { error } =
        channel === "email"
          ? await signIn.mfa.verifyEmailCode({ code })
          : await signIn.mfa.verifyPhoneCode({ code });
      if (error) throw error;

      if (signIn.status === "complete") await finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setBusy(false);
      setStep("credentials");
    }
  }

  const disabled = busy || fetchStatus === "fetching";

  if (step === "verify") {
    return (
      <form
        onSubmit={onVerify}
        className="mx-auto max-w-sm space-y-3 p-6 text-neutral-900"
      >
        <h1 className="text-xl font-semibold text-neutral-900">
          Verify this device
        </h1>
        <p className="text-sm text-neutral-600">
          We have sent a code to your {channel === "email" ? "email" : "phone"}.
        </p>
        <input
          name="code"
          inputMode="numeric"
          placeholder="Enter the 6-digit code"
          className={field}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={disabled}
          className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          Verify
        </button>
        <button
          type="button"
          disabled={disabled || cooldown > 0}
          onClick={async () => {
            setBusy(true);
            try {
              await sendVerification(channel);
            } catch {
              setError("Could not resend the code.");
            } finally {
              setBusy(false);
            }
          }}
          className="w-full text-sm text-neutral-600 underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-sm space-y-3 p-6 text-neutral-900"
    >
      <h1 className="text-xl font-semibold text-neutral-900">Sign in</h1>
      <input
        name="identifier"
        type="text"
        placeholder="Email or phone number"
        className={field}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className={field}
        required
      />
      <p className="text-right text-sm">
        <Link href="/forgot-password" className="underline">
          Forgot password?
        </Link>
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={disabled}
        className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        Sign In
      </button>
      <p className="text-sm text-neutral-600">
        New here?{" "}
        <Link href="/sign-up" className="text-black underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
