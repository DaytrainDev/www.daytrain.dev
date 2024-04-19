"use server";
import { ImagenSession } from "@/lib/components/imagen";
import OpenAI from "@/lib/services/openai";
import { CreateImageRequestSizeEnum } from "openai-edge";

const Page = ({ session }: any) => {
  "use server";

  const handleSubmit = async (
    prompt: string, user: string, n?: number,
    size: CreateImageRequestSizeEnum = CreateImageRequestSizeEnum._512x512 
  ) => {
    "use server";
    const response = await OpenAI.createImage({
      prompt: prompt,
      n: n ?? 1,
      size: size ?? CreateImageRequestSizeEnum._512x512,
      user: user,
      // response_format?: CreateImageRequestResponseFormatEnum;
    });
    const responseData = await response.json();

    return responseData?.data[0];
  };
    
  return (
    <ImagenSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
