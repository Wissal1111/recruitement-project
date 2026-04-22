import AuthBackground from "../components/sign/AuthBackground";
import SignCard from "../components/sign/SignCard";

export default function SignUp() {
    return(
       <>
       <AuthBackground>
        <SignCard type="signup"/>
       </AuthBackground>
       </>
    );
}