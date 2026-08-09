const EMOTION_APPROPRIATENESS_SCORES = {
  neutral: 7,
  happy: 8,
  surprised: 5,
  sad: 3,
  fearful: 2,
  angry: 2,
  disgusted: 2,
};

const DEFAULT_EMOTION_SCORE = 5;

export const calculateEmotionScore = (emotionTrend) => {
  if (!emotionTrend || emotionTrend.length === 0) {
    return null;
  }

  const totalScore = emotionTrend.reduce((sum, sample) => {
    const emotionKey = sample.emotion.toLowerCase();
    const score = EMOTION_APPROPRIATENESS_SCORES[emotionKey] ?? DEFAULT_EMOTION_SCORE;
    return sum + score;
  }, 0);

  return Math.round((totalScore / emotionTrend.length) * 100) / 100;
};

const scoreWithinRange = (value, idealMin, idealMax, hardMin, hardMax) => {
  if (value >= idealMin && value <= idealMax) {
    return 10;
  }

  if (value < idealMin) {
    if (value <= hardMin) {
      return 0;
    }
    return ((value - hardMin) / (idealMin - hardMin)) * 10;
  }

  if (value >= hardMax) {
    return 0;
  }
  return ((hardMax - value) / (hardMax - idealMax)) * 10;
};

export const calculateVoiceScore = ({ speakingRatio, pitchVariation }) => {
  if (speakingRatio === null || speakingRatio === undefined) {
    return null;
  }

  const speakingRatioScore = scoreWithinRange(speakingRatio, 0.4, 0.85, 0, 1);
  const pitchVariationScore = scoreWithinRange(pitchVariation ?? 0, 20, 60, 0, 100);

  const combinedScore = speakingRatioScore * 0.6 + pitchVariationScore * 0.4;

  return Math.round(combinedScore * 100) / 100;
};

export const calculateCompositeScore = (components) => {
  const availableComponents = components.filter(
    (component) => component.score !== null && component.score !== undefined
  );

  if (availableComponents.length === 0) {
    return null;
  }

  const totalWeight = availableComponents.reduce(
    (sum, component) => sum + component.weight,
    0
  );

  const weightedAverage = availableComponents.reduce((sum, component) => {
    const normalizedWeight = component.weight / totalWeight;
    return sum + component.score * normalizedWeight;
  }, 0);

  return Math.round(weightedAverage * 10 * 100) / 100;
};