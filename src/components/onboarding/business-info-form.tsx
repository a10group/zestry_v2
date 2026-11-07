"use client";

import React, { useActionState } from "react";
import { createBusinessAction } from "@/modules/businesses/action";
import { COUNTRIES } from "@/modules/businesses/countries";

const field =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black";
const label = "block text-sm font-medium text-neutral-900";

function withDefault(list: string[], value: string) {
  return list.includes(value) ? list : [value, ...list];
}

export function BusinessInfoForm() {
  const [state, action, pending] = useActionState(createBusinessAction, null);
  const [country, setCountry] = React.useState<string>(COUNTRIES[0].code);
  const defaults = COUNTRIES.find((c) => c.code === country)!;
  const [currency, setCurrency] = React.useState<string>(defaults.currency);
  const [timeZone, setTimeZone] = React.useState<string>(defaults.timeZone);

  const currencies = withDefault(Intl.supportedValuesOf("currency"), currency);
  const timeZones = withDefault(Intl.supportedValuesOf("timeZone"), timeZone);

  return (
    <form
      action={action}
      className="mx-auto max-w-md space-y-3 p-6 text-neutral-900"
    >
      <p className="text-sm text-neutral-600">Step 1 of 3</p>
      <h1 className="text-xl font-semibold">Tell us about your business</h1>

      <div>
        <label className={label} htmlFor="name">
          Business name
        </label>
        <input id="name" name="name" className={field} required />
      </div>

      <div>
        <label className={label} htmlFor="vertical">
          Business type
        </label>
        <select
          id="vertical"
          name="vertical"
          className={field}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Choose one
          </option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="RETAIL">Retail</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="country">
          Country
        </label>
        <select
          id="country"
          name="country"
          className={field}
          value={country}
          onChange={(e) => {
            const c = COUNTRIES.find((x) => x.code === e.target.value)!;
            setCurrency(c.currency);
            setCountry(c.code);
            setTimeZone(c.timeZone);
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            className={field}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="timeZone">
            Time zone
          </label>
          <select
            id="timeZone"
            name="timeZone"
            className={field}
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
          >
            {timeZones.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="phone">
          Business phone (optional)
        </label>
        <input id="phone" name="phone" type="tel" className={field} />
      </div>

      <div>
        <label className={label} htmlFor="email">
          Business email (optional)
        </label>
        <input id="email" name="email" type="email" className={field} />
      </div>

      <div>
        <label className={label} htmlFor="address">
          Business address (optional)
        </label>
        <input id="address" name="address" className={field} />
      </div>

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
