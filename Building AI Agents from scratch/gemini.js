import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({GEMINI_API_KEY});

export async function callGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let output = response.text;

  output = output.replaceAll("`","");
  output = output.replaceAll("json","");

  return JSON.parse(output);
}