import QuestionMark from "../assets/illustrations/QuestionMark";
import "./AuthBackground.css";
export default function AuthBackground({children}) {
    return(
        <div className="auth-background">
            {children}
            <QuestionMark className="question-mark z-0" />
        </div>
    );
}