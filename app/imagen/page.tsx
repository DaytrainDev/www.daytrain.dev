"use server";
import { ImagenSession } from "@/lib/components/imagen";
import AiController from "@/lib/controllers/openai";
import { CreateImageRequestSizeEnum } from "openai-edge";

const Page = ({ session }: any) => {
  "use server";

  const handleSubmit = async (
    prompt: string, user: string, 
    size: CreateImageRequestSizeEnum = CreateImageRequestSizeEnum._512x512 
  ) => {
    "use server";
  
    if (!prompt) {
      return { error: 'Prompt is required.'};
    }
  
    const response = await AiController.imagen({ prompt, user, size });
  
    return response;
  };
    
  return (
    <ImagenSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
