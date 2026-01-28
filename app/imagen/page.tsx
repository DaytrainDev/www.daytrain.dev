"use server";
import { ImaGenSession } from "@/lib/components/views/imaGen";
import OpenAI from "@/lib/services/openai";
import { getServerSession } from "next-auth";

interface ImageResult {
  url?: string;
  revised_prompt?: string;
  error?: string;
}

const handleSubmit = async (
  prompt: string,
  user: string,
  size?: "256x256" | "512x512" | "1024x1024",
  n?: number
): Promise<ImageResult> => {
  "use server";

  if (!prompt || prompt.trim().length === 0) {
    return { error: "Prompt is required" };
  }

  try {
    const response = await OpenAI.images.generate({
      prompt: prompt.trim(),
      n: n ?? 1,
      size: size ?? "512x512",
      user: user,
    });

    const image = response.data?.[0];

    if (!image?.url) {
      return { error: "No image was generated" };
    }

    return {
      url: image.url,
      revised_prompt: image.revised_prompt,
    };
  } catch (err) {
    console.error("[Imagen] Error:", err);

    if (err instanceof Error) {
      if (err.message.includes("content_policy_violation")) {
        return {
          error:
            "Your request was rejected due to content policy. Please try a different prompt.",
        };
      }
      if (err.message.includes("rate_limit")) {
        return { error: "Rate limit exceeded. Please try again later." };
      }
    }

    return { error: "Failed to generate image. Please try again." };
  }
};

const Page = async () => {
  const session = await getServerSession();

  return <ImaGenSession session={session} handleSubmit={handleSubmit} />;
};

export default Page;
