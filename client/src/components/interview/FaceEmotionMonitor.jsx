import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Smile, VideoOff } from "lucide-react";

const MODEL_URL = "/models";
const DETECTION_INTERVAL_MS = 1000;

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.3,
});

const emotionLabels = {
  neutral: "Neutral",
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  fearful: "Nervous",
  disgusted: "Disgusted",
  surprised: "Surprised",
};

const getDominantEmotion = (expressions) => {
  const entries = Object.entries(expressions);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
};

const FaceEmotionMonitor = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsFailed, setModelsFailed] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelsLoading(false);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setModelsFailed(true);
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoading || modelsFailed) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to start camera for emotion monitor:", err);
        setCameraFailed(true);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [modelsLoading, modelsFailed]);

  useEffect(() => {
    if (modelsLoading || modelsFailed || cameraFailed) return;

    const runDetection = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const result = await faceapi
        .detectSingleFace(videoRef.current, DETECTOR_OPTIONS)
        .withFaceExpressions();

      if (result) {
        setFaceDetected(true);
        setCurrentEmotion(getDominantEmotion(result.expressions));
      } else {
        setFaceDetected(false);
      }
    };

    intervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [modelsLoading, modelsFailed, cameraFailed]);

  if (modelsFailed || cameraFailed) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-[var(--radius-control)] px-3 py-2">
        <VideoOff size={14} />
        Mood detection unavailable
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-[var(--color-surface)] rounded-[var(--radius-control)] p-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-16 h-16 rounded-[var(--radius-control)] object-cover bg-black"
      />
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-primary)]">
          <Smile size={14} className="text-[var(--color-accent)]" />
          {modelsLoading ? "Loading mood detection..." : "Live Mood"}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {modelsLoading
            ? "Please wait"
            : faceDetected
            ? emotionLabels[currentEmotion] || "Detecting..."
            : "No face detected"}
        </span>
      </div>
    </div>
  );
};

export default FaceEmotionMonitor;