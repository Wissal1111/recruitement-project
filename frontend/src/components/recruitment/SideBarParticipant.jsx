import { useNavigate } from 'react-router-dom'
import '../SideBar.css'
import {
    LayoutDashboard, UserRound, Bell,
    Activity, Trophy, Search
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
                    <li className={page === "home" ? 'selected-page' : ''} onClick={() => go("/home")}>
                        <LayoutDashboard size={16} /> Home
                    </li>
                    <li className={page === "browse" ? 'selected-page' : ''} onClick={() => go("/home/browse")}>
                        <Search size={16} /> Browse Studies
                    </li>
                    <li className={page === "invitations" ? 'selected-page' : ''} onClick={() => go("/home/invitations")}>
                        <Bell size={16} /> Invitations
                    </li>
                    <li className={page === "activity" ? 'selected-page' : ''} onClick={() => go("/home/activity")}>
                        <Activity size={16} /> My Participations
                    </li>
                    <li className={page === "rewards" ? 'selected-page' : ''} onClick={() => go("/home/rewards")}>
                        <Trophy size={16} /> Rewards
                    </li>
                    <li className={page === "profile" ? 'selected-page' : ''} onClick={() => go("/home/profile")}>
                        <UserRound size={16} /> Profile
                    </li>

                </ul>
            </div>
        </>
    )
}