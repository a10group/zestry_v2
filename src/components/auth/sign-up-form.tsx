"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { toE164 } from "@/lib/phone";

type Channel = "email" | "phone";
const field =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black";

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = React.useState<"form" | "code">("form");
  const [channel, setChannel] = React.useState<Channel>("phone");
  const [sentTo, setSentTo] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(ch: Channel) {
    const { error } =
      ch === "email"
        ? await signUp.verifications.sendEmailCode()
        : await signUp.verifications.sendPhoneCode();

    if (error) throw error;
    setCooldown(60);
  }

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    const confirm = String(f.get("confirm"));
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const email = String(f.get("email"));
    const phone = toE164(String(f.get("phone")));
    const other = String(f.get("otherNames") ?? "").trim();
    const ch: Channel = email ? "email" : "phone";

    setBusy(true);
    setError(null);

    try {
      const { error } = await signUp.create({
        firstName: String(f.get("firstName")),
        lastName: String(f.get("lastName")),
        password,
        ...(ch === "email" ? { emailAddress: email } : { phoneNumber: phone }),
        unsafeMetadata: {
          ...(other ? { otherNames: other } : {}),
          ...(ch === "email" ? { contactPhone: phone } : {}),
        },
      });

      if (error) throw error;
      await sendCode(ch);
      setChannel(ch);
      setSentTo(ch === "email" ? email : phone);
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account.");
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
          ? await signUp.verifications.verifyEmailCode({ code })
          : await signUp.verifications.verifyPhoneCode({ code });

      if (error) throw error;
      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/hub");
            if (url.startsWith("http")) window.location.href = url;
            else router.push(url);
          },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || fetchStatus === "fetching";

  if (step === "code") {
    return (
      <form
        onSubmit={onVerify}
        className="mx-auto max-w-sm space-y-3 p-6 text-neutral-900"
      >
        <h1 className="text-xl font-semibold text-neutral-900">
          Verify your {channel === "email" ? "email" : "phone"}
        </h1>
        <p className="text-sm text-neutral-600">
          We have sent a code to your {sentTo}.
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
              await sendCode(channel);
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
      <h1 className="text-xl font-semibold text-neutral-900">
        Create your account
      </h1>
      <input
        name="firstName"
        type="text"
        placeholder="First name"
        className={field}
        required
      />
      <input
        name="lastName"
        type="text"
        placeholder="Last name"
        className={field}
        required
      />
      <input
        name="otherNames"
        type="text"
        placeholder="Other names (optional)"
        className={field}
      />
      <input
        name="email"
        type="email"
        placeholder="Email (optional)"
        className={field}
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone number"
        className={field}
        required
      />
      <p className="text-xs text-neutral-600">
        With an email, we send the code there. Without one, we send a text your
        phone.
      </p>
      <input
        name="password"
        type="password"
        placeholder="Password"
        className={field}
        required
      />
      <input
        name="confirm"
        type="password"
        placeholder="Confirm password"
        className={field}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div id="clerk-captcha" />
      <button
        disabled={disabled}
        className="w-full rounded-lg py-2 bg-black px-3 text-white disabled:opacity-50"
      >
        Continue
      </button>
      <p className="text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-black underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
