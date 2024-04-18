"use server";
import { ChatSession } from "@/lib/components/chat";
import AiController from "@/lib/controllers/openai";
import { ChatCompletionRequestMessage } from "openai-edge";

const Page = ({ session }: any) => {
  "use server";

  const handleSubmit = async (
    messages: ChatCompletionRequestMessage[], user: string
  ) => {
    "use server";
    if (!messages) {
      return new Response('Messages are required.', { status: 400 });
    }
  
    const response = await AiController.chat({ messages, user });
  
    return response;
  };

  return (
    <ChatSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
