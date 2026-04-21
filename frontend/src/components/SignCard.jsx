import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/icons/Logo";
import Error from "../assets/icons/Error";
import "./SignCard.css";
import { useState } from "react";
import { registerUser, loginUser } from "../api/Auth";
import Loading from "./Loading";
import { setSession } from "../utils/AuthSession";


function Feild({
    type,
    id,
    placeholder,
    label,
    showError,
    error,
    value,
    onChange,
    onBlur
}) {
    return (
        <div className="feild">
            <label htmlFor={id} className={showError ? "label-error" : ""}>
                {label}
            </label>

            <input
                className={showError ? "input-error" : ""}
                type={type}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />

            {showError && (
                <span className="error">
                    <Error /> {error}
                </span>
            )}
        </div>
    );
}

export default function SignCard({ type }) {
    const navigate = useNavigate();

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showError, setShowError] = useState(false);

    const [touched, setTouched] = useState({
        firstname: false,
        lastname: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    // ---------------- VALIDATION ----------------
    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        /^.{8,}$/.test(password);

    const getError = (field) => {
        switch (field) {
            case "firstname":
                return !firstname ? "First name is required." : "";

            case "lastname":
                return !lastname ? "Last name is required." : "";

            case "email":
                if (!email) return "Email is required.";
                if (!validateEmail(email)) return "Invalid email.";
                return "";

            case "password":
                if (!password) return "Password is required.";
                if (!validatePassword(password))
                    return "Password must be 8+ characters.";
                return "";

            case "confirmPassword":
                if (!confirmPassword)
                    return "Confirm password required.";
                if (confirmPassword !== password)
                    return "Passwords do not match.";
                return "";

            default:
                return "";
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    // ---------------- REGISTER ----------------
const handleRegister = async (e) => {
    e.preventDefault();

    setShowError(false);
    setErrorMsg("");

    setTouched({
        firstname: true,
        lastname: true,
        email: true,
        password: true,
        confirmPassword: true
    });

    const errors = [
        getError("firstname"),
        getError("lastname"),
        getError("email"),
        getError("password"),
        getError("confirmPassword")
    ];

    if (!errors.every((e) => e === "")) return;

    try {
        setLoading(true);

        const res = await registerUser({
            firstname,
            lastname,
            email,
            password
        });

        // ✅ SAVE SESSION
        setSession({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            user: {
                userId: res.userId,
                roles: res.roles
            }
        });

        setLoading(false);
        navigate("/onboarding");

    } catch (err) {
        setLoading(false);
        setShowError(true);
        setErrorMsg(err.response?.data?.message || err.message);
    }
};

    // ---------------- LOGIN ----------------
const handleLogin = async (e) => {
    e.preventDefault();

    setShowError(false);
    setErrorMsg("");

    if (!email || !password) {
        setShowError(true);
        setErrorMsg("Email and password required");
        return;
    }

    try {
        setLoading(true);

        const res = await loginUser({
            email,
            password
        });

        console.log("LOGIN SUCCESS:", res);

        
        setSession({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            user: res.user
        });

        setLoading(false);
        navigate("/home");

    } catch (err) {
        setLoading(false);
        setShowError(true);
        setErrorMsg(err.response?.data?.message || err.message);
    }
};

    return (
        <>
            {loading && <Loading />}

            {!loading && (
                <div className="sign-card z-10">
                    <Logo />

                    <h1>
                        {type === "login"
                            ? "Welcome back!"
                            : "Create an account"}
                    </h1>

                    <p>
                        {type === "login"
                            ? "Please login to continue."
                            : "Create your account."}
                    </p>

                    {/* 🔥 FIX: use onSubmit instead of onClick */}
                    <form
                        className="feilds"
                        onSubmit={
                            type === "signup"
                                ? handleRegister
                                : handleLogin
                        }
                    >
                        {type === "signup" && (
                            <div className="flex-inputs">
                                <Feild
                                    type="text"
                                    id="firstname"
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    value={firstname}
                                    onChange={(e) =>
                                        setFirstname(e.target.value)
                                    }
                                    onBlur={() =>
                                        handleBlur("firstname")
                                    }
                                    showError={
                                        touched.firstname &&
                                        !!getError("firstname")
                                    }
                                    error={getError("firstname")}
                                />

                                <Feild
                                    type="text"
                                    id="lastname"
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    value={lastname}
                                    onChange={(e) =>
                                        setLastname(e.target.value)
                                    }
                                    onBlur={() =>
                                        handleBlur("lastname")
                                    }
                                    showError={
                                        touched.lastname &&
                                        !!getError("lastname")
                                    }
                                    error={getError("lastname")}
                                />
                            </div>
                        )}

                        <Feild
                            type="email"
                            id="email"
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            onBlur={() => handleBlur("email")}
                            showError={
                                touched.email &&
                                !!getError("email")
                            }
                            error={getError("email")}
                        />

                        <Feild
                            type="password"
                            id="password"
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            onBlur={() => handleBlur("password")}
                            showError={
                                touched.password &&
                                !!getError("password")
                            }
                            error={getError("password")}
                        />

                        {type === "signup" && (
                            <Feild
                                type="password"
                                id="confirm"
                                label="Confirm Password"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                onBlur={() =>
                                    handleBlur("confirmPassword")
                                }
                                showError={
                                    touched.confirmPassword &&
                                    !!getError("confirmPassword")
                                }
                                error={getError("confirmPassword")}
                            />
                        )}

                        {showError && (
                            <div className="register-err">
                                {errorMsg}
                            </div>
                        )}

                        <button className="shadow" type="submit">
                            {type === "signup"
                                ? "Sign Up"
                                : "Log In"}
                        </button>
                    </form>

                    <span className="switch">
                        {type === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}{" "}
                        <Link
                            to={
                                type === "login"
                                    ? "/signup"
                                    : "/login"
                            }
                        >
                            {type === "login"
                                ? "Sign up"
                                : "Log in"}
                        </Link>
                    </span>
                </div>
            )}
        </>
    );
}