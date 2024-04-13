import { NextRequest } from "next/server";
import OpenAI from "../services/openai";
import { ChatCompletionRequestMessage, CreateImageRequestSizeEnum } from "openai-edge";

class AiController {
  public static async imagine(data: any) {
    const response = await OpenAI.createImage({
      prompt: data.prompt,
      n: data.n ?? 1,
      size: data.size ?? CreateImageRequestSizeEnum._512x512,
      user: data.user,
      // response_format?: CreateImageRequestResponseFormatEnum;
    });
    return response;
  }

  public static async chat(data: any) {
    const { messages, user } = data;

    if (!messages) {
      return new Response('Messages are required.', { status: 400 });
    }

    console.log(messages);
    const response = await OpenAI.createChatCompletion({ 
      model: 'gpt-3.5-turbo',
      messages,
      user,
    });

    const responseData = await response.json();

    return responseData?.choices[0]?.message;
  }
}

export default AiController;
