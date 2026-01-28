import OpenAI from "openai";
import aiConfig from "../config/ai";

const openAI = new OpenAI(aiConfig.openai);

export default openAI;
