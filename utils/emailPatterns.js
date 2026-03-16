/**
 * Generates common business email pattern candidates for a given domain.
 * e.g. acmeplumbing.com → ['info@acmeplumbing.com', 'contact@acmeplumbing.com', ...]
 */
const PREFIXES = ['info', 'contact', 'hello', 'support', 'sales', 'admin'];

export function generateEmailPatterns(domain) {
    return PREFIXES.map(prefix => `${prefix}@${domain}`);
}
