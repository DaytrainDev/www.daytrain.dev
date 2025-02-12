import { search as geoSearch } from "@/lib/services/geocode";
import { search as weatherSearch} from "@/lib/services/weather";

import { NextResponse } from "next/server";

export async function GET(request: Request, { params } : {params: { searchText?: string }}) {
  if (!params?.searchText) {
    return NextResponse.json({ message: 'Please include a value for `searchText`.'},
      { status: 400 });
  }
  
  // TODO: return location data when user is authenticated
  return NextResponse.json(await weatherSearch(await geoSearch(params?.searchText)));
}
