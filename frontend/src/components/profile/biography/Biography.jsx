import './Biography.css'

function Icon(){
    return(
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" rx="16" fill="#EEF2FF"/>
<path d="M16.0002 17.6666C16.4585 17.6666 16.8509 17.5034 17.1772 17.177C17.5036 16.8506 17.6668 16.4583 17.6668 15.9999C17.6668 15.5416 17.5036 15.1492 17.1772 14.8228C16.8509 14.4964 16.4585 14.3333 16.0002 14.3333C15.5418 14.3333 15.1495 14.4964 14.8231 14.8228C14.4967 15.1492 14.3335 15.5416 14.3335 15.9999C14.3335 16.4583 14.4967 16.8506 14.8231 17.177C15.1495 17.5034 15.5418 17.6666 16.0002 17.6666ZM12.6668 20.9999H19.3335V20.5208C19.3335 20.1874 19.2432 19.8819 19.0627 19.6041C18.8821 19.3263 18.6321 19.118 18.3127 18.9791C17.9516 18.8263 17.58 18.7083 17.1981 18.6249C16.8161 18.5416 16.4168 18.4999 16.0002 18.4999C15.5835 18.4999 15.1842 18.5416 14.8022 18.6249C14.4203 18.7083 14.0488 18.8263 13.6877 18.9791C13.3682 19.118 13.1182 19.3263 12.9377 19.6041C12.7571 19.8819 12.6668 20.1874 12.6668 20.5208V20.9999ZM21.0002 24.3333H11.0002C10.5418 24.3333 10.1495 24.1701 9.82308 23.8437C9.49669 23.5173 9.3335 23.1249 9.3335 22.6666V9.33325C9.3335 8.87492 9.49669 8.48256 9.82308 8.15617C10.1495 7.82978 10.5418 7.66658 11.0002 7.66658H17.6668L22.6668 12.6666V22.6666C22.6668 23.1249 22.5036 23.5173 22.1772 23.8437C21.8509 24.1701 21.4585 24.3333 21.0002 24.3333ZM21.0002 22.6666V13.3749L16.9585 9.33325H11.0002V22.6666H21.0002ZM11.0002 22.6666V9.33325V13.3749V22.6666Z" fill="#4F46E5"/>
</svg>
    )
}

function Int(){
    return(<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" rx="16" fill="#E0E7FF" fill-opacity="0.5"/>
<path d="M12.6665 20.9999L15.9998 18.4583L19.3332 20.9999L18.0832 16.8749L21.4165 14.4999H17.3332L15.9998 10.1666L14.6665 14.4999H10.5832L13.9165 16.8749L12.6665 20.9999ZM15.9998 24.3333C14.8471 24.3333 13.7637 24.1145 12.7498 23.677C11.7359 23.2395 10.854 22.6458 10.104 21.8958C9.354 21.1458 8.76025 20.2638 8.32275 19.2499C7.88525 18.236 7.6665 17.1527 7.6665 15.9999C7.6665 14.8471 7.88525 13.7638 8.32275 12.7499C8.76025 11.736 9.354 10.8541 10.104 10.1041C10.854 9.35408 11.7359 8.76033 12.7498 8.32283C13.7637 7.88533 14.8471 7.66658 15.9998 7.66658C17.1526 7.66658 18.2359 7.88533 19.2498 8.32283C20.2637 8.76033 21.1457 9.35408 21.8957 10.1041C22.6457 10.8541 23.2394 11.736 23.6769 12.7499C24.1144 13.7638 24.3332 14.8471 24.3332 15.9999C24.3332 17.1527 24.1144 18.236 23.6769 19.2499C23.2394 20.2638 22.6457 21.1458 21.8957 21.8958C21.1457 22.6458 20.2637 23.2395 19.2498 23.677C18.2359 24.1145 17.1526 24.3333 15.9998 24.3333ZM15.9998 22.6666C17.8609 22.6666 19.4373 22.0208 20.729 20.7291C22.0207 19.4374 22.6665 17.861 22.6665 15.9999C22.6665 14.1388 22.0207 12.5624 20.729 11.2708C19.4373 9.97908 17.8609 9.33325 15.9998 9.33325C14.1387 9.33325 12.5623 9.97908 11.2707 11.2708C9.979 12.5624 9.33317 14.1388 9.33317 15.9999C9.33317 17.861 9.979 19.4374 11.2707 20.7291C12.5623 22.0208 14.1387 22.6666 15.9998 22.6666Z" fill="#4338CA"/>
</svg>
)
}

const interests = [
    'Editorial Design',
    'Behavioral Science',
    'UI/UX Strategy',
    'Typography',
    'Data Visualisation',
    'Narrative Strategy',
]

export default function Biography(){
    return(
        <div className="bio-intrests">

        <div className="biograpghy-card">
            <div className="biograpgy-title">
                <Icon/>
                Personal Biography
            </div>
            <div className="bio-row">
                <div className="bio-info">
                    <label htmlFor="email">EMAIL ADDRESS</label>
                    <span>sarah.miller@curator.io</span>
                </div>
                <div className="bio-info">
                    <label htmlFor="location">LOCATION</label>
                    <span>Algeria, Mascara</span>
                </div>
            </div>
            <div className="line"></div>
            <div className="bio-info">
                <label htmlFor="aboutme">ABOUT ME</label>
                <p>Passionate about the intersection of data-driven insights and narrative
excellence. I help brands craft meaningful survey experiences that feel like high-
end conversations rather than simple form fills. Over 12 years of experience in
editorial design and behavioral research.</p>
            </div>
        </div>

        <div className="intrests-profile-card">
            <div className="biograpgy-title">
                <Int/>
                Curated Interests
            </div>
            <div className="interests-list">
                {interests.map((interest) => (
                    <span key={interest} className="interest-tag">{interest}</span>
                ))}
            </div>
            <button className="interests-add-btn">
                <span>+</span> Add
            </button>
        </div>      
        </div>
    )
}