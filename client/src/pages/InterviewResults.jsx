import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, User, Briefcase } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ScoreRadarChart from "../components/interview/ScoreRadarChart.jsx";
import { getInterviewAnswers } from "../lib/interviewApi.js";

const getScoreColor = (score) => {
  if (score === null || score === undefined) return "text-[var(--color-text-secondary)]";
  if (score >= 7) return "text-[var(--color-success)]";
  if (score >= 4) return "text-[var(--color-warning)]";
  return "text-[var(--color-error)]";
};

const getScoreLabel = (score) => {
  if (score === null || score === undefined) return "";
  if (score >= 7) return "Strong performance";
  if (score >= 4) return "Needs improvement";
  return "Significant gaps";
};

const formatScore = (score) => {
  return score === null || score === undefined ? "N/A" : score.toFixed(1);
};

const average = (values) => {
  const validValues = values.filter((value) => value !== null && value !== undefined);
  if (validValues.length === 0) return null;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const InterviewResults = () => {
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const data = await getInterviewAnswers(id);
      setInterview(data.interview);
      setAnswers(data.answers);
    } catch (err) {
      if (!err.response) {
        setFetchError("Network error. Please check your connection and try again.");
      } else if (err.response.status === 404) {
        setFetchError("This interview could not be found.");
      } else {
        setFetchError("Could not load interview results. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [id]);

  const averageCompositeScore = average(answers.map((answer) => answer.compositeScore));
  const contentAvg = average(answers.map((answer) => answer.contentScore));
  const emotionAvg = average(answers.map((answer) => answer.emotionScore));
  const voiceAvg = average(answers.map((answer) => answer.voiceScore));

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-4 w-32 bg-[var(--color-surface)] rounded animate-pulse"></div>
        <Card className="animate-pulse">
          <div className="h-5 w-1/2 bg-[var(--color-surface)] rounded mb-3"></div>
          <div className="h-4 w-1/3 bg-[var(--color-surface)] rounded mb-6"></div>
          <div className="h-40 w-full bg-[var(--color-surface)] rounded-[var(--radius-control)]"></div>
        </Card>
        {[1, 2, 3].map((placeholder) => (
          <Card key={placeholder} className="animate-pulse">
            <div className="h-4 w-3/4 bg-[var(--color-surface)] rounded mb-3"></div>
            <div className="h-3 w-full bg-[var(--color-surface)] rounded mb-2"></div>
            <div className="h-3 w-2/3 bg-[var(--color-surface)] rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link
          to="/interviews/manage"
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
              Unable to Load Results
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">{fetchError}</p>
            <Button onClick={fetchResults} className="mt-2">Try again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        to="/interviews/manage"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft size={16} />
        Back to Interviews
      </Link>

      <Card>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
            <Briefcase size={18} className="text-[var(--color-accent)]" />
            {interview?.job?.title || "Interview Results"}
          </div>
        </div>

        {interview?.candidate?.name && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-4">
            <User size={16} />
            {interview.candidate.name}
          </div>
        )}

        {answers.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6 items-center pt-4 border-t border-[var(--color-border)]">
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Overall Score</p>
              <div className={`text-4xl font-semibold ${getScoreColor(averageCompositeScore / 10)}`}>
                {Math.round(averageCompositeScore)}
                <span className="text-base text-[var(--color-text-secondary)] font-normal">/100</span>
              </div>
              <p className={`text-xs mt-1 ${getScoreColor(averageCompositeScore / 10)}`}>
                {getScoreLabel(averageCompositeScore / 10)}
              </p>
            </div>

            <ScoreRadarChart contentAvg={contentAvg} emotionAvg={emotionAvg} voiceAvg={voiceAvg} />
          </div>
        )}
      </Card>

      {answers.length === 0 ? (
        <Card>
          <p className="text-[var(--color-text-secondary)]">No answers recorded for this interview yet</p>
        </Card>
      ) : (
        answers.map((answer) => (
          <Card key={answer._id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-text-primary)] flex-1">
                {answer.questionText}
              </p>
              {answer.compositeScore !== null && answer.compositeScore !== undefined && (
                <span className={`text-lg font-semibold shrink-0 ${getScoreColor(answer.compositeScore / 10)}`}>
                  {Math.round(answer.compositeScore)}
                </span>
              )}
            </div>

            {answer.transcript && (
              <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] rounded-[var(--radius-control)] p-3">
                {answer.transcript}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">Content</p>
                <p className={`text-sm font-medium ${getScoreColor(answer.contentScore)}`}>
                  {formatScore(answer.contentScore)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">Emotion</p>
                <p className={`text-sm font-medium ${getScoreColor(answer.emotionScore)}`}>
                  {formatScore(answer.emotionScore)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">Voice</p>
                <p className={`text-sm font-medium ${getScoreColor(answer.voiceScore)}`}>
                  {formatScore(answer.voiceScore)}
                </p>
              </div>
            </div>

            {answer.contentFeedback && (
              <p className="text-xs text-[var(--color-text-secondary)] italic">
                {answer.contentFeedback}
              </p>
            )}

            {answer.dominantEmotion && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Dominant emotion: <span className="capitalize">{answer.dominantEmotion}</span>
              </p>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default InterviewResults;