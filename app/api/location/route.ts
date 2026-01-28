import { search as geoSearch } from "@/lib/services/geocode";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * Location/Geocoding API endpoint
 *
 * Query params:
 * - q: Search for a location (e.g., /api/location?q=Denver,CO)
 *
 * Returns: { latitude, longitude } or { error }
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { error: 'Please provide a search query (q parameter)' },
      { status: 400 }
    );
  }

  const result = await geoSearch(q);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
