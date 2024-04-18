"use server";
import { WeatherSession } from "@/lib/components/weather";
import { search } from "@/lib/services/weather";

const Page = ({ session }: any) => {
  "use server";

  const handleSubmit = async (incSearchText: string) => {
    "use server";
  
    return await search(incSearchText);
  };
    
  return (
    <WeatherSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;