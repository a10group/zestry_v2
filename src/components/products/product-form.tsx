"use client";

import { useActionState } from "react";
import { createProductAction } from "@/modules/products/actions";

const field = "w-full rounded-lg border px-3 py-2";

export function ProductForm({
  businessId,
  vertical,
  categories,
}: {
  businessId: string;
  vertical: "RESTAURANT" | "RETAIL";
  categories: string[];
}) {
  const [state, action, pending] = useActionState(createProductAction, null);
  const restaurant = vertical === "RESTAURANT";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="businessId" value={businessId} />
      <input
        name="name"
        placeholder={restaurant ? "Item name" : "Product name"}
        className={field}
        required
      />
      <input
        name="price"
        inputMode="decimal"
        placeholder="Price"
        className={field}
        required
      />
      <input
        name="categoryName"
        list="cats"
        placeholder="Category (optional)"
        className={field}
      />
      <datalist id="cats">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {!restaurant && (
        <>
          <input name="sku" placeholder="SKU (optional)" className={field} />
          <input
            name="cost"
            inputMode="decimal"
            placeholder="Cost (optional)"
            className={field}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="trackStock" defaultChecked /> Track
            stock
          </label>
        </>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
