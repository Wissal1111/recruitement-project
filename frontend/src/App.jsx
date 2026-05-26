import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import BrowseStudies from "./pages/participant/BrowseStudies";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import MySurveys from "./pages/MySurveys";
import CreateSurvey from "./pages/CreateSurvey";
import QuestionsPage from "./pages/QuestionsPage";
import PhasesPage from "./pages/PhasesPage";
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
function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                {/* Participant */}
                <Route path="/home" element={<ProtectedRoute><HomeParticipant /></ProtectedRoute>} />
                <Route path="/home/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/home/invitations" element={<ProtectedRoute><MyInvitations /></ProtectedRoute>} />
                <Route path="/home/activity" element={<ProtectedRoute><MyParticipations /></ProtectedRoute>} />
                <Route path="/home/browse" element={<ProtectedRoute><BrowseStudies /></ProtectedRoute>} />
                {/* Redirige /participate vers /home */}
                <Route path="/participate" element={<ProtectedRoute><HomeParticipant /></ProtectedRoute>} />
                <Route path="/home/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                {/* Onboarding */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                {/* Chercheur */}
                {/*<Route path="/recruit" element={<ProtectedRoute><MySurveys /></ProtectedRoute>} />*/}
                <Route path="/recruit" element={<ProtectedRoute><RecruitRouter /></ProtectedRoute>} />
                <Route path="/recruit/surveys" element={<ProtectedRoute><MySurveys /></ProtectedRoute>} />
                <Route path="/recruit/create" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
                <Route path="/recruit/create/:id" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
                <Route path="/recruit/create/study/:id/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                <Route path="/recruit/create/study/:id/phases" element={<ProtectedRoute><PhasesPage /></ProtectedRoute>} />
                <Route path="/recruit/study/:id/phases" element={<ProtectedRoute><PhasesPage /></ProtectedRoute>} />
                <Route path="/recruit/create/study/:id/phases/:phaseId/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                <Route path="/recruit/study/:id/phases/:phaseId/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                <Route path="/recruit/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/recruit/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
                <Route path="/recruit/targeting" element={<ProtectedRoute><Targeting /></ProtectedRoute>} />
                <Route path="/recruit/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
                <Route path="/recruit/become-creator" element={<ProtectedRoute><MySurveys /></ProtectedRoute>} />
                <Route path="/recruit/screening" element={<ProtectedRoute><Screening /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;