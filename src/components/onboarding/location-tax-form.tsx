"use client";

import React, { useActionState } from "react";
import { saveLocationTaXAction } from "@/modules/businesses/action";

const field =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black";
const label = "block text-sm font-medium text-neutral-900";

export function LocationTaxForm({ businessId }: { businessId: string }) {
  const [state, action, pending] = useActionState(saveLocationTaXAction, null);
  const [mode, setMode] = React.useState<"RATE" | "NONE" | "LATER">("LATER");
  const [help, setHelp] = React.useState(false);

  return (
    <form action={action} className="mx-auto max-w-md space-y-4 p-6">
      <input type="hidden" name="businessId" value={businessId} />
      <p className="text-sm text-neutral-600">Step 2 of 3</p>
      <h1 className="text-xl font-semibold">Location and tax</h1>

      <div>
        <label className={label} htmlFor="locationName">
          Location name
        </label>
        <input
          id="locationName"
          name="locationName"
          defaultValue="Main Branch"
          className={field}
          required
        />
        <p className="mt-1 text-xs text-neutral-500">
          Every business has at least one location. You can add more branches
          later.
        </p>
      </div>

      <fieldset className="space-y-2">
        <div className="flex-col items-center justify-between">
          <legend className={label}>Tax</legend>
          <button
            type="button"
            onClick={() => setHelp((h) => !h)}
            className="text-sm underline"
          >
            Help me with this
          </button>
        </div>

        {help && (
          <div className="rounded-lg border bg-neutral-50 p-3 text-sm text-neutral-700">
            <p>
              <strong>Tax included:</strong> the price on your shelf or menu
              already contains tax. A 100 item at 15% shows 100 and the tax is a
              part of it.
            </p>
            <p className="mt-2">
              <strong>Tax added:</strong> tax is added at checkout. A 100 item
              at 15% shows 115.
            </p>
            <p>
              Not sure which applies to you? Choose &quot;Decide later.&quot;
              Ask your accountant or tax office what you must charge.
            </p>
          </div>
        )}

        {(
          [
            ["RATE", "Set a tax rate"],
            ["NONE", "We don't charge tax"],
            ["LATER", "Decide later"],
          ] as const
        ).map(([value, text]) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="taxMode"
              value={value}
              checked={mode === value}
              onChange={() => setMode(value)}
            />
            {text}
          </label>
        ))}

        {mode === "RATE" && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className={label} htmlFor="taxRate">
                Rate%
              </label>
              <input
                id="taxRate"
                name="taxRate"
                inputMode="decimal"
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="taxInclusive">
                Prices
              </label>
              <select
                id="taxInclusive"
                name="taxInclusive"
                defaultValue="true"
                className={field}
              >
                <option value="true">Include tax</option>
                <option value="false">Tax added at checkout</option>
              </select>
            </div>
          </div>
        )}
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
