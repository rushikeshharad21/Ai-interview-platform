import { useEffect, useRef, useState } from "react";
import { Mic, Square, CheckCircle2, MicOff } from "lucide-react";
import Button from "../ui/Button.jsx";

const COUNTDOWN_SECONDS = 3;
const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

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
  const animationFrameRef = useRef(null);
  const volumeSamplesRef = useRef([]);
  const audioFrameCounterRef = useRef(0);

  const [barLevels, setBarLevels] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [audioFailed, setAudioFailed] = useState(false);

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
    if (phase !== "recording") return;

    startAudioAnalysis();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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

  const startAudioAnalysis = async () => {
    const AudioContextApi = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextApi) {
      setAudioFailed(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioContext = new AudioContextApi();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const barBinIndices = [1, 3, 5, 7, 9, 11, 13, 15];

      volumeSamplesRef.current = [];
      audioFrameCounterRef.current = 0;

      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);

        const newLevels = barBinIndices.map((binIndex) => dataArray[binIndex] / 255);
        setBarLevels(newLevels);

        audioFrameCounterRef.current += 1;
        if (audioFrameCounterRef.current % 6 === 0) {
          const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length / 255;
          volumeSamplesRef.current.push(averageVolume);
        }

        animationFrameRef.current = requestAnimationFrame(updateBars);
      };

      updateBars();
    } catch (err) {
      console.error("Failed to start audio analysis:", err);
      setAudioFailed(true);
    }
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

    setBarLevels([0, 0, 0, 0, 0, 0, 0, 0]);
    setPhase("stopped");
    onRecordingComplete(elapsedSeconds, finalTranscriptRef.current.trim());
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
        <WaveformBars barLevels={barLevels} />
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