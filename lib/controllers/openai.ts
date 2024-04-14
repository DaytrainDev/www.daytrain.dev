import { NextRequest } from "next/server";
import OpenAI from "../services/openai";
import { CreateImageRequestSizeEnum } from "openai-edge";

class AiController {
  public static async imagen(data: any) {
    const { prompt, n, size, user } = data;
    const response = await OpenAI.createImage({
      prompt: prompt,
      n: n ?? 1,
      size: size ?? CreateImageRequestSizeEnum._512x512,
      user: user,
      // response_format?: CreateImageRequestResponseFormatEnum;
    });
    const responseData = await response.json();

    return responseData?.data[0];
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
