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

function App() {
  const user = useAuthStore((state) => state.user)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/interviews" element={<UpcomingInterviews />} />
          <Route path="/interviews/:id/preview" element={<InterviewPreview />} />
          <Route path="/interviews/:id/session" element={<InterviewSession />} />
        <Route path="/jobs/manage" element={<ManageJobs />} />
        <Route path="/jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="/jobs/new" element={<PostJob />} />
          <Route path="/applications" element={<div>Applications page</div>} />
        </Route>

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App