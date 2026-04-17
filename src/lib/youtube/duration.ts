/** Parse YouTube contentDetails.duration ISO 8601 (e.g. PT4M13S) to a short label. */
export function formatIsoDuration(iso: string | undefined): string | undefined {
  if (!iso || !iso.startsWith("PT")) return undefined;
  const h = iso.match(/(\d+)H/)?.[1];
  const m = iso.match(/(\d+)M/)?.[1];
  const s = iso.match(/(\d+)S/)?.[1];
  const hh = h ? parseInt(h, 10) : 0;
  const mm = m ? parseInt(m, 10) : 0;
  const ss = s ? parseInt(s, 10) : 0;
  if (hh > 0) {
    return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${mm}:${String(ss).padStart(2, "0")}`;
}
