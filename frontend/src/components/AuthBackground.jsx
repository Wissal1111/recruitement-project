import QuestionMark from "../assets/illustrations/QuestionMark";
import OnlineSurvey from "../assets/illustrations/OnlineSurvey";
import "./AuthBackground.css";
import CurvedLine from "../assets/illustrations/CurvedLine";
import SmallShapes from "../assets/illustrations/SmallShapes";
export default function AuthBackground({children}) {
    return(
        <div className="auth-background">
            {children}
            <QuestionMark className="question-mark z-0" />
            <OnlineSurvey className="online-survey z-0" />
            <CurvedLine className="curved-line1"/>
            <CurvedLine className="curved-line2"/>
            <SmallShapes className="small-shapes"/>
            <SmallShapes className="small-shapes2"/>
        </div>
    );
}