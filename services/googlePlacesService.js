export async function fetchGooglePlaces(niche, location) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API;

    if (!apiKey) {
        throw new Error('Google Places API key is not configured');
    }

    const query = encodeURIComponent(`${niche} in ${location}`);
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    // Step 1: Text Search
    const searchRes = await fetch(textSearchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${searchData.status}`);
    }

    // Limit to 30 businesses
    const places = searchData.results.slice(0, 30);
    const detailedPlaces = [];

    // Step 2: Get Details for each place
    for (const place of places) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,types,rating&key=${apiKey}`;
        try {
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            if (detailsData.status === 'OK') {
                const d = detailsData.result;
                detailedPlaces.push({
                    name: d.name || '',
                    category: d.types ? d.types.join(', ') : '',
                    location: d.formatted_address || '',
                    description: '',
                    email: '',
                    phone: d.formatted_phone_number || '',
                    website: d.website || '',
                    source: 'Google Places'
                });
            }
        } catch (err) {
            console.error('Error fetching place details for', place.place_id, err);
        }
    }

    return detailedPlaces;
}
