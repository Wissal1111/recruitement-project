import { useNavigate } from 'react-router-dom'
import '../SideBar.css'
import {
    LayoutDashboard, UserRound, Bell,
    Activity, Trophy, Search,ClipboardCheck
} from "lucide-react"


export default function SideBarParticipant({ page, isOpen, onClose }) {
    const navigate = useNavigate()

    const go = (path) => {
        navigate(path)
        if (onClose) onClose()
    }

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            <div className={`main-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <p>PARTICIPANT</p>
                <ul>
                    <li className={page === "browse" ? 'selected-page' : ''} onClick={() => go("/participate/browse")}>
                        <Search size={16} /> Browse Studies
                    </li>
                    <li className={page === "invitations" ? 'selected-page' : ''} onClick={() => go("/participate/invitations")}>
                        <Bell size={16} /> Invitations
                    </li>
                    <li
    className={page === "responses" ? "selected-page" : ""}
    onClick={() => go("/participate/responses")}
>
    <ClipboardCheck size={16} /> Responses
</li>
                    <li className={page === "activity" ? 'selected-page' : ''} onClick={() => go("/participate/activity")}>
                        <Activity size={16} /> My Participations
                    </li>
                    <li className={page === "rewards" ? 'selected-page' : ''} onClick={() => go("/participate/rewards")}>
                        <Trophy size={16} /> Rewards
                    </li>

                </ul>
            </div>
        </>
    )
}