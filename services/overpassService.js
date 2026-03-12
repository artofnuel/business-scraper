export async function fetchOverpassBusinesses(niche, location) {
    // Convert basic niches to OSM standard tags where possible, or use a generic search
    // The user prompt example gives: node["shop"="plumber"](Houston) - wait, standard is not always 'shop'.
    // We will do a generic text match across name, amenity, shop, office.
    // Overpass QL for generic search inside an area:
    // We must first resolve the area.

    const query = `
    [out:json][timeout:25];
    (
      node["shop"~"${niche}",i](~"${location}",i);
      way["shop"~"${niche}",i](~"${location}",i);
      node["amenity"~"${niche}",i](~"${location}",i);
      way["amenity"~"${niche}",i](~"${location}",i);
      node["office"~"${niche}",i](~"${location}",i);
      way["office"~"${niche}",i](~"${location}",i);
    );
    out center;
  `;

    // Actually, a simpler approach that doesn't rely on area resolution errors is using standard text search if possible, or Nominatim.
    // Overpass area search by name is tricky if not mapped to a known area ID. Let's use Nominatim to get bounding box first, then query Overpass.

    try {
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'NWS-Scraper-App/1.0' }
        });
        const nomData = await nomRes.json();

        if (!nomData || nomData.length === 0) {
            console.warn('Location not found in OSM');
            return [];
        }

        const bbox = nomData[0].boundingbox; // [latMin, latMax, lonMin, lonMax]
        // Overpass format: (south, west, north, east)
        const overpassBbox = `${bbox[0]},${bbox[2]},${bbox[1]},${bbox[3]}`;

        // A more forgiving query looking around the bbox for the niche word in common tags or name
        const overpassQuery = `
      [out:json][timeout:25];
      (
        nwr["shop"~"${niche}",i](${overpassBbox});
        nwr["amenity"~"${niche}",i](${overpassBbox});
        nwr["craft"~"${niche}",i](${overpassBbox});
        nwr["office"~"${niche}",i](${overpassBbox});
        nwr["name"~"${niche}",i](${overpassBbox});
      );
      out center 30; // limit to 30
    `;

        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const osRes = await fetch(overpassUrl, {
            method: 'POST',
            body: overpassQuery
        });

        const osData = await osRes.json();

        if (!osData.elements) return [];

        return osData.elements.map(el => {
            const t = el.tags || {};

            // Try to assemble an address
            const addrChunks = [t['addr:housenumber'], t['addr:street'], t['addr:city'], t['addr:state'], t['addr:postcode']].filter(Boolean);
            const address = addrChunks.length > 0 ? addrChunks.join(', ') : location;

            return {
                name: t.name || 'Unknown Business',
                category: t.shop || t.amenity || t.craft || t.office || niche,
                location: address,
                description: '',
                email: t.email || t['contact:email'] || '',
                phone: t.phone || t['contact:phone'] || '',
                website: t.website || t['contact:website'] || '',
                source: 'OpenStreetMap'
            };
        }).slice(0, 30);

    } catch (error) {
        console.error('Overpass API error:', error);
        return [];
    }
}
