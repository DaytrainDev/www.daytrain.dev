import { search as geoSearch } from "@/lib/services/geocode";

import { NextResponse } from "next/server";

export async function GET(request: Request, { 
  params: { searchText } } : {params: { searchText: string }
}) {
  // TODO: return location data when user is authenticated
  return NextResponse.json(await geoSearch(searchText));
}
