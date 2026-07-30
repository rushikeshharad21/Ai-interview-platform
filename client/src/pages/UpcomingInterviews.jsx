import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Briefcase } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { getMyInterviewsAsCandidate } from "../lib/interviewApi.js";

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

const InterviewCardSkeleton = () => (
  <Card className="animate-pulse">
    <div className="h-4 w-2/3 bg-[var(--color-border)] rounded mb-3"></div>
    <div className="h-3 w-1/2 bg-[var(--color-border)] rounded mb-2"></div>
    <div className="h-3 w-1/3 bg-[var(--color-border)] rounded"></div>
  </Card>
);

const UpcomingInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getMyInterviewsAsCandidate();
        setInterviews(data);
      } catch (err) {
        setError("Error occurred while fetching interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <InterviewCardSkeleton />
        <InterviewCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-[var(--color-error)]">{error}</p>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <p className="text-[var(--color-text-secondary)]">
          No interviews scheduled currently
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Upcoming Interviews
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {interviews.map((interview) => (
          <Card key={interview._id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                <Briefcase size={18} className="text-[var(--color-accent)]" />
                {interview.job?.title}
              </div>
              <StatusBadge status={interview.status} />
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
              {interview.recruiter?.name}
            </div>

            {interview.status === "scheduled" && (
              <Link to={`/interviews/${interview._id}/preview`}>
                <Button className="w-full">Join</Button>
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpcomingInterviews;