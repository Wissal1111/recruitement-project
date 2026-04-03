import AuthBackground from "../components/AuthBackground";
import SignCard from "../components/SignCard";

export default function SignUp() {
    return(
       <>
       <AuthBackground>
        <SignCard type="signup"/>
       </AuthBackground>
       </>
    );
}