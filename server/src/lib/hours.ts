export function calcHours(checkIn: string | null | undefined, checkOut: string | null | undefined): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round((ms / 3_600_000) * 100) / 100;
}
