/** Share session cookies only when the current host belongs to the platform domain. */
export function getAuthCookieDomain(host: string | null | undefined, platformDomain: string | undefined): string | undefined {
  if (!host || !platformDomain) return undefined;
  const hostname = host.split(":")[0].toLowerCase();
  const domain = platformDomain.split(":")[0].replace(/^\./, "").toLowerCase();
  if (!domain || domain === "localhost" || domain === "127.0.0.1") return undefined;
  return hostname === domain || hostname.endsWith("." + domain) ? "." + domain : undefined;
}
