import "./Birthday.css";
import { useState } from "react";

export default function Birthday({ setStep }) {
    const [birthday, setBirthday] = useState("");

    return (
       <div className="birthday">

    <span className="step-label">
        STEP 2 OF 5 
        <div className="point"></div> 
        20% COMPLETE
    </span>

    <h1 className="onboarding-title">
        When is your birthday?
    </h1>

    <p className="onboarding-content">
        We use your birthday to tailor your content.
    </p>

    <div className="birthday-card">
        <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="birthday-input"
        />
        <div className="line"></div>
         <div className="intrests-btn bdbtn">
        <button className="btn goback" onClick={() => setStep(1)}>
            Back
        </button>

        <button
            className="btn linear"
            disabled={!birthday}
            onClick={() => setStep(3)}
        >
            Continue
        </button>
    </div>
    </div>

   

</div>
    );
}