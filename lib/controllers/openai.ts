import { NextRequest } from "next/server";
import OpenAI from "../services/openai";
import { ChatCompletionRequestMessage } from "openai-edge";

class AiController {
  public static async chatCompletionPost(request: NextRequest) {
    const requestBody = await request.json();
    const messages = requestBody?.messages;

    if (!messages) {
      return new Response('Messages are required.', { status: 400 });
    }

    const responseData = await OpenAI.createChatCompletion({ 
      model: 'gpt-3.5-turbo',
      messages,
     });

    return responseData;
  }

  public static async chatCompletionGet(request: NextRequest) {
    const url = new URL(request.url);
    const queryParams = new URLSearchParams(url.search);
    
    const messagesRaw = queryParams.get('messages');
    console.log(messagesRaw);
    if (!messagesRaw) {
      return new Response('Messages are required.', { status: 400 });
    }

    const messages: ChatCompletionRequestMessage[] = JSON.parse(messagesRaw);
    const responseData = await OpenAI.createChatCompletion({ 
      model: 'gpt-3.5-turbo',
      messages 
    });

    return responseData.json();

    // return new Response(responseData.choices[0].message.content);
  }
  
}

export default AiController;
