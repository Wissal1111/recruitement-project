import { useState } from "react";
import SideBar from "../components/onboarding/SideBar";
import TopBar from "../components/onboarding/TopBar";
import Basics from "../components/onboarding/Basics";
import Intrests from "../components/onboarding/Intrests";
import Profile from "../components/onboarding/Profile";
import Preference from "../components/onboarding/Preference";
import Birthday from "../components/onboarding/Birthday";

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const percentage = Math.round((step - 1) / 4 * 100) + "%";
  return (
    <>
    <TopBar/>
    <SideBar step={step} setStep={setStep} percentage={percentage}/>
        <div className="onboarding-container">
          {step === 1 && <Basics setStep={setStep}/>}
          {step === 2 && <Birthday setStep={setStep}/>}
          {step === 3 && <Intrests setStep={setStep}/>}
          {step === 4 && <Profile setStep={setStep}/>}
          {step === 5 && <Preference setStep={setStep}/>}
        </div>

   
    </>
  );
}