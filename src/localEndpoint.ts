/**
 * The single definition of "this URL stays on this computer".
 *
 * True only for http(s) URLs whose host is exactly a loopback name: localhost,
 * 127.0.0.1 or ::1. WHATWG URL reports IPv6 hosts in brackets ("[::1]"), so both
 * forms are accepted; look-alikes such as "localhost.example.com" or
 * "127.0.0.1@example.com" are not.
 */
export function isLoopbackUrl(value: string | undefined): boolean {
  if (!value) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}
