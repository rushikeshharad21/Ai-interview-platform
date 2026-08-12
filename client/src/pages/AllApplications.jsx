import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, AlertCircle, Search, ArrowRight, Briefcase, Calendar } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import Select from "../components/ui/Select.jsx";
import { getRecruiterApplications, updateApplicationStatus } from "../lib/applicationApi.js";

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  ...statusOptions,
];

const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const absoluteDate = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (diffDays <= 0) return { absolute: absoluteDate, relative: "Today" };
  if (diffDays === 1) return { absolute: absoluteDate, relative: "1 day ago" };
  return { absolute: absoluteDate, relative: `${diffDays} days ago` };
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const CandidateAvatar = ({ name }) => (
  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 text-xs font-semibold text-[var(--color-accent)]">
    {getInitials(name)}
  </div>
);

const AllApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplications = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const response = await getRecruiterApplications();
      setApplications(response.data);
    } catch (err) {
      if (!err.response) {
        setFetchError("Network error. Please check your connection and try again.");
      } else {
        setFetchError("Could not load applications. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch =
        searchLower === "" ||
        app.candidate?.name?.toLowerCase().includes(searchLower) ||
        app.job?.title?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setStatusError("");

    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      if (!err.response) {
        setStatusError("Network error. Could not update status, please try again.");
      } else {
        setStatusError(err.response?.data?.message || "Could not update status. Please try again.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-[var(--radius-card)] bg-[var(--color-surface)] animate-pulse" />;
  }

  if (fetchError) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-8 gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-[var(--color-error)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-sm">{fetchError}</p>
          <Button onClick={fetchApplications} className="mt-2">Try again</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Applications</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          All candidates who applied across your job postings
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate or job title..."
            className="w-full text-sm pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-[var(--radius-control)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto text-sm border border-[var(--color-border)] rounded-[var(--radius-control)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {statusError && (
        <div className="flex items-start gap-2 text-sm text-[var(--color-error)] bg-red-50 rounded-[var(--radius-control)] p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{statusError}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <p className="text-[var(--color-text-secondary)]">No applications received yet</p>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <p className="text-[var(--color-text-secondary)]">No applications match your search or filter</p>
        </Card>
      ) : (
        <>
          {/* Desktop table — sm breakpoint and up */}
          <Card className="hidden sm:block p-0 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">
                      Candidate
                    </th>
                    <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">
                      Job
                    </th>
                    <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">
                      Applied On
                    </th>
                    <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">
                      Update Status
                    </th>
                    <th className="px-6 py-3.5 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, index) => {
                    const appliedDate = formatRelativeDate(app.createdAt);

                    return (
                      <tr
                        key={app._id}
                        className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)} border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors duration-150`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CandidateAvatar name={app.candidate?.name} />
                            <div className="flex flex-col">
                              <span className="font-medium text-[var(--color-text-primary)]">
                                {app.candidate?.name}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                                <Mail size={12} />
                                {app.candidate?.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                              <Briefcase size={14} className="text-[var(--color-text-secondary)]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[var(--color-text-primary)] font-medium">
                                {app.job?.title}
                              </span>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {app.job?.location}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                            <Calendar size={13} />
                            <div className="flex flex-col">
                              <span className="text-[var(--color-text-primary)]">{appliedDate.absolute}</span>
                              <span className="text-xs">{appliedDate.relative}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 w-48">
                          <Select
                            options={statusOptions}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            disabled={updatingId === app._id}
                          />
                        </td>
                        <td className="px-6 py-4 w-32">
                          <button
                            onClick={() => navigate(`/jobs/${app.job?._id}/applications`)}
                            className="flex items-center gap-1 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium"
                          >
                            Manage
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </Card>

          {/* Mobile cards — below sm breakpoint */}
          <div className="sm:hidden flex flex-col gap-3">
            {filteredApplications.map((app, index) => {
              const appliedDate = formatRelativeDate(app.createdAt);

              return (
                <div key={app._id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
                  <Card className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CandidateAvatar name={app.candidate?.name} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-[var(--color-text-primary)] truncate">
                            {app.candidate?.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] truncate">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate">{app.candidate?.email}</span>
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                        <Briefcase size={14} className="text-[var(--color-text-secondary)]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-[var(--color-text-primary)] font-medium truncate">
                          {app.job?.title}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {app.job?.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                      <Calendar size={13} />
                      <span>{appliedDate.absolute}</span>
                      <span>·</span>
                      <span>{appliedDate.relative}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1">
                        <Select
                          options={statusOptions}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          disabled={updatingId === app._id}
                        />
                      </div>
                      <button
                        onClick={() => navigate(`/jobs/${app.job?._id}/applications`)}
                        className="flex items-center gap-1 text-sm text-[var(--color-accent)] font-medium shrink-0 border border-[var(--color-accent)]/30 rounded-[var(--radius-control)] px-3 py-2"
                      >
                        Manage
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </Card>
                </div>
              );
            })}

            <p className="text-xs text-[var(--color-text-secondary)] text-center py-1">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AllApplications;