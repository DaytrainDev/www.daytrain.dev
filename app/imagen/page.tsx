"use server";
import { ImagenSession } from "@/lib/components/imagen";
import AiController from "@/lib/controllers/openai";
import { getServerSession } from "next-auth";
import authConfig from "@/lib/config/auth";
import { CreateImageRequestSizeEnum } from "openai-edge";



const handleSubmit = async (prompt: string, user: string) => {
  "use server";
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!prompt) {
    return new Response('Prompt is required.', { status: 400 });
  }

  const response = await AiController.imagen({ prompt, user, size: CreateImageRequestSizeEnum._1024x1024 });

  return response;
};
  

const Page = ({ session }: any) => {
  "use server";

  return (
    <ImagenSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
