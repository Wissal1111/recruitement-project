import { Link } from "react-router-dom";
import LogoText from "../assets/icons/LogoText";
import Error from "../assets/icons/Error";
import "./SignCard.css";
import { useState } from "react";

function Feild({ type, id, placeholder, label, showError, error, value, onChange, onBlur }) {
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
            {showError && <span className="error"><Error /> {error}</span>}
        </div>
    );
}

export default function SignCard({ type }) {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("participant");

    // touched state to track if the user interacted with the field
    const [touched, setTouched] = useState({
        firstname: false,
        lastname: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => /^.{8,}$/.test(password);

    const getError = (field) => {
        switch(field) {
            case "firstname":
                if (!firstname) return "First name is required.";
                return "";
            case "lastname":
                if (!lastname) return "Last name is required.";
                return "";
            case "email":
                if (!email) return "Email is required.";
                if (!validateEmail(email)) return "Please enter a valid email address.";
                return "";
            case "password":
                if (!password) return "Password is required.";
                if (!validatePassword(password)) return "Password must be exactly 8 chars with letters and numbers.";
                return "";
            case "confirmPassword":
                if (!confirmPassword) return "Please confirm your password.";
                if (confirmPassword !== password) return "Passwords do not match.";
                return "";
            default:
                return "";
        }
    }

    const handleBlur = (field) => {
        setTouched({...touched, [field]: true});
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched to show all errors
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
            type === "signup" ? getError("confirmPassword") : ""
        ];

        if (errors.every(err => err === "")) {
            alert(`${type === "login" ? "Logging in..." : "Signing up..."} ✅`);
            // Call backend API
        }
    }

    return (
        <div className="sign-card z-10">
            <LogoText />
            <h1>{type === "login" ? "Welcome back!" : "Create an account"}</h1>
            <p>
                {type === "login"
                    ? "Please enter your details to access your account."
                    : "Fill in the details to create your account."}
            </p>
            <form className="feilds" onSubmit={handleSubmit}>
                {type === "signup" && (
                    <div className="flex-inputs">
                        <Feild
                            type="text"
                            id="firstname"
                            label="First Name"
                            placeholder="Enter your first name"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            onBlur={() => handleBlur("firstname")}
                            showError={touched.firstname && !!getError("firstname")}
                            error={getError("firstname")}
                        />
                        <Feild
                            type="text"
                            id="lastname"
                            label="Last Name"
                            placeholder="Enter your last name"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            onBlur={() => handleBlur("lastname")}
                            showError={touched.lastname && !!getError("lastname")}
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
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    showError={touched.email && !!getError("email")}
                    error={getError("email")}
                />

                {type === "signup" && (
                    <div className="feild">
                        <label htmlFor="role">Role</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="participant">Participant</option>
                            <option value="creator">Creator</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                )}

                <Feild
                    type="password"
                    id="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    showError={touched.password && !!getError("password")}
                    error={getError("password")}
                />

                {type === "signup" && (
                    <Feild
                        type="password"
                        id="confirm-password"
                        label="Confirm Password"
                        placeholder="Enter your password again"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        showError={touched.confirmPassword && !!getError("confirmPassword")}
                        error={getError("confirmPassword")}
                    />
                )}

                <button type="submit">{type === "login" ? "Log In" : "Sign Up"}</button>
            </form>

            <span className="switch">
                {type === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <Link to={type === "login" ? "/signup" : "/login"}>
                    {type === "login" ? "Sign up for free" : "Log in"}
                </Link>
            </span>
        </div>
    );
}