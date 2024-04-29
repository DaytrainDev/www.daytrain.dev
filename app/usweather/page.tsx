"use server";
import { WeatherSession } from "@/lib/components/weather";
import { search as weatherSearch} from "@/lib/services/weather";
import { search as geoSearch, Geolocation } from "@/lib/services/geocode";
import { getServerSession } from "next-auth";

const handleGeoSearch = async (incSearchText: string) => {
  "use server";
  return await geoSearch(incSearchText);
};

const handleWeatherSearch = async (geocode: Geolocation) => {
  "use server";
  return await weatherSearch(geocode);
};

const Page = async () => {
  const session = getServerSession();

  return (
    <WeatherSession 
      session={session}
      handleGeoSearch={handleGeoSearch} 
      handleWeatherSearch={handleWeatherSearch}
    />
  );
}
export default Page;