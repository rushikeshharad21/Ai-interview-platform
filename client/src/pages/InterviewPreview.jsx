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
  const [fetchError, setFetchError] = useState("");

  const [permissionStatus, setPermissionStatus] = useState("idle");
  const [permissionError, setPermissionError] = useState("");
  const [micLevel, setMicLevel] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      setLoadingInterview(true);
      setFetchError("");

      try {
        const data = await getInterviewById(id);
        setInterview(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setFetchError("This interview could not be found. It may have been cancelled or the link is incorrect.");
        } else if (err.response?.status === 403) {
          setFetchError("You do not have permission to view this interview.");
        } else {
          setFetchError("Could not load interview details. Please check your connection and try again.");
        }
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
    setPermissionError("");

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
      startMicLevelMeter(stream);
      setPermissionStatus("granted");
    } catch (err) {
      console.error("getUserMedia error:", err.name, err.message);
      setPermissionStatus("denied");

      if (err.name === "NotAllowedError") {
        setPermissionError("Camera or microphone permission was denied.");
      } else if (err.name === "NotReadableError") {
        setPermissionError("Camera is already in use by another app/tab. Close other apps/tabs and try again.");
      } else if (err.name === "NotFoundError") {
        setPermissionError("No camera or microphone found.");
      } else {
        setPermissionError("Could not start camera/microphone: " + err.message);
      }
    }
  };

  useEffect(() => {
    if (permissionStatus === "granted" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permissionStatus]);

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

  if (loadingInterview) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-4 w-32 bg-[var(--color-surface)] rounded animate-pulse"></div>

        <Card>
          <div className="h-6 w-64 bg-[var(--color-surface)] rounded animate-pulse mb-2"></div>
          <div className="h-4 w-40 bg-[var(--color-surface)] rounded animate-pulse mb-4"></div>

          <div className="aspect-video bg-[var(--color-surface)] rounded-[var(--radius-control)] animate-pulse mb-4"></div>

          <div className="h-11 w-full bg-[var(--color-surface)] rounded-[var(--radius-control)] animate-pulse"></div>
        </Card>
      </div>
    );
  }

  if (fetchError) {
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
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={24} className="text-[var(--color-error)]" />
            </div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Unable to Load Interview
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              {fetchError}
            </p>
            <Link to="/interviews">
              <Button className="mt-2">Back to Interviews</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

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
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {interview.job?.title}
        </p>

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

        {permissionError && (
          <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3 mb-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{permissionError}</p>
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