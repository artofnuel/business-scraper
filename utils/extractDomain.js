/**
 * Extracts the bare domain from a URL.
 * e.g. https://www.acmeplumbing.com → acmeplumbing.com
 */
export function extractDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}
