export function toE164(input: string) {
  const s = input.replace(/[\s\-()]/g, "");
  if (s.startsWith("+")) return s;
  return "+232" + s.replace(/^0+/, "");
}
