"use server";
import { ChatSession } from "@/lib/components/chat";
import OpenAI from "@/lib/services/openai";
import { ChatCompletionRequestMessage } from "openai-edge";

const Page = ({ session }: any) => {
  "use server";

  const handleSubmit = async (
    messages: ChatCompletionRequestMessage[], user: string
  ) => {
    "use server";
    if (!messages) {
      return { error: 'Messages are required.' };
    }
  
    const response = await OpenAI.createChatCompletion({ 
      model: 'gpt-3.5-turbo',
      messages,
      user,
    });
    const responseData = await response.json();

    return responseData?.choices[0]?.message;
  };

  return (
    <ChatSession session={session} handleSubmit={handleSubmit} />
  );
}
export default Page;
