import { useState } from "react";
import SideBar from "../components/onboarding/SideBar";
import TopBar from "../components/onboarding/TopBar";
import Basics from "../components/onboarding/Basics";
import Intrests from "../components/onboarding/Intrests";

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const percentage = Math.round((step - 1) / 4 * 100) + "%";
  return (
    <>
    <TopBar/>
    <SideBar step={step} setStep={setStep} percentage={percentage}/>
        <div className="onboarding-container">
          {step === 1 && <Basics setStep={setStep} p/>}
          {step === 2 && <Intrests setStep={setStep}/>}
        </div>

   
    </>
  );
}