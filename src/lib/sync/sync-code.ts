export function isValidSyncCode(raw: string) {
  const code = raw.trim().toLowerCase();
  return /^[23456789abcdefghjkmnpqrstuvwxyz]{10,24}$/.test(code);
}
