import { search as geoSearch } from "@/lib/services/geocode";
import { search as weatherSearch } from "@/lib/services/weather";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Weather API endpoint
 *
 * Query params:
 * - lat, lon: Get weather by coordinates (e.g., /api/weather?lat=39.7392&lon=-104.9903)
 * - q: Get weather by location search (e.g., /api/weather?q=Denver,CO)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q');

  // Option 1: Direct coordinates
  if (lat && lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lon must be numbers.' },
        { status: 400 }
      );
    }

    const result = await weatherSearch({ latitude, longitude });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  // Option 2: Search by location name/address
  if (q) {
    const geoResult = await geoSearch(q);
    if (geoResult.error || !geoResult.latitude || !geoResult.longitude) {
      return NextResponse.json(
        { error: geoResult.error || 'Location not found' },
        { status: 400 }
      );
    }

    const result = await weatherSearch({
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: 'Provide either lat/lon coordinates or q (search query)' },
    { status: 400 }
  );
}
