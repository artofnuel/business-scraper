import dns from 'dns/promises';

/**
 * Returns true if the given domain has at least one MX record,
 * indicating it is configured to receive email.
 */
export async function hasMXRecord(domain) {
    try {
        const mx = await dns.resolveMx(domain);
        return Array.isArray(mx) && mx.length > 0;
    } catch {
        return false;
    }
}
