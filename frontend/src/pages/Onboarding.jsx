import { useState, useEffect, useRef } from "react";
import SideBar from "../components/onboarding/sidebar/SideBar";
import TopBar from "../components/onboarding/topbar/TopBar";
import Basics from "../components/onboarding/basics/Basics";
import Intrests from "../components/onboarding/Intrests/Intrests";
import Profile from "../components/onboarding/profile/Profile";
import Preference from "../components/onboarding/preferences/Preference";
import Birthday from "../components/onboarding/birthday/Birthday";
import { updateProfile } from "../api/ProfileApi";
import { addUserInterests, getAllInterests } from "../api/Intrests";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const [gender, setGender] = useState("OTHER");
    const [age, setAge] = useState(0);
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [education, setEducation] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [profession, setProfession] = useState("");
    const [selectedInterests, setSelectedInterests] = useState([]);

    const allInterestsRef = useRef([]);

    const percentage = Math.round((step - 1) / 4 * 100) + "%";

    useEffect(() => {
        getAllInterests()
            .then(data => {
                const list = Array.isArray(data) ? data : data.interests ?? [];
                allInterestsRef.current = list;
            })
            .catch(console.error);
    }, []);

    const handleSubmitProfile = async () => {
        try {
            await updateProfile({ gender, age, dateOfBirth, education, city, country, profession });

            if (selectedInterests.length > 0) {
                const interestIds = selectedInterests
                    .map(key => allInterestsRef.current.find(i => i.name === key))
                    .filter(Boolean)
                    .map(i => i.interestId);

                if (interestIds.length > 0) {
                    await addUserInterests(interestIds);
                }
            }

            navigate("/home");
        } catch (err) {
            console.error("Profile update failed", err);
        }
    };

    return (
        <>
            <TopBar />

            <SideBar
                step={step}
                setStep={setStep}
                percentage={percentage}
            />

            <div className="onboarding-container">

                {step === 1 && (
                    <Basics
                        setStep={setStep}
                        setGender={setGender}
                    />
                )}

                {step === 2 && (
                    <Birthday
                        setStep={setStep}
                        setDateOfBirth={setDateOfBirth}
                        setAge={setAge}
                    />
                )}

                {step === 3 && (
                    <Intrests
                        setStep={setStep}
                        selectedInterests={selectedInterests}
                        setSelectedInterests={setSelectedInterests}
                    />
                )}

                {step === 4 && (
                    <Profile
                        setStep={setStep}
                        setCountry={setCountry}
                        setCity={setCity}
                        setEducation={setEducation}
                        setProfession={setProfession}
                    />
                )}

                {step === 5 && (
                    <Preference setStep={setStep} handleSubmitProfile={handleSubmitProfile} />
                )}

            </div>
        </>
    );
}