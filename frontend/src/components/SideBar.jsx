import { useNavigate } from 'react-router-dom'
import './SideBar.css'
import {
    Info, LayoutDashboard, UserRound, Settings, Bell,
    Activity, Files, SquarePlus, Search, UsersRound,
    Target, MailPlus, ClipboardList,DollarSign,CreditCard,Coins
} from "lucide-react"


export default function SideBar({ page, part, isOpen, onClose }) {
    const navigate = useNavigate()

    const go = (path) => {
        navigate(path)
        onClose()
    }

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            <div className={`main-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                {part === "home" && <>
                    <p>HOME</p>
                    <ul>
                        <li className={page === "dashboard" ? 'selected-page' : ''} onClick={() => go("/home")}>
                            <LayoutDashboard size={16} /> Dashboard
                        </li>
                        <li className={page === "profile" ? 'selected-page' : ''} onClick={() => go("/home/profile")}>
                            <UserRound size={16} /> Profile
                        </li>
                        
<li className={page === "wallet" ? 'selected-page' : ''} onClick={() => go("/home/wallet")}>
    <Coins size={16} /> My Wallet
</li>
<li className={page === "cards" ? 'selected-page' : ''} onClick={() => go("/home/cards")}>
    <CreditCard size={16} /> My Cards
</li>
                        <li className={page === "notifications" ? 'selected-page' : ''} onClick={() => go("/home/notifications")}>
                            <Bell size={16} /> Notifications
                        </li>
                        <li className={page === "settings" ? 'selected-page' : ''} onClick={() => go("/home/settings")}>
                            <Settings size={16} /> Settings
                        </li>
                        <li className={page === "help" ? 'selected-page' : ''} onClick={() => go("/home/help")}>
                            <Info size={16} /> Help & Support
                        </li>
                    </ul>
                </>}

                {part === "recruit" && <>
                    <p>SURVEYS</p>
                    <ul>
                        <li className={page === "mysurveys" ? 'selected-page' : ''} onClick={() => go("/recruit/surveys")}>
                            <Files size={16} /> My Surveys
                        </li>
                        <li className={page === "createsurvey" ? 'selected-page' : ''} onClick={() => go("/recruit/create")}>
                            <SquarePlus size={16} /> Build Survey
                        </li>
                        <li className={page === "payments" ? 'selected-page' : ''} onClick={() => go("/recruit/payments")}>
                            <CreditCard size={16} /> Payments
                        </li>
                    </ul>
                    <p>CANDIDATES</p>
                    <ul>
                        <li className={page === "allcandidates" ? 'selected-page' : ''} onClick={() => go("/recruit/candidates")}>
                            <UsersRound size={16} /> All Candidates
                        </li>
                        <li className={page === "invitations" ? 'selected-page' : ''} onClick={() => go("/recruit/invitations")}>
                            <MailPlus size={16} /> Invitations
                        </li>
                        <li className={page === "applications" ? 'selected-page' : ''} onClick={() => go("/recruit/applications")}>
                            <ClipboardList size={16} /> Applications
                        </li>
                        <li className={page === "targeting" ? 'selected-page' : ''} onClick={() => go("/recruit/targeting")}>
                            <Target size={16} /> Targeting
                        </li>
                        <li className={page === "screening" ? 'selected-page' : ''} onClick={() => go("/recruit/screening")}>
                            <Search size={16} /> Screening
                        </li>
                        <li className={page === "slotsrewards" ? 'selected-page' : ''} onClick={() => go("/recruit/slots")}>
                            <DollarSign size={16} /> Slots & Rewards
                        </li>
                    </ul>

                </>}
            </div>
        </>
    )
}