import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Briefcase, CheckCircle2, AlertCircle, ArrowRight, ChevronRight, MapPin } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import useAuthStore from "../store/authStore.js";
import { getMyInterviewsAsCandidate } from "../lib/interviewApi.js";
import { getMyApplications } from "../lib/applicationApi.js";

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

const formatAppliedDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const StatCard = ({ icon, gradientClass, waveColor, label, value, subtext, subtextClass }) => {
  return (
    <Card className="relative overflow-hidden">
      <svg
        className="absolute bottom-0 right-0 w-28 h-16 opacity-40"
        viewBox="0 0 140 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C25,55 35,20 60,30 C85,40 95,10 140,15 L140,80 L0,80 Z"
          fill={waveColor}
        />
      </svg>

      <div className="relative">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        <p className="text-2xl font-semibold text-[var(--color-text-primary)] mt-0.5">{value}</p>
        {subtext && <p className={`text-xs mt-1 ${subtextClass}`}>{subtext}</p>}
      </div>
    </Card>
  );
};

const CandidateDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const [interviewsResponse, applicationsResponse] = await Promise.all([
        getMyInterviewsAsCandidate(),
        getMyApplications(),
      ]);

      setInterviews(interviewsResponse);
      setApplications(applicationsResponse.data);
    } catch (err) {
      if (!err.response) {
        setFetchError("Network error. Please check your connection and try again.");
      } else {
        setFetchError("Could not load your dashboard. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingInterviews = interviews
    .filter((interview) => interview.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const completedInterviews = interviews.filter((interview) => interview.status === "completed");
  const nextInterview = upcomingInterviews[0] || null;
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-[var(--color-surface)] rounded animate-pulse"></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((placeholder) => (
            <Card key={placeholder} className="animate-pulse">
              <div className="h-10 w-10 bg-[var(--color-surface)] rounded-xl mb-3"></div>
              <div className="h-3 w-1/2 bg-[var(--color-surface)] rounded mb-2"></div>
              <div className="h-6 w-1/3 bg-[var(--color-surface)] rounded"></div>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse h-24"></Card>
        <Card className="animate-pulse h-64"></Card>
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
          <Button onClick={fetchDashboardData} className="mt-2">Try again</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            icon={<Calendar size={20} className="text-white" />}
            gradientClass="from-[var(--color-accent)] to-[var(--color-accent-hover)]"
            waveColor="#4F46E5"
            label="Upcoming Interviews"
            value={upcomingInterviews.length}
            subtext={nextInterview ? `Next: ${formatAppliedDate(nextInterview.scheduledAt)}` : null}
            subtextClass="text-[var(--color-text-secondary)]"
          />
        </div>

        <div className="animate-fade-in-up stagger-2">
          <StatCard
            icon={<Briefcase size={20} className="text-white" />}
            gradientClass="from-blue-500 to-blue-600"
            waveColor="#3B82F6"
            label="Total Applications"
            value={applications.length}
            subtext={applications.length > 0 ? "Keep applying!" : null}
            subtextClass="text-blue-600"
          />
        </div>

        <div className="animate-fade-in-up stagger-3">
          <StatCard
            icon={<CheckCircle2 size={20} className="text-white" />}
            gradientClass="from-green-500 to-green-600"
            waveColor="#22C55E"
            label="Completed Interviews"
            value={completedInterviews.length}
            subtext={completedInterviews.length > 0 ? "Great progress!" : null}
            subtextClass="text-[var(--color-success)]"
          />
        </div>
      </div>

      {nextInterview && (
        <div className="animate-fade-in-up stagger-4">
          <Card className="relative overflow-hidden bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent border-[var(--color-accent)]/20">
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 600 120"
            >
              <path
                d="M300,0 C350,40 320,80 400,60 C480,40 520,90 600,50 L600,120 L300,120 Z"
                fill="var(--color-accent)"
                fillOpacity="0.08"
              />
            </svg>

            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-accent)] mb-2">Next Interview</p>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {nextInterview.job?.title}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {formatScheduledAt(nextInterview.scheduledAt)}
                </p>
              </div>
              <Link to={`/interviews/${nextInterview._id}/preview`}>
                <Button className="flex items-center gap-1.5">
                  View Details
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium text-[var(--color-text-primary)]">Recent Applications</p>
          <Link to="/jobs" className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
            Browse Jobs →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            You haven't applied to any jobs yet
          </p>
        ) : (
          <div className="space-y-1">
            {recentApplications.map((application, index) => (
              <div
                key={application._id}
                className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)} flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0`}
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 text-sm font-semibold text-[var(--color-accent)]">
                  {application.job?.title?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {application.job?.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] mt-0.5">
                    <MapPin size={12} />
                    <span>{application.job?.location}</span>
                    <span>·</span>
                    <span>Applied {formatAppliedDate(application.createdAt)}</span>
                  </div>
                </div>

                <StatusBadge status={application.status} />
                <ChevronRight size={16} className="text-[var(--color-text-secondary)] shrink-0" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CandidateDashboard;