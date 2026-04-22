import './BottomCards.css'
import {LogOut,Lock,GraduationCap,Cake} from "lucide-react"

function MgmtIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" rx="16" fill="#FEF2F2"/>
<path d="M20.1668 20.1666C20.1668 20.1666 20.2536 20.1666 20.4272 20.1666C20.6009 20.1666 20.8092 20.0451 21.0522 19.802C21.2953 19.5589 21.4168 19.2638 21.4168 18.9166C21.4168 18.5694 21.2953 18.2742 21.0522 18.0312C20.8092 17.7881 20.5141 17.6666 20.1668 17.6666C19.8196 17.6666 19.5245 17.7881 19.2814 18.0312C19.0384 18.2742 18.9168 18.5694 18.9168 18.9166C18.9168 19.2638 19.0384 19.5589 19.2814 19.802C19.5245 20.0451 19.8196 20.1666 20.1668 20.1666ZM20.1668 22.6666C20.5974 22.6666 20.9932 22.5659 21.3543 22.3645C21.7154 22.1631 22.0071 21.8958 22.2293 21.5624C21.9238 21.3819 21.5974 21.243 21.2502 21.1458C20.9029 21.0485 20.5418 20.9999 20.1668 20.9999C19.7918 20.9999 19.4307 21.0485 19.0835 21.1458C18.7363 21.243 18.4099 21.3819 18.1043 21.5624C18.3266 21.8958 18.6182 22.1631 18.9793 22.3645C19.3404 22.5659 19.7363 22.6666 20.1668 22.6666ZM16.0002 24.3333C14.0696 23.8471 12.4759 22.7395 11.2189 21.0103C9.96197 19.2812 9.3335 17.361 9.3335 15.2499V10.1666L16.0002 7.66658L22.6668 10.1666V14.8958C22.4029 14.7846 22.1321 14.6839 21.8543 14.5937C21.5766 14.5034 21.2918 14.4374 21.0002 14.3958V11.3333L16.0002 9.45825L11.0002 11.3333V15.2499C11.0002 15.9027 11.087 16.5555 11.2606 17.2083C11.4342 17.861 11.6772 18.4826 11.9897 19.0728C12.3022 19.6631 12.6807 20.2083 13.1252 20.7083C13.5696 21.2083 14.0627 21.6249 14.6043 21.9583C14.7571 22.4027 14.9585 22.8263 15.2085 23.2291C15.4585 23.6319 15.7432 23.993 16.0627 24.3124C16.0488 24.3124 16.0384 24.3159 16.0314 24.3228C16.0245 24.3298 16.0141 24.3333 16.0002 24.3333ZM20.1668 24.3333C19.0141 24.3333 18.0314 23.927 17.2189 23.1145C16.4064 22.302 16.0002 21.3194 16.0002 20.1666C16.0002 19.0138 16.4064 18.0312 17.2189 17.2187C18.0314 16.4062 19.0141 15.9999 20.1668 15.9999C21.3196 15.9999 22.3022 16.4062 23.1147 17.2187C23.9272 18.0312 24.3335 19.0138 24.3335 20.1666C24.3335 21.3194 23.9272 22.302 23.1147 23.1145C22.3022 23.927 21.3196 24.3333 20.1668 24.3333Z" fill="#DC2626"/>
</svg>

    )
}

export default function BottomCards({ onLogout }) {
    return (<div className="bottomcards">
            <div className="edu-bd">
                <div className="circard edu">
              <div className="crc">
                <GraduationCap color="currentColor" size={17}/></div>
              Master Degree
            </div>
            <div className="circard bd">
              <div className="crc">
                <Cake color="currentColor" size={17}/></div>
              10-01-2005
            </div>
            </div>
            <div className="bottom-card mgmt-card">
                <div className="mang">
                    <div className="biograpgy-title mngt">
                    <MgmtIcon />
                    Account Management
                </div>
                <p className="mgmt-desc">
                    Control your login sessions, data privacy preferences, and security protocols.
                </p></div>
                <div className="mgmt-actions">
                    <button className="mgmt-btn change-password-btn">
                        <Lock color="currentColor" size={16}/>
                        
                        Change Password
                    </button>
                    <button className="mgmt-btn logout-btn" onClick={onLogout}>
                        <LogOut color="currentColor" size={16}/>
                        Logout Account
                    </button>
                </div>
            </div>
            </div>
    )
}