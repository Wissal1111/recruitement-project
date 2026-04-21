import './Basics.css';
import { useState } from "react";

function MaleIcon() {
    return(<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="80" height="80" rx="40" fill="#F0F4FA"/>
<path d="M52 28V37H49V33.1375L43.0375 39.0625C43.5125 39.7625 43.875 40.5062 44.125 41.2937C44.375 42.0812 44.5 42.9 44.5 43.75C44.5 46.05 43.7 48 42.1 49.6C40.5 51.2 38.55 52 36.25 52C33.95 52 32 51.2 30.4 49.6C28.8 48 28 46.05 28 43.75C28 41.45 28.8 39.5 30.4 37.9C32 36.3 33.95 35.5 36.25 35.5C37.075 35.5 37.8875 35.6187 38.6875 35.8562C39.4875 36.0937 40.225 36.4625 40.9 36.9625L46.8625 31H43V28H52ZM36.25 38.5C36.25 38.5 35.8875 38.5 35.1625 38.5C34.4375 38.5 33.5625 39.0125 32.5375 40.0375C31.5125 41.0625 31 42.3 31 43.75C31 45.2 31.5125 46.4375 32.5375 47.4625C33.5625 48.4875 34.8 49 36.25 49C37.7 49 38.9375 48.4875 39.9625 47.4625C40.9875 46.4375 41.5 45.2 41.5 43.75C41.5 42.3 40.9875 41.0625 39.9625 40.0375C38.9375 39.0125 37.7 38.5 36.25 38.5Z" fill="#4A4BD7"/>
</svg>
);}

function FemaleIcon() {
    return(<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="80" height="80" rx="40" fill="#F0F4FA"/>
<path d="M38.5 53.5V50.5H35.5V47.5H38.5V44.35C36.525 44 34.9063 43.0562 33.6438 41.5187C32.3812 39.9812 31.75 38.2 31.75 36.175C31.75 33.9 32.5563 31.9688 34.1688 30.3812C35.7812 28.7937 37.725 28 40 28C42.275 28 44.2188 28.7937 45.8313 30.3812C47.4438 31.9688 48.25 33.9 48.25 36.175C48.25 38.2 47.6188 39.9812 46.3563 41.5187C45.0938 43.0562 43.475 44 41.5 44.35V47.5H44.5V50.5H41.5V53.5H38.5ZM40 41.5C40 41.5 40.3625 41.5 41.0875 41.5C41.8125 41.5 42.6875 40.9875 43.7125 39.9625C44.7375 38.9375 45.25 37.7 45.25 36.25C45.25 34.8 44.7375 33.5625 43.7125 32.5375C42.6875 31.5125 41.45 31 40 31C38.55 31 37.3125 31.5125 36.2875 32.5375C35.2625 33.5625 34.75 34.8 34.75 36.25C34.75 37.7 35.2625 38.9375 36.2875 39.9625C37.3125 40.9875 38.55 41.5 40 41.5Z" fill="#EC4899"/>
</svg>
);}


export default function Basics({ setStep }) {
    const [selected, setSelected] = useState(null);

    const handleMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
    };

    return (       
            <div className="basics">

                <span className="step-label">
                    STEP 1 OF 5 
                    <div className="point"></div> 
                    0% COMPLETE
                </span>

                <h1 className="onboarding-title">
                    Tell us about yourself
                </h1>

                <p className="onboarding-content">
                    Help us personalize your experience by selecting your gender.
                </p>

                <div className="gender-cards">

                    <div 
                        className={`gender-card male ${selected === "male" ? "selected" : ""}`}
                        onMouseMove={handleMove}
                        onClick={() => setSelected("male")}
                    >
                        <MaleIcon/>
                        <span>Male</span>
                    </div>

                    <div 
                        className={`gender-card female ${selected === "female" ? "selected" : ""}`}
                        onMouseMove={handleMove}
                        onClick={() => setSelected("female")}
                    >
                        <FemaleIcon/>
                        <span>Female</span>
                    </div>
     
                </div>
                <div className="basics-btn">
                    <button className='btn linear' onClick={()=>{setStep(2)}}>Continue</button>
                </div>
            </div>
    );
}