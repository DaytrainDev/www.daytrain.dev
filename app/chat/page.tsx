"use server";
import { ChatSession } from "@/lib/components/chat";
import AiController from "@/lib/controllers/openai";
import { getServerSession } from "next-auth";
import { ChatCompletionRequestMessage } from "openai-edge";
import authConfig from "@/lib/config/auth";

const handleSubmit = async (messages: ChatCompletionRequestMessage[], user: string) => {
  "use server";
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

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
