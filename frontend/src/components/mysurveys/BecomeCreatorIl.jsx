import './BecomeCreator.css'
import { becomeCreator } from '../../api/Role';
import { useNavigate } from 'react-router-dom';

export default function BecomeCreatorIl({setIsCreator}){
  const navigate=useNavigate();
  const handleBecomeCreator = async () => {
  try {
    await becomeCreator();
    setIsCreator(true);
  } catch (err) {
    console.log("becomeCreator error:", err);
  }
};
    return(<div className="become-creator">
    <div className="bc-card">
      <div className="bc-illustration">
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="120" cy="172" rx="75" ry="11" fill="#e0e7ff" opacity="0.6"/>

          {/* Center device card */}
          <rect x="75" y="60" width="90" height="105" rx="14" fill="#4f46e5"/>
          <rect x="83" y="70" width="74" height="58" rx="8" fill="#818cf8" opacity="0.3"/>
          <rect x="89" y="77" width="60" height="7" rx="3.5" fill="#fff" opacity="0.75"/>
          <rect x="89" y="88" width="44" height="4" rx="2" fill="#fff" opacity="0.45"/>
          <rect x="89" y="96" width="52" height="4" rx="2" fill="#fff" opacity="0.45"/>
          <rect x="89" y="104" width="34" height="4" rx="2" fill="#fff" opacity="0.45"/>
          <rect x="89" y="146" width="62" height="13" rx="6.5" fill="#a5b4fc"/>
          <text x="120" y="156.5" fontSize="7.5" fill="#312e81" textAnchor="middle" fontWeight="700" fontFamily="inherit">Become a Creator</text>

          {/* Avatar top */}
          <circle cx="120" cy="44" r="22" fill="#fff"/>
          <circle cx="120" cy="44" r="18" fill="#eef2ff"/>
          <circle cx="120" cy="40" r="8" fill="#4f46e5"/>
          <path d="M104 57 Q120 67 136 57" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

          {/* Left participant */}
          <circle cx="48" cy="100" r="15" fill="#fff" stroke="#e0e7ff" strokeWidth="1.5"/>
          <circle cx="48" cy="97" r="5.5" fill="#818cf8"/>
          <path d="M37 109 Q48 116 59 109" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <line x1="63" y1="100" x2="74" y2="100" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="2,2"/>

          {/* Right participant */}
          <circle cx="192" cy="100" r="15" fill="#fff" stroke="#e0e7ff" strokeWidth="1.5"/>
          <circle cx="192" cy="97" r="5.5" fill="#a78bfa"/>
          <path d="M181 109 Q192 116 203 109" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <line x1="166" y1="100" x2="177" y2="100" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="2,2"/>

          {/* Decorative dots */}
          <circle cx="42" cy="58" r="5" fill="#818cf8" opacity="0.35"/>
          <circle cx="195" cy="140" r="4" fill="#a78bfa" opacity="0.35"/>
          <circle cx="185" cy="55" r="3" fill="#4f46e5" opacity="0.25"/>
          <circle cx="55" cy="145" r="3" fill="#818cf8" opacity="0.25"/>
        </svg>

        {/* Floating badges */}
        <div className="bc-badge bc-badge--left">
          <span className="bc-dot bc-dot--green"></span>
          2.4k researchers
        </div>
        <div className="bc-badge bc-badge--right">
          <span className="bc-dot bc-dot--amber"></span>
          48h avg fill time
        </div>
      </div>

      <div className="bc-content">
        <span className="bc-pill">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="5" fill="#4f46e5"/>
            <path d="M3 5.5L4.5 7L7 3.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Now Recruiting
        </span>

        <h1 className="bc-title">
          Recruit participants,<br />
          <span>grow your research.</span>
        </h1>

        <p className="bc-desc">
          Connect with a diverse community of study participants. Post your study,
          screen for the right fit, and gather insights — all in one place.
        </p>

        <div className="bc-actions">
          <button className="bc-btn bc-btn--primary" onClick={handleBecomeCreator}>
  Become a Creator
</button>
          <button className="bc-btn bc-btn--ghost" onClick={() => navigate("/recruit")}>
            Learn more
          </button>
        </div>

        <div className="bc-stats">
          <div className="bc-stat">
            <span className="bc-stat__num">12k+</span>
            <span className="bc-stat__label">Participants</span>
          </div>
          <div className="bc-stat__divider"/>
          <div className="bc-stat">
            <span className="bc-stat__num">340+</span>
            <span className="bc-stat__label">Studies run</span>
          </div>
          <div className="bc-stat__divider"/>
          <div className="bc-stat">
            <span className="bc-stat__num">98%</span>
            <span className="bc-stat__label">Approval rate</span>
          </div>
        </div>
      </div>
    </div>
  </div>)
}