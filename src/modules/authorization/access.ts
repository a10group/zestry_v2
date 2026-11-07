// Phase 1 gate: role keys -> areas. The attribute-based engine replaces this later.
export type Area = "admin" | "pos";

const AREA_ROLES: Record<Area, readonly string[]> = {
  admin: ["OWNER", "MANAGER"],
  pos: ["OWNER", "MANAGER", "CASHIER"],
};

export function canAccess(roleKeys: string[], area: Area) {
  return roleKeys.some((r) => AREA_ROLES[area].includes(r));
}

// Where a person lands first. Null means nop known role, so no access at all.
export function homeAreaFor(roleKeys: string[]): Area | null {
  if (canAccess(roleKeys, "admin")) return "admin";
  if (canAccess(roleKeys, "pos")) return "pos";
  return null;
}
