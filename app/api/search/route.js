import { NextResponse } from 'next/server';
import { fetchGooglePlaces } from '@/services/googlePlacesService';
import { fetchOverpassBusinesses } from '@/services/overpassService';
import { scrapeWebsites } from '@/services/websiteScraper';
import { deduplicate } from '@/utils/deduplicate';

export async function POST(request) {
    try {
        const { niche, location, source } = await request.json();

        if (!niche || !location || !source) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        let initialLeads = [];

        // 1. Fetch from source
        if (source === 'google') {
            initialLeads = await fetchGooglePlaces(niche, location);
        } else if (source === 'osm') {
            initialLeads = await fetchOverpassBusinesses(niche, location);
        } else {
            return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
        }

        if (!initialLeads || initialLeads.length === 0) {
            return NextResponse.json({ results: [] });
        }

        // 2. Normalize & Format (Already handled in services, just ensure uniform defaults)
        let formatLeads = initialLeads.map(l => ({
            name: l.name || 'N/A',
            category: l.category || 'N/A',
            location: l.location || 'N/A',
            description: l.description || '',
            email: l.email || '',
            phone: l.phone || 'N/A',
            website: l.website || 'N/A',
            source: l.source
        }));

        // 3. Deduplicate (Pre-scrape deduplication)
        formatLeads = deduplicate(formatLeads);

        // Limit to 30 as requested
        formatLeads = formatLeads.slice(0, 30);

        // 4. Scrape websites
        const scrapedLeads = await scrapeWebsites(formatLeads);

        // 5. Final Deduplication (Post-scrape in case phones matched)
        const finalLeads = deduplicate(scrapedLeads);

        // Fallback format
        const cleanedLeads = finalLeads.map(l => ({
            ...l,
            email: l.email || 'N/A',
            phone: l.phone || 'N/A'
        }));

        return NextResponse.json({ results: cleanedLeads });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to process search', details: error.message }, { status: 500 });
    }
}
