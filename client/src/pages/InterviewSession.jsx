import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import QuestionTimer from "../components/interview/QuestionTimer.jsx";
import RecordingControls from "../components/interview/RecordingControls.jsx";
import FaceEmotionMonitor from "../components/interview/FaceEmotionMonitor.jsx";
import { getInterviewById } from "../lib/interviewApi.js";

const QUESTION_DURATION_SECONDS = 90;

const InterviewSession = () => {
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState(false);

  const fetchInterview = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const data = await getInterviewById(id);
      setInterview(data);
    } catch (err) {
      if (!err.response) {
        setFetchError("Network error. Please check your connection and try again.");
      } else if (err.response.status === 404) {
        setFetchError("This interview could not be found.");
      } else {
        setFetchError("Could not load interview details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const questions = interview?.questions || [];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const goToNextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setHasRecordedCurrent(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRecordingComplete = (durationSeconds) => {
    setHasRecordedCurrent(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-4 w-32 bg-[var(--color-surface)] rounded animate-pulse"></div>
        <Card>
          <div className="h-4 w-24 bg-[var(--color-surface)] rounded animate-pulse mb-6"></div>
          <div className="h-6 w-full bg-[var(--color-surface)] rounded animate-pulse mb-3"></div>
          <div className="h-6 w-2/3 bg-[var(--color-surface)] rounded animate-pulse mb-6"></div>
          <div className="h-32 w-full bg-[var(--color-surface)] rounded-[var(--radius-control)] animate-pulse"></div>
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
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">{fetchError}</p>
            <Button onClick={fetchInterview} className="mt-2">Try again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (totalQuestions === 0) {
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
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
              <AlertCircle size={24} className="text-[var(--color-text-secondary)]" />
            </div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Questions Not Ready Yet
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              The recruiter has not generated interview questions for this session yet. Please check back later.
            </p>
            <Link to="/interviews">
              <Button className="mt-2">Back to Interviews</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="text-center py-10">
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Interview Completed
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            You have answered all the questions, thank you
          </p>
          <Link to="/interviews">
            <Button>Back to Interviews</Button>
          </Link>
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
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Question {currentIndex + 1} / {totalQuestions}
          </span>
          <QuestionTimer
            key={currentIndex}
            durationSeconds={QUESTION_DURATION_SECONDS}
            onExpire={goToNextQuestion}
            resetKey={currentIndex}
          />
        </div>

        <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="text-lg text-[var(--color-text-primary)] leading-relaxed mb-6">
          {questions[currentIndex]}
        </p>

        <div className="mb-4">
          <FaceEmotionMonitor />
        </div>

        <div className="mb-4">
          <RecordingControls key={currentIndex} onRecordingComplete={handleRecordingComplete} />
        </div>

        {hasRecordedCurrent && (
          <Button onClick={goToNextQuestion} className="w-full">
            {currentIndex + 1 < totalQuestions ? "Next Question" : "Finish Interview"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default InterviewSession;