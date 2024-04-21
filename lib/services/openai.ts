// import {
//   OpenAIStream as _OpenAIStream,
//   StreamingTextResponse as _StreamingTextResponse,
// } from "ai";
import OpenAI from "openai";
import aiConfig from "../config/ai";
// https://vercel.com/blog/introducing-the-vercel-ai-sdk

const openAI = new OpenAI(aiConfig.openai);

// export const OpenAiStream = _OpenAIStream;
// export const StreamingTextResponse = _StreamingTextResponse;
export default openAI;
