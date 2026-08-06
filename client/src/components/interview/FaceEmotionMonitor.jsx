import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Smile, VideoOff } from "lucide-react";

const MODEL_URL = "/models";
const DETECTION_INTERVAL_MS = 1500;

const DEBUG_DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.01,
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
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const detectionInProgressRef = useRef(false);

  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsFailed, setModelsFailed] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [debugInfo, setDebugInfo] = useState("Starting...");

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setDebugInfo(`Models loaded. Backend: ${faceapi.tf.getBackend()}`);
        setModelsLoading(false);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setDebugInfo(`Model load failed: ${err.message}`);
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
      if (detectionInProgressRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4 || video.videoWidth === 0) {
        setDebugInfo(
          `Waiting for video. readyState=${video?.readyState}, width=${video?.videoWidth}`
        );
        return;
      }

      detectionInProgressRef.current = true;

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const allResults = await faceapi
          .detectAllFaces(canvas, DEBUG_DETECTOR_OPTIONS)
          .withFaceExpressions();

        if (allResults.length > 0) {
          const best = allResults.sort((a, b) => b.detection.score - a.detection.score)[0];
          setDebugInfo(
            `Faces found: ${allResults.length}, best score: ${best.detection.score.toFixed(3)}, video: ${video.videoWidth}x${video.videoHeight}`
          );
          setFaceDetected(true);
          setCurrentEmotion(getDominantEmotion(best.expressions));
        } else {
          setDebugInfo(
            `Faces found: 0, video: ${video.videoWidth}x${video.videoHeight}, canvas: ${canvas.width}x${canvas.height}`
          );
          setFaceDetected(false);
        }
      } catch (err) {
        console.error("Face detection error:", err);
        setDebugInfo(`Detection threw error: ${err.message}`);
      } finally {
        detectionInProgressRef.current = false;
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
    <div className="flex flex-col gap-2 bg-[var(--color-surface)] rounded-[var(--radius-control)] p-2">
      <div className="flex items-center gap-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-16 h-16 rounded-[var(--radius-control)] object-cover bg-black"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
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
      <p className="text-[10px] text-[var(--color-text-secondary)] break-words border-t border-[var(--color-border)] pt-1">
        DEBUG: {debugInfo}
      </p>
    </div>
  );
};

export default FaceEmotionMonitor;