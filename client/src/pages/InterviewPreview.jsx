import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Video, Mic, AlertCircle, ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { getInterviewById } from "../lib/interviewApi.js";

const InterviewPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(true);

  const [permissionStatus, setPermissionStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [micLevel, setMicLevel] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterviewById(id);
        setInterview(data);
      } catch (err) {
        setErrorMessage("Could not fetch interview details");
      } finally {
        setLoadingInterview(false);
      }
    };

    fetchInterview();
  }, [id]);

  const startMicLevelMeter = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    audioContextRef.current = audioContext;

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const requestPermissions = async () => {
    setPermissionStatus("requesting");
    setErrorMessage("");

    try {
      const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      initialStream.getTracks().forEach((track) => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const iriunCamera = devices.find(
        (device) => device.kind === "videoinput" && device.label.toLowerCase().includes("iriun")
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: iriunCamera ? { deviceId: { exact: iriunCamera.deviceId } } : true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      startMicLevelMeter(stream);
      setPermissionStatus("granted");
    } catch (err) {
      console.error("getUserMedia error:", err.name, err.message);
      setPermissionStatus("denied");

      if (err.name === "NotAllowedError") {
        setErrorMessage("Camera or microphone permission was denied.");
      } else if (err.name === "NotReadableError") {
        setErrorMessage("Camera is already in use by another app/tab. Close other apps/tabs and try again.");
      } else if (err.name === "NotFoundError") {
        setErrorMessage("No camera or microphone found.");
      } else {
        setErrorMessage("Could not start camera/microphone: " + err.message);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        to="/interviews"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft size={16} />
        Back to Interviews
      </Link>

      <Card>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
          Before Starting the Interview
        </h1>
        {!loadingInterview && interview && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {interview.job?.title}
          </p>
        )}

        <div className="aspect-video bg-[var(--color-surface)] rounded-[var(--radius-control)] flex items-center justify-center overflow-hidden mb-4">
          {permissionStatus === "granted" ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]">
              <Video size={32} />
              <p className="text-sm">Camera preview will appear here</p>
            </div>
          )}
        </div>

        {permissionStatus === "granted" && (
          <div className="flex items-center gap-3 mb-4">
            <Mic size={18} className="text-[var(--color-text-secondary)]" />
            <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-success)] transition-all duration-100"
                style={{ width: `${micLevel}%` }}
              ></div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3 mb-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {permissionStatus !== "granted" ? (
          <Button
            onClick={requestPermissions}
            disabled={permissionStatus === "requesting"}
            className="w-full"
          >
            {permissionStatus === "requesting" ? "Requesting permission..." : "Allow Camera and Microphone"}
          </Button>
        ) : (
          <Button onClick={() => navigate(`/interviews/${id}/session`)} className="w-full">
            Continue to Interview
          </Button>
        )}
      </Card>
    </div>
  );
};

export default InterviewPreview;