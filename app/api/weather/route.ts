import { search as geoSearch } from "@/lib/services/geocode";
import { search as weatherSearch} from "@/lib/services/weather";
import { getServerSession } from "next-auth";

import { NextResponse } from "next/server";

export async function GET(request: Request, { params } : {params: { searchText?: string }}) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ message: 'You must be logged in to use this endpoint.'},
      { status: 400 });
  }

  if (!params?.searchText) {
    return NextResponse.json({ message: 'Please include a value for `searchText`.'},
      { status: 400 });
  }
  
  // TODO: return location data when user is authenticated
  return NextResponse.json(await weatherSearch(await geoSearch(params?.searchText)));
}
