/** Skip bundled fallbacks until CMS has resolved, so stale images do not flash. */
export function cmsSrc(
  isPending: boolean,
  cmsUrl: string | undefined | null,
  fallback: string,
): string | undefined {
  if (isPending) return undefined;
  return cmsUrl || fallback;
}
