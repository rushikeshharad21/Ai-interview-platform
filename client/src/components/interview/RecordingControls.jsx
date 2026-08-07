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

  const lastFinalPieceRef = useRef("");

  const createRecognition = () => {
    const recognition = new SpeechRecognitionApi();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript.trim();

        if (event.results[i].isFinal) {
          if (transcriptPiece && transcriptPiece !== lastFinalPieceRef.current) {
            finalTranscriptRef.current += `${transcriptPiece} `;
            setFinalTranscript(finalTranscriptRef.current);
            lastFinalPieceRef.current = transcriptPiece;
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

  const startTranscription = () => {
    if (!SpeechRecognitionApi) {
      setTranscriptionFailed(true);
      return;
    }

    finalTranscriptRef.current = "";
    lastFinalPieceRef.current = "";
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
    <div className="flex items-center justify-center gap-2 py-3 text-[var(--color-success)]">
      <CheckCircle2 size={20} />
      <span className="text-sm font-medium">Recording completed ({formatElapsed(elapsedSeconds)})</span>
    </div>
  );
};

export default RecordingControls;