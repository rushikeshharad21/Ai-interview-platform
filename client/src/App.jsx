import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import useAuthStore from "./store/authStore"
import PostJob from "./pages/PostJob"
import BrowseJobs from "./pages/BrowseJobs"
import JobDetail from "./pages/JobDetail"
import ManageJobs from "./pages/ManageJobs"
import JobApplications from "./pages/JobApplications"
import UpcomingInterviews from "./pages/UpcomingInterviews.jsx";
import InterviewPreview from "./pages/InterviewPreview.jsx";
import InterviewSession from "./pages/InterviewSession.jsx";
import RecruiterInterviews from "./pages/RecruiterInterviews.jsx";
import CandidateDashboard from "./pages/Dashboard.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";
import AllApplications from "./pages/AllApplications.jsx";

const InterviewResults = lazy(() => import("./pages/InterviewResults.jsx"));

const ResultsPageFallback = () => (
  <div className="max-w-3xl mx-auto space-y-4">
    <div className="h-4 w-32 bg-[var(--color-surface)] rounded animate-pulse"></div>
    <div className="h-40 w-full bg-[var(--color-surface)] rounded-2xl animate-pulse"></div>
  </div>
);

const RoleBasedDashboard = () => {
  const user = useAuthStore((state) => state.user)
  return user?.role === "recruiter" ? <RecruiterDashboard /> : <CandidateDashboard />
}

function App() {
  const user = useAuthStore((state) => state.user)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/interviews" element={<UpcomingInterviews />} />
          <Route path="/interviews/:id/preview" element={<InterviewPreview />} />
          <Route path="/interviews/:id/session" element={<InterviewSession />} />
          <Route
            path="/interviews/:id/results"
            element={
              <Suspense fallback={<ResultsPageFallback />}>
                <InterviewResults />
              </Suspense>
            }
          />
          <Route path="/interviews/manage" element={<RecruiterInterviews />} />
        <Route path="/jobs/manage" element={<ManageJobs />} />
        <Route path="/jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="/jobs/new" element={<PostJob />} />
          <Route path="/applications" element={<AllApplications />} />
         
        </Route>

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App