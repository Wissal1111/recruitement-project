import './SideBar.css';
import { Basics, Intrests, Profile, Preferences } from '../../assets/icons/SideBarIcons';
export default function SideBar({step, setStep, percentage}) {
const ChangeStep = (newStep) => {
    setStep(newStep);
};

return(
    <div className="onboarding-sidebar">
        <div className="step-header" id='sh1'>
                <span>ONBOARDING</span>
                <p>Step {step} of 4</p>
        </div>
        <div className="step-header" id='sh2'>
                <span>{percentage} </span>
                <p>Step {step}</p>
        </div>
        <ul className="onboarding-sidebar-elements">
            <li className={step === 1 ? "selected-step" : ""} onClick={() => ChangeStep(1)}>
    <Basics /><div className="item">Basics</div>
</li>
<li className={step === 2 ? "selected-step" : ""} onClick={() => ChangeStep(2)}>
    <Intrests /><div className="item">Intrests</div>
</li>
<li className={step === 3 ? "selected-step" : ""} onClick={() => ChangeStep(3)}>
    <Profile /><div className="item">Profile</div>
</li>
<li className={step === 4 ? "selected-step" : ""} onClick={() => ChangeStep(4)}>
    <Preferences /><div className="item">Preferences</div>
</li>
        </ul>
    </div>

    )
    }