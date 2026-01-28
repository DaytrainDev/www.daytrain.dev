"use server";
import { ChatSession } from "@/lib/components/views/chat";
import OpenAI from "@/lib/services/openai";
import { getServerSession } from "next-auth";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  role?: string;
  content?: string;
  error?: string;
}

const SYSTEM_PROMPT = process.env.OPENAI_BASE_PROMPT || 'You are a helpful assistant.';

const handleSubmit = async (
  messages: ChatMessage[],
  user: string
): Promise<ChatResponse> => {
  "use server";

  if (!messages || messages.length === 0) {
    return { error: "Messages are required." };
  }

  // Prepend system message if not already present
  const messagesWithSystem: ChatMessage[] =
    messages[0]?.role === "system"
      ? messages
      : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  try {
    const response = await OpenAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesWithSystem,
      user,
      max_tokens: 1000,
    });

    const message = response.choices?.[0]?.message;

    if (!message?.content) {
      return { error: "No response generated" };
    }

    return {
      role: "assistant",
      content: message.content,
    };
  } catch (err) {
    console.error("[Chat] Error:", err);

    if (err instanceof Error) {
      if (err.message.includes("context_length_exceeded")) {
        return { error: "Conversation too long. Please start a new chat." };
      }
      if (err.message.includes("rate_limit")) {
        return { error: "Rate limit exceeded. Please try again later." };
      }
    }

    return { error: "Failed to get response. Please try again." };
  }
};

const Page = async () => {
  const session = await getServerSession();

  return <ChatSession session={session} handleSubmit={handleSubmit} />;
};

export default Page;
