export const ARCHIVE_AFTER_DAYS = 30;
export const WARN_AFTER_DAYS = 21;
export const PURGE_AFTER_DAYS = 30;

const DAY = 24 * 60 * 60 * 1000;

export function daysAgo(n: number) {
  return new Date(Date.now() - n * DAY);
}

// null = no warning yet; otherwise, the days left before  the business is archived.
export function daysUntilArchive(updatedAt: Date): number | null {
  const idle = Math.floor((Date.now() - updatedAt.getTime()) / DAY);
  if (idle < WARN_AFTER_DAYS) return null;
  return Math.max(0, ARCHIVE_AFTER_DAYS - idle);
}
