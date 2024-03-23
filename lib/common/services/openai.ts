import {
  OpenAIStream as _OpenAIStream,
  StreamingTextResponse as _StreamingTextResponse,
} from "ai";
import { Configuration, OpenAIApi } from "openai-edge";
import aiConfig from "../configs/ai";
// https://vercel.com/blog/introducing-the-vercel-ai-sdk

const OpenAI = new OpenAIApi(new Configuration(aiConfig.openai));

export const runtime = "edge";
export const OpenAiStream = _OpenAIStream;
export const StreamingTextResponse = _StreamingTextResponse;
export default OpenAI;
