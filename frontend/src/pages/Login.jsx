import AuthBackground from "../components/sign/AuthBackground";
import SignCard from "../components/sign/SignCard";

export default function Login() {
    return(
       <>
       <AuthBackground>
        <SignCard type="login"/>
       </AuthBackground>
       </>
    );
}