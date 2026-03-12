export function deduplicate(leads) {
    const seenWebsites = new Set();
    const seenPhones = new Set();
    const seenNamesAndLocations = new Set();

    return leads.filter((lead) => {
        // 1. Deduplicate by website (if exists)
        if (lead.website) {
            const cleanWebsite = lead.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
            if (seenWebsites.has(cleanWebsite)) return false;
            seenWebsites.add(cleanWebsite);
        }

        // 2. Deduplicate by phone (if exists)
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/\D/g, ''); // keep only digits
            if (cleanPhone.length > 5) {
                if (seenPhones.has(cleanPhone)) return false;
                seenPhones.add(cleanPhone);
            }
        }

        // 3. Deduplicate by name + location
        if (lead.name) {
            const nameLocationKey = `${lead.name.toLowerCase().trim()}|${(lead.location || '').toLowerCase().trim()}`;
            if (seenNamesAndLocations.has(nameLocationKey)) return false;
            seenNamesAndLocations.add(nameLocationKey);
        }

        return true;
    });
}
