import { useEffect, useState } from "react";
import { Calendar, Clock, User, Briefcase, Sparkles, RefreshCw, Pencil, Check, X, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { getMyInterviewsAsRecruiter, generateQuestions, updateQuestions } from "../lib/interviewApi.js";
import { Link } from "react-router-dom";

const formatScheduledAt = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [errorByInterview, setErrorByInterview] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchInterviews = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const data = await getMyInterviewsAsRecruiter();
      setInterviews(data);
    } catch (err) {
      if (!err.response) {
        setFetchError("Network error. Please check your connection and try again.");
      } else {
        setFetchError("Could not load interviews. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleGenerateQuestions = async (interviewId) => {
    setGeneratingId(interviewId);
    setErrorByInterview((prev) => ({ ...prev, [interviewId]: "" }));

    try {
      const data = await generateQuestions(interviewId);
      setInterviews((prev) =>
        prev.map((interview) =>
          interview._id === interviewId ? { ...interview, questions: data.questions } : interview
        )
      );
    } catch (err) {
      setErrorByInterview((prev) => ({
        ...prev,
        [interviewId]: "Could not generate questions, please try again",
      }));
    } finally {
      setGeneratingId(null);
    }
  };

  const startEditing = (interview) => {
    setEditingId(interview._id);
    setEditedQuestions([...interview.questions]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedQuestions([]);
  };

  const handleQuestionTextChange = (index, value) => {
    setEditedQuestions((prev) => prev.map((question, i) => (i === index ? value : question)));
  };

  const saveEditedQuestions = async (interviewId) => {
    setSavingEdit(true);
    setErrorByInterview((prev) => ({ ...prev, [interviewId]: "" }));

    try {
      const data = await updateQuestions(interviewId, editedQuestions);
      setInterviews((prev) =>
        prev.map((interview) =>
          interview._id === interviewId ? { ...interview, questions: data.questions } : interview
        )
      );
      setEditingId(null);
      setEditedQuestions([]);
    } catch (err) {
      setErrorByInterview((prev) => ({
        ...prev,
        [interviewId]: "Could not save changes, please try again",
      }));
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((placeholder) => (
          <Card key={placeholder} className="animate-pulse">
            <div className="h-4 w-2/3 bg-[var(--color-border)] rounded mb-3"></div>
            <div className="h-3 w-1/2 bg-[var(--color-border)] rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-8 gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-[var(--color-error)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-sm">{fetchError}</p>
          <Button onClick={fetchInterviews} className="mt-2">Try again</Button>
        </div>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <p className="text-[var(--color-text-secondary)]">No interviews scheduled yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Scheduled Interviews</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {interviews.map((interview) => {
          const isEditing = editingId === interview._id;
          const isGenerating = generatingId === interview._id;

          return (
            <Card key={interview._id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                  <Briefcase size={18} className="text-[var(--color-accent)]" />
                  {interview.job?.title}
                </div>
                <StatusBadge status={interview.status} />
                <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                  <Briefcase size={18} className="text-[var(--color-accent)]" />
                  {interview.job?.title}
                </div>
                <StatusBadge status={interview.status} />
              </div>

              {interview.status === "completed" && (
                <Link
                  to={`/interviews/${interview._id}/results`}
                  className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium"
                >
                  View Results →
                </Link>
              )}
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Calendar size={16} />
                {formatScheduledAt(interview.scheduledAt)}
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Clock size={16} />
                {interview.duration} minutes
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <User size={16} />
                {interview.candidate?.name}
              </div>

              {interview.questions && interview.questions.length > 0 ? (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      Generated Questions
                    </p>
                    {!isEditing && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEditing(interview)}
                          className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleGenerateQuestions(interview._id)}
                          disabled={isGenerating}
                          className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                        >
                          <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                          {isGenerating ? "Regenerating..." : "Regenerate"}
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      {editedQuestions.map((question, index) => (
                        <textarea
                          key={index}
                          value={question}
                          onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                          rows={2}
                          disabled={savingEdit}
                          className="w-full text-sm p-2 border border-[var(--color-border)] rounded-[var(--radius-control)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                        />
                      ))}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => saveEditedQuestions(interview._id)}
                          disabled={savingEdit}
                          className="flex items-center gap-1"
                        >
                          <Check size={14} />
                          {savingEdit ? "Saving..." : "Save"}
                        </Button>
                        <button
                          onClick={cancelEditing}
                          disabled={savingEdit}
                          className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] px-3 disabled:opacity-50"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1.5">
                      {interview.questions.map((question, index) => (
                        <li key={index} className="text-sm text-[var(--color-text-secondary)]">
                          {question}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => handleGenerateQuestions(interview._id)}
                  disabled={isGenerating}
                  className="w-full mt-2"
                >
                  <Sparkles size={16} className="mr-2" />
                  {isGenerating ? "Generating..." : "Generate Questions"}
                </Button>
              )}

              {errorByInterview[interview._id] && (
                <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorByInterview[interview._id]}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RecruiterInterviews;