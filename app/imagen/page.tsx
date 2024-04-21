"use server";
import { ImaGenSession } from "@/lib/components/imaGen";
import OpenAI from "@/lib/services/openai";

const handleSubmit = async (
  prompt: string, 
  user: string,
  size?: "512x512" | "256x256" | "1024x1024", 
  n?: number
) => {
  "use server";
  const response = await OpenAI.images.generate({
    prompt: prompt,
    n: n ?? 1,
    size: size ?? '512x512',
    user: user,
    // response_format?: CreateImageRequestResponseFormatEnum;
  });

  return response?.data[0];
};

const Page = async ({ session }: any) => {

  return (
    <ImaGenSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
