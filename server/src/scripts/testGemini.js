import "dotenv/config";
import { generateContent } from "../services/geminiService.js";

const runTest = async () => {
  try {
    const response = await generateContent("Say hello in one short sentence.");
    console.log("Gemini responded:", response);
  } catch (error) {
    console.error("Gemini test failed:", error.message);
  }
};

runTest();