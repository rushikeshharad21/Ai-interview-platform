import { GoogleGenAI } from "@google/genai";

let aiInstance = null;

const getAiClient = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
};

export const generateContent = async (prompt) => {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });

  return response.text;
};

export const scoreAnswerContent = async (questionText, transcript) => {
  const answerText = transcript && transcript.trim().length > 0
    ? transcript
    : "No answer was recorded.";

  const prompt = `You are evaluating a candidate's answer in a job interview.

Question: "${questionText}"

Candidate's transcribed answer: "${answerText}"

Score the answer's relevance, clarity, and completeness on a scale of 0 to 10, where 0 means no relevant answer was given and 10 means an excellent, complete, well-structured answer.

Respond with ONLY a JSON object in this exact format, no markdown formatting, no code fences, no extra text:
{"score": <number 0-10>, "feedback": "<one or two sentence feedback>"}`;

  const rawResponse = await generateContent(prompt);
  const cleanedResponse = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(cleanedResponse);
  } catch (parseError) {
    throw new Error("Failed to parse Gemini scoring response as JSON");
  }

  const score = Number(parsedResponse.score);
  const feedback = String(parsedResponse.feedback || "");

  if (Number.isNaN(score) || score < 0 || score > 10) {
    throw new Error("Gemini returned an invalid score value");
  }

  return { score, feedback };
};