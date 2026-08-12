import { useEffect, useState, useMemo } from "react";
import { Calendar, Clock, User, Briefcase, Sparkles, RefreshCw, Pencil, Check, X, AlertCircle, Search } from "lucide-react";
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

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [errorByInterview, setErrorByInterview] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const matchesStatus = statusFilter === "all" || interview.status === statusFilter;

      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch =
        searchLower === "" ||
        interview.job?.title?.toLowerCase().includes(searchLower) ||
        interview.candidate?.name?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [interviews, searchTerm, statusFilter]);

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
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Scheduled Interviews</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage and track all your interviews in one place
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search interviews, candidates..."
            className="w-full text-sm pl-9 pr-3 py-2.5 border border-[var(--color-border)] rounded-[var(--radius-control)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto text-sm border border-[var(--color-border)] rounded-[var(--radius-control)] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {filteredInterviews.length === 0 ? (
        <Card>
          <p className="text-[var(--color-text-secondary)]">No interviews match your search or filter</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredInterviews.map((interview, index) => {
            const isEditing = editingId === interview._id;
            const isGenerating = generatingId === interview._id;

            return (
              <div key={interview._id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
                <Card className="flex flex-col gap-3 border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-[var(--color-accent)]" />
                      </div>
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

                  <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1.5 bg-[var(--color-surface)] rounded-full px-2.5 py-1">
                      <Calendar size={12} />
                      {formatScheduledAt(interview.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--color-surface)] rounded-full px-2.5 py-1">
                      <Clock size={12} />
                      {interview.duration} minutes
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--color-surface)] rounded-full px-2.5 py-1">
                      <User size={12} />
                      {interview.candidate?.name}
                    </span>
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
                          {editedQuestions.map((question, qIndex) => (
                            <textarea
                              key={qIndex}
                              value={question}
                              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
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
                          {interview.questions.map((question, qIndex) => (
                            <li key={qIndex} className="text-sm text-[var(--color-text-secondary)]">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;