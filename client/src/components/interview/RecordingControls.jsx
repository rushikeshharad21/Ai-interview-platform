import { useEffect, useRef, useState } from "react";
import { Mic, Square, CheckCircle2, MicOff } from "lucide-react";
import Button from "../ui/Button.jsx";

const COUNTDOWN_SECONDS = 3;
const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const WaveformBars = () => (
  <div className="flex items-center justify-center gap-1 h-10">
    {[0, 1, 2, 3, 4, 5, 6, 7].map((barIndex) => (
      <div
        key={barIndex}
        className="w-1 bg-[var(--color-accent)] rounded-full animate-pulse"
        style={{
          height: `${20 + (barIndex % 4) * 10}px`,
          animationDelay: `${barIndex * 100}ms`,
        }}
      ></div>
    ))}
  </div>
);

const formatElapsed = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const RecordingControls = ({ onRecordingComplete }) => {
  const [phase, setPhase] = useState("idle");
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const recordingActiveRef = useRef(false);

  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const volumeSamplesRef = useRef([]);
  const pitchSamplesRef = useRef([]);

  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdownValue === 0) {
      setPhase("recording");
      return;
    }

    const timerId = setTimeout(() => {
      setCountdownValue((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [phase, countdownValue]);

  useEffect(() => {
    if (phase !== "recording") return;

    const timerId = setTimeout(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [phase, elapsedSeconds]);

  useEffect(() => {
    if (phase !== "recording") return;

    startTranscription();

    return () => {
      recordingActiveRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "recording" || isMobileDevice) return;

    startVoiceAnalysis();

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [phase]);

  const trimOverlap = (existingText, newText) => {
    const existingWords = existingText.trim().split(/\s+/).filter(Boolean);
    const newWords = newText.trim().split(/\s+/).filter(Boolean);

    const maxOverlap = Math.min(existingWords.length, newWords.length, 10);

    for (let overlapLength = maxOverlap; overlapLength > 0; overlapLength--) {
      const existingTail = existingWords.slice(-overlapLength).join(" ").toLowerCase();
      const newHead = newWords.slice(0, overlapLength).join(" ").toLowerCase();

      if (existingTail === newHead) {
        return newWords.slice(overlapLength).join(" ");
      }
    }

    return newText;
  };

  const createRecognition = () => {
    const recognition = new SpeechRecognitionApi();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript.trim();

        if (event.results[i].isFinal) {
          if (transcriptPiece) {
            const trimmedPiece = trimOverlap(finalTranscriptRef.current, transcriptPiece);

            if (trimmedPiece) {
              finalTranscriptRef.current += `${trimmedPiece} `;
              setFinalTranscript(finalTranscriptRef.current);
            }
          }
        } else {
          interimText += transcriptPiece;
        }
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "no-speech" || event.error === "aborted") return;

      setTranscriptionFailed(true);
    };

    recognition.onend = () => {
      if (recordingActiveRef.current) {
        recognitionRef.current = createRecognition();
        recognitionRef.current.start();
      }
    };

    return recognition;
  };

  const estimatePitch = (buffer, sampleRate) => {
    const size = buffer.length;

    let energy = 0;
    for (let i = 0; i < size; i++) {
      energy += buffer[i] * buffer[i];
    }
    const rootMeanSquare = Math.sqrt(energy / size);

    if (rootMeanSquare < 0.01) return null;

    const minSamples = Math.floor(sampleRate / 400);
    const maxSamples = Math.floor(sampleRate / 75);

    let bestOffset = -1;
    let bestNormalizedCorrelation = 0;

    for (let offset = minSamples; offset <= maxSamples; offset++) {
      let correlation = 0;

      for (let i = 0; i < size - offset; i++) {
        correlation += buffer[i] * buffer[i + offset];
      }

      correlation = correlation / (size - offset);
      const normalizedCorrelation = correlation / (rootMeanSquare * rootMeanSquare);

      if (normalizedCorrelation > bestNormalizedCorrelation) {
        bestNormalizedCorrelation = normalizedCorrelation;
        bestOffset = offset;
      }
    }

    if (bestNormalizedCorrelation > 0.3 && bestOffset > 0) {
      return sampleRate / bestOffset;
    }

    return null;
  };

  const startVoiceAnalysis = async () => {
    try {
      const AudioContextApi = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextApi) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioContext = new AudioContextApi();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const timeDomainData = new Float32Array(analyser.fftSize);
      volumeSamplesRef.current = [];
      pitchSamplesRef.current = [];

      analysisIntervalRef.current = setInterval(() => {
        analyser.getFloatTimeDomainData(timeDomainData);

        const rms = Math.sqrt(
          timeDomainData.reduce((sum, value) => sum + value * value, 0) / timeDomainData.length
        );
        volumeSamplesRef.current.push(rms);

        if (rms > 0.01) {
          const pitch = estimatePitch(timeDomainData, audioContext.sampleRate);
          if (pitch) {
            pitchSamplesRef.current.push(pitch);
          }
        }
      }, 200);
    } catch (err) {
      console.error("Voice analysis unavailable:", err);
    }
  };

  const computeVoiceMetrics = () => {
    const volumeSamples = volumeSamplesRef.current;
    const pitchSamples = pitchSamplesRef.current;

    if (volumeSamples.length === 0) return null;

    const silentFrames = volumeSamples.filter((sample) => sample < 0.01).length;
    const speakingRatio = 1 - silentFrames / volumeSamples.length;

    let averagePitch = null;
    let pitchVariation = null;

    if (pitchSamples.length > 0) {
      averagePitch = pitchSamples.reduce((sum, pitch) => sum + pitch, 0) / pitchSamples.length;
      const variance =
        pitchSamples.reduce((sum, pitch) => sum + (pitch - averagePitch) ** 2, 0) / pitchSamples.length;
      pitchVariation = Math.sqrt(variance);
    }

    return {
      speakingRatio: Number(speakingRatio.toFixed(2)),
      averagePitch: averagePitch ? Math.round(averagePitch) : null,
      pitchVariation: pitchVariation ? Math.round(pitchVariation) : null,
    };
  };

  const startTranscription = () => {
    if (!SpeechRecognitionApi) {
      setTranscriptionFailed(true);
      return;
    }

    finalTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setTranscriptionFailed(false);
    recordingActiveRef.current = true;
    recognitionRef.current = createRecognition();
    recognitionRef.current.start();
  };

  const startRecording = () => {
    setPhase("countdown");
    setCountdownValue(COUNTDOWN_SECONDS);
    setElapsedSeconds(0);
  };

  const stopRecording = () => {
    recordingActiveRef.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const voiceMetrics = computeVoiceMetrics();

    setPhase("stopped");
    onRecordingComplete(elapsedSeconds, finalTranscriptRef.current.trim(), voiceMetrics);
  };

  if (phase === "idle") {
    return (
      <Button onClick={startRecording} className="w-full">
        <Mic size={18} className="mr-2" />
        Start Recording
      </Button>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-3xl font-semibold text-[var(--color-accent)]">
          {countdownValue === 0 ? "Starting..." : countdownValue}
        </span>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="space-y-3">
        <WaveformBars />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-[var(--color-error)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-error)] animate-pulse"></span>
            Recording in progress — {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        {transcriptionFailed ? (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-[var(--radius-control)] px-3 py-2">
            <MicOff size={14} />
            Live transcript unavailable
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-control)] p-3 max-h-24 overflow-y-auto">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {finalTranscript}
              <span className="text-[var(--color-text-primary)]">{interimTranscript}</span>
              {!finalTranscript && !interimTranscript && "Listening..."}
            </p>
          </div>
        )}

        <Button onClick={stopRecording} className="w-full bg-[var(--color-error)] hover:bg-red-700">
          <Square size={16} className="mr-2" />
          Stop Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 py-3 text-[var(--color-success)]">
        <CheckCircle2 size={20} />
        <span className="text-sm font-medium">Recording completed ({formatElapsed(elapsedSeconds)})</span>
      </div>

      {transcriptionFailed ? (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-[var(--radius-control)] px-3 py-2">
          <MicOff size={14} />
          Live transcript unavailable
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-control)] p-3 max-h-24 overflow-y-auto">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {finalTranscriptRef.current.trim() || "No speech detected"}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;