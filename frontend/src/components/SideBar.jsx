import { useNavigate } from 'react-router-dom'
import './SideBar.css'
import {Info,LayoutDashboard,UserRound,Settings,Bell,Activity, Files,SquarePlus,SquarePen,UsersRound, Target, MailPlus, ClipboardList} from "lucide-react"
export default function SideBar({page,part}){
    const navigate=useNavigate();
    return(
        <div className="main-sidebar">
            {part==="home" && <>
            <p>HOME</p>
            <ul>
                <li className={page==="dashboard" ? 'selected-page' : ''} onClick={()=>navigate("/home")}><LayoutDashboard color="currentColor" size={16} className='icon'/> Dashboard</li>
                <li className={page==="profile" ? 'selected-page' : ''} onClick={()=>navigate("/home/profile")}><UserRound color="currentColor" size={16} />Profile</li>
                <li className={page==="notifications" ? 'selected-page' : ''}><Bell color="currentColor" size={16}/>Notifications</li>
                <li className={page==="activity" ? 'selected-page' : ''}><Activity color="currentColor" size={16}/>Activity</li>
                <li className={page==="settings" ? 'selected-page' : ''}><Settings color="currentColor" size={16}/>Settings</li>
                <li className={page==="help" ? 'selected-page' : ''}><Info color="currentColor" size={16}/>Help & Support</li>
            </ul>
            </>}
            {part==="recruit" && <>
            <p>SURVEYS</p>
            <ul>
                <li className={page==="mysurveys" ? 'selected-page' : ''}><Files color="currentColor" size={16} className='icon'/> My Surveys</li>
                <li className={page==="createsurvey" ? 'selected-page' : ''}><SquarePlus color="currentColor" size={16} />Create Survey</li>
                <li className={page==="drafts" ? 'selected-page' : ''}><SquarePen color="currentColor" size={16}/>Drafts</li>
            </ul>
            <p>CANDIDATES</p>
            <ul>
                <li className={page==="allcandidates" ? 'selected-page' : ''}><UsersRound color="currentColor" size={16} className='icon'/> All Candidates</li>
                <li className={page==="invitations" ? 'selected-page' : ''}><MailPlus color="currentColor" size={16} />Invitations</li>
                <li className={page==="applications" ? 'selected-page' : ''}><ClipboardList color="currentColor" size={16}/>Applications</li>
                <li className={page==="targeting" ? 'selected-page' : ''}><Target color="currentColor" size={16}/>Targeting</li>
            </ul>
            </>}
        </div>
    )
}