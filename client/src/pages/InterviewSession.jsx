import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import QuestionTimer from "../components/interview/QuestionTimer.jsx";
import RecordingControls from "../components/interview/RecordingControls.jsx";

const dummyQuestions = [
  "Tell me briefly about yourself and your technical background.",
  "Describe a difficult technical problem you solved recently.",
  "Explain the difference between REST API and GraphQL.",
  "How do you handle disagreements while working in a team?",
  "Where do you see yourself in the next 2 years?",
];

const QUESTION_DURATION_SECONDS = 90;

const InterviewSession = () => {
  const { id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState(false);

  const totalQuestions = dummyQuestions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

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
          {dummyQuestions[currentIndex]}
        </p>

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