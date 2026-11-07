export const ROLE_ORDER = ["OWNER", "MANAGER", "CASHIER"] as const;

const LABELS: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  CASHIER: "Cashier",
};

export function primaryRoleLabel(keys: string[]) {
  const best = ROLE_ORDER.find((r) => keys.includes(r)) ?? keys[0];
  return best ? (LABELS[best] ?? best) : "Member";
}
