import { generateEmailPatterns } from '../utils/emailPatterns';
import { extractDomain } from '../utils/extractDomain';
import { hasMXRecord } from '../utils/mxCheck';

/**
 * Performs a domain-level email sweep when no email was found via page scraping.
 * Extracts the domain, checks for MX records, then returns generated email candidates.
 *
 * @param {string} website - The full website URL (e.g. https://acmeplumbing.com)
 * @returns {Promise<string[]>} - Array of candidate emails, or empty if domain has no MX record.
 */
export async function domainEmailSweep(website) {
    const domain = extractDomain(website);
    if (!domain) return [];

    const validDomain = await hasMXRecord(domain);
    if (!validDomain) return [];

    return generateEmailPatterns(domain);
}
