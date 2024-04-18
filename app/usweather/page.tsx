"use server";
import { getServerSession } from "next-auth";
import authConfig from "@/lib/config/auth";
import { WeatherSession } from "@/lib/components/weather";
import { search } from "@/lib/services/weather";

const handleSubmit = async (incSearchText: string) => {
  "use server";
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  return await search(incSearchText);
};
  

const Page = ({ session }: any) => {
  "use server";

  return (
    <WeatherSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;