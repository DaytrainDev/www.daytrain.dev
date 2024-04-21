"use server";
import { ChatSession } from "@/lib/components/chat";
import OpenAI from "@/lib/services/openai";

const handleSubmit = async (
  messages: any[], user: string
) => {
  "use server";
  if (!messages) {
    return { error: 'Messages are required.' };
  }
  const response = await OpenAI.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    user,
  });

  return response?.choices[0]?.message;
};

const Page = async ({ session }: any) => {

  return (
    <ChatSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
