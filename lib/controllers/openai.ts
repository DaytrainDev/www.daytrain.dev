import { NextRequest } from "next/server";
import OpenAI from "../services/openai";
import { ChatCompletionRequestMessage } from "openai-edge";

class AiController {
  public static async chatCompletionPost(request: NextRequest) {
    const requestBody = await request.json();
    const { messages, user } = requestBody;

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

  public static async chatCompletionGet(request: NextRequest) {
    const url = new URL(request.url);
    const queryParams = new URLSearchParams(url.search);
    
    const user = queryParams.get('user') ?? 'user';
    const messagesRaw = queryParams.get('messages');
    console.log(messagesRaw);
    if (!messagesRaw) {
      return new Response('Messages are required.', { status: 400 });
    }

    const messages: ChatCompletionRequestMessage[] = JSON.parse(messagesRaw);
    const response = await OpenAI.createChatCompletion({ 
      model: 'gpt-3.5-turbo',
      messages,
      user,
    });

    const responseData = await response.json();

    // return new Response(responseData.choices[0].message.content);

    return responseData?.choices[0]?.message;
  }
  
}

export default AiController;
