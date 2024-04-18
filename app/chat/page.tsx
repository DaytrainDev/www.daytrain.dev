"use server";
import { ChatSession } from "@/lib/components/chat";
import AiController from "@/lib/controllers/openai";
import { ChatCompletionRequestMessage } from "openai-edge";

const handleSubmit = async (messages: ChatCompletionRequestMessage[], user: string) => {
  "use server";
  if (!messages) {
    return new Response('Messages are required.', { status: 400 });
  }

  const response = await AiController.chat({ messages, user });

  return response;
};
  

const Page = ({ session }: any) => {
  "use server";

  return (
    <ChatSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
