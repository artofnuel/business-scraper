const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRegex = /(\+?\d[\d\s().-]{7,})/g;

const ignoreDomains = ['example.com', 'test.com', 'wix.com', 'sentry.io', 'google.com'];

export function extractContactInfo(html) {
    let emails = new Set();
    let phones = new Set();
    let description = '';

    if (!html) return { emails: Array.from(emails), phones: Array.from(phones), description };

    // 1. Extract Emails
    const foundEmails = html.match(emailRegex);
    if (foundEmails) {
        for (const email of foundEmails) {
            const lowerEmail = email.toLowerCase();
            // Basic filtering
            const domain = lowerEmail.split('@')[1];
            if (domain && !ignoreDomains.some(d => domain.includes(d))) {
                // Exclude common image extensions incorrectly matched
                if (!lowerEmail.match(/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/)) {
                    emails.add(lowerEmail);
                }
            }
        }
    }

    // 2. Extract Phones (very naive regex, might pick up dates/ids but we try)
    // To keep it simple as requested
    const foundPhones = html.match(phoneRegex);
    if (foundPhones) {
        for (const phone of foundPhones) {
            const clean = phone.trim();
            // Extra validation: length, not just spaces
            if (clean.replace(/\D/g, '').length >= 7 && clean.length < 25) {
                phones.add(clean);
            }
        }
    }

    return { emails: Array.from(emails), phones: Array.from(phones), description };
}

// Order of preference for emails
export function pickBestEmail(emails) {
    if (!emails || emails.length === 0) return '';

    const preferredPrefixes = ['info@', 'contact@', 'hello@', 'support@', 'sales@'];

    for (const prefix of preferredPrefixes) {
        const found = emails.find(e => e.startsWith(prefix));
        if (found) return found;
    }

    return emails[0];
}
