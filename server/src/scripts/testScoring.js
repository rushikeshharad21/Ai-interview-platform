import "dotenv/config";
import { scoreAnswerContent } from "../services/geminiService.js";
import {
  calculateEmotionScore,
  calculateVoiceScore,
  calculateCompositeScore,
} from "../utils/scoring.js";

const run = async () => {
  const result = await scoreAnswerContent(
    "Tell me about a time you handled a difficult team conflict.",
    "In my previous role, a teammate and I disagreed on the technical approach for a feature. I set up a one-on-one call, listened to their concerns, and we ended up combining both ideas into a better solution."
  );

  console.log("Content score result:", result);

  const sampleEmotionTrend = [
    { emotion: "neutral" },
    { emotion: "neutral" },
    { emotion: "happy" },
    { emotion: "fearful" },
    { emotion: "neutral" },
  ];

  const emotionScore = calculateEmotionScore(sampleEmotionTrend);
  console.log("Emotion score:", emotionScore);

  const desktopVoiceMetrics = {
    speakingRatio: 0.62,
    averagePitch: 180,
    pitchVariation: 35,
  };

  const voiceScoreDesktop = calculateVoiceScore(desktopVoiceMetrics);
  console.log("Voice score (good desktop sample):", voiceScoreDesktop);

  const poorVoiceMetrics = {
    speakingRatio: 0.15,
    averagePitch: 150,
    pitchVariation: 5,
  };

  const voiceScorePoor = calculateVoiceScore(poorVoiceMetrics);
  console.log("Voice score (low speaking ratio, monotone):", voiceScorePoor);

  const mobileVoiceMetrics = {
    speakingRatio: null,
    averagePitch: null,
    pitchVariation: null,
  };

  const voiceScoreMobile = calculateVoiceScore(mobileVoiceMetrics);
  console.log("Voice score (mobile, null metrics):", voiceScoreMobile);

  const compositeDesktop = calculateCompositeScore([
    { score: result.score, weight: 0.6 },
    { score: emotionScore, weight: 0.25 },
    { score: voiceScoreDesktop, weight: 0.15 },
  ]);

  console.log("Composite score (desktop candidate):", compositeDesktop);

  const compositeMobile = calculateCompositeScore([
    { score: result.score, weight: 0.6 },
    { score: emotionScore, weight: 0.25 },
    { score: voiceScoreMobile, weight: 0.15 },
  ]);

  console.log("Composite score (mobile candidate, voice excluded):", compositeMobile);
};

run();