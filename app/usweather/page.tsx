"use server";
import { WeatherSession } from "@/lib/components/views/weather";
import { search as weatherSearch, GeoCoordinates, WeatherResult } from "@/lib/services/weather";
import { search as geoSearch, GeoResult } from "@/lib/services/geocode";
import { getServerSession } from "next-auth";

const handleGeoSearch = async (searchText: string): Promise<GeoResult> => {
  "use server";
  return await geoSearch(searchText);
};

const handleWeatherSearch = async (geocode: GeoCoordinates): Promise<WeatherResult> => {
  "use server";
  return await weatherSearch(geocode);
};

const Page = async () => {
  const session = await getServerSession();

  return (
    <WeatherSession
      session={session}
      handleGeoSearch={handleGeoSearch}
      handleWeatherSearch={handleWeatherSearch}
    />
  );
};

export default Page;
