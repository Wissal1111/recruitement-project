import './Info.css'
import profileImg from '../../../assets/images/user.png'
import {Pen} from "lucide-react"
function Edit(){
return(<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="14" y="4" width="36" height="36" rx="18" fill="url(#paint0_linear_285_12)"/>
<rect x="14" y="4" width="36" height="36" rx="18" stroke="white" stroke-width="4"/>
<g filter="url(#filter0_dd_285_12)">
<rect x="12" y="2" width="40" height="40" rx="20" fill="white" fill-opacity="0.01" shape-rendering="crispEdges"/>
</g>
<path d="M28.1009 25.8889H28.8925L34.3231 20.4583L33.5314 19.6667L28.1009 25.0972V25.8889ZM26.9897 27V24.6389L34.3231 17.3194C34.4342 17.2176 34.5569 17.1389 34.6911 17.0833C34.8254 17.0278 34.9666 17 35.1147 17C35.2629 17 35.4064 17.0278 35.5453 17.0833C35.6842 17.1389 35.8046 17.2222 35.9064 17.3333L36.6703 18.1111C36.7814 18.213 36.8624 18.3333 36.9134 18.4722C36.9643 18.6111 36.9897 18.75 36.9897 18.8889C36.9897 19.037 36.9643 19.1782 36.9134 19.3125C36.8624 19.4468 36.7814 19.5694 36.6703 19.6806L29.3509 27H26.9897ZM33.9203 20.0694L33.5314 19.6667L34.3231 20.4583L33.9203 20.0694Z" fill="white"/>
<defs>
<filter id="filter0_dd_285_12" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_285_12"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="3"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_285_12"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_285_12"/>
<feOffset dy="10"/>
<feGaussianBlur stdDeviation="7.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="effect1_dropShadow_285_12" result="effect2_dropShadow_285_12"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_285_12" result="shape"/>
</filter>
<linearGradient id="paint0_linear_285_12" x1="12" y1="2" x2="52" y2="42" gradientUnits="userSpaceOnUse">
<stop stop-color="#4A4BD7"/>
<stop offset="1" stop-color="#7073FF"/>
</linearGradient>
</defs>
</svg>
)
}
export default function Info(){
    return(
       <div className="profile-top">
         <div className="profile-info">
            <div className="pic">
            <img src={profileImg} alt="profile" className='profile-pic'/>
            <Edit/>
            </div>
            <div className="side-info">
            <h3>Sarah Miller</h3>
            <p>Software Engenieer</p>
            <div className="roles">
                <div className="role-label">
                CREATOR
            </div>
            <div className="role-label">
                PARTICIPANT
            </div>
            </div>
            </div>
        </div>
        <div className="profile-btns">
          <button className='btn linear edit'><Pen color='white' size={14} strokeWidth={3}/>Edit Profile</button>  
          <button className='btn settings-btn'>Settings</button>  
        </div>
       </div>
    )
}