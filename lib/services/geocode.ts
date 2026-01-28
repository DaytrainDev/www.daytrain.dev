"use server";

export interface GeoResult {
  latitude?: number;
  longitude?: number;
  error?: string;
}

/**
 * Geocode a US location using the US Census Geocoder API
 * This is more reliable than geocode.xyz and is free for US addresses
 */
export const search = async (searchText: string): Promise<GeoResult> => {
  if (!searchText || searchText.trim().length < 2) {
    return { error: 'Please enter a valid location' };
  }

  try {
    // Try US Census Geocoder first (reliable for US addresses)
    const censusUrl = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
    censusUrl.searchParams.set('address', searchText.trim());
    censusUrl.searchParams.set('benchmark', 'Public_AR_Current');
    censusUrl.searchParams.set('format', 'json');

    const response = await fetch(censusUrl.toString());

    if (!response.ok) {
      return { error: 'Geocoding service unavailable. Please try again.' };
    }

    const data = await response.json();
    const matches = data?.result?.addressMatches;

    if (matches && matches.length > 0) {
      const { x: longitude, y: latitude } = matches[0].coordinates;
      return {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }

    // If no matches from Census, try a simpler approach with nominatim (OpenStreetMap)
    // This helps with city/state searches like "Denver, CO"
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', `${searchText.trim()}, USA`);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');
    nominatimUrl.searchParams.set('countrycodes', 'us');

    const nominatimResponse = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'daytrain.dev weather app',
      },
    });

    if (nominatimResponse.ok) {
      const nominatimData = await nominatimResponse.json();
      if (nominatimData && nominatimData.length > 0) {
        return {
          latitude: Number(nominatimData[0].lat),
          longitude: Number(nominatimData[0].lon),
        };
      }
    }

    return { error: 'Location not found. Try a US city name or zip code.' };
  } catch (err) {
    console.error('[Geocode Service] Error:', err);
    return { error: 'Failed to find location. Please try again.' };
  }
};
