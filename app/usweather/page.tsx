"use server";
import { WeatherSession } from "@/lib/components/views/weather";
import { search as weatherSearch} from "@/lib/services/weather";
import { search as geoSearch } from "@/lib/services/geocode";
import { Geolocation } from "@/lib/types/daytrain";
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
  const session = await getServerSession();

  return (
    <WeatherSession 
      session={session}
      handleGeoSearch={handleGeoSearch} 
      handleWeatherSearch={handleWeatherSearch}
    />
  );
}
export default Page;