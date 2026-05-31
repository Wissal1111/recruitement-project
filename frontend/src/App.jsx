import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BrowseStudies from "./pages/participant/BrowseStudies";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/home/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import MySurveys from "./pages/recruit/MySurveys";
import CreateSurvey from "./pages/recruit/CreateSurvey";
import QuestionsPage from "./pages/recruit/QuestionsPage";
import PhasesPage from "./pages/recruit/PhasesPage";
import ManagePage from "./pages/recruit/ManagePage";          // ← NEW
import Applications from "./pages/recruit/Applications";
import Invitations from "./pages/recruit/Invitations";
import Targeting from "./pages/recruit/Targeting";
import Candidates from "./pages/recruit/Candidates";
import MyInvitations from "./pages/participant/MyInvitations";
import MyParticipations from "./pages/participant/MyParticipations";
import HomeParticipant from "./pages/participant/HomeParticipant";
import RecruitRouter from "./pages/RecruitRouter";
import Rewards from "./pages/participant/Rewards";
import Screening from "./pages/recruit/Screening";
import SlotsRewards from "./pages/recruit/SlotsRewards";
import Dashboard from "./pages/home/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                <Route path="/home" element={<ProtectedRoute><HomeParticipant /></ProtectedRoute>} />
                <Route path="/home/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Participant */}
                <Route path="/participate/invitations" element={<ProtectedRoute><MyInvitations /></ProtectedRoute>} />
                <Route path="/participate/activity" element={<ProtectedRoute><MyParticipations /></ProtectedRoute>} />
                <Route path="/participate/browse" element={<ProtectedRoute><BrowseStudies /></ProtectedRoute>} />
                <Route path="/participate" element={<ProtectedRoute><HomeParticipant /></ProtectedRoute>} />
                <Route path="/home/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />

                {/* Onboarding */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                {/* Researcher */}
                <Route path="/recruit" element={<ProtectedRoute><RecruitRouter /></ProtectedRoute>} />
                <Route path="/recruit/surveys" element={<ProtectedRoute><MySurveys /></ProtectedRoute>} />
                <Route path="/recruit/create" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
                <Route path="/recruit/create/:id" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
                <Route path="/recruit/create/study/:id/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                <Route path="/recruit/create/study/:id/phases" element={<ProtectedRoute><PhasesPage /></ProtectedRoute>} />
                <Route path="/recruit/study/:id/phases" element={<ProtectedRoute><PhasesPage /></ProtectedRoute>} />
                <Route path="/recruit/create/study/:id/phases/:phaseId/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                <Route path="/recruit/study/:id/phases/:phaseId/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />

                {/* Manage page — NEW */}
                <Route path="/recruit/study/:id/manage" element={<ProtectedRoute><ManagePage /></ProtectedRoute>} />

                <Route path="/recruit/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/recruit/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
                <Route path="/recruit/targeting" element={<ProtectedRoute><Targeting /></ProtectedRoute>} />
                <Route path="/recruit/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
                <Route path="/recruit/become-creator" element={<ProtectedRoute><MySurveys /></ProtectedRoute>} />
                <Route path="/recruit/screening" element={<ProtectedRoute><Screening /></ProtectedRoute>} />
                <Route path="/recruit/slots" element={<ProtectedRoute><SlotsRewards /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;