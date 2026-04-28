import './Intrests.css';
import { 
    FaMicrochip, FaHeartbeat, FaGraduationCap, FaBriefcase,
    FaGamepad, FaMusic, FaDumbbell, FaUtensils
} from "react-icons/fa";
import Error from '../../../assets/icons/Error';

const interestsList = [
    { name: "Technology", desc: "AI, SaaS, infrastructure", icon: <FaMicrochip />, color: "#4A4BD7", key: "tech" },
    { name: "Health", desc: "Wellness and biotech", icon: <FaHeartbeat />, color: "#EC4899", key: "health" },
    { name: "Education", desc: "Learning & research", icon: <FaGraduationCap />, color: "#F59E0B", key: "edu" },
    { name: "Business", desc: "Markets & strategy", icon: <FaBriefcase />, color: "#caec36", key: "biz" },
    { name: "Gaming", desc: "Entertainment & esports", icon: <FaGamepad />, color: "#8B5CF6", key: "game" },
    { name: "Music", desc: "Audio & culture", icon: <FaMusic />, color: "#F43F5E", key: "music" },
    { name: "Fitness", desc: "Sport & wellness", icon: <FaDumbbell />, color: "#22C55E", key: "fit" },
    { name: "Food", desc: "Cooking & cuisine", icon: <FaUtensils />, color: "#F97316", key: "food" },
];

const groupRows = (list) => {
    const rows = [];
    let i = 0;
    const pattern = [3, 2, 3, 2];
    let p = 0;
    while (i < list.length) {
        const size = pattern[p % pattern.length];
        rows.push(list.slice(i, i + size));
        i += size;
        p++;
    }
    return rows;
};

export default function Intrests({ setStep, selectedInterests, setSelectedInterests }) {

    const toggle = (key) => {
        setSelectedInterests((prev) =>
            prev.includes(key)
                ? prev.filter(i => i !== key)
                : [...prev, key]
        );
    };

    const handleMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };

    const rows = groupRows(interestsList);

    return (
        <div className="interets">

            <span className="step-label">
                STEP 3 OF 5
                <div className="point"></div>
                40% COMPLETE
            </span>

            <h1 className="onboarding-title">Select your interests</h1>

            <p className="onboarding-content">Choose topics you care about.</p>

            <div className="intrests-cards">
                {rows.map((row, rowIndex) => (
                    <div className="interests-row" key={rowIndex}>
                        {row.map((item) => (
                            <div
                                key={item.key}
                                className={`interest-card ${selectedInterests.includes(item.key) ? "selected" : ""}`}
                                style={{ "--accent": item.color }}
                                onClick={() => toggle(item.key)}
                                onMouseMove={handleMove}
                            >
                                <div className="icon" style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                                <h3>{item.name}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {selectedInterests.length === 0 && (
                <span className="interests-warning">
                    <Error /> Please select at least one interest
                </span>
            )}

            <div className="intrests-btn">
                <button className="btn goback" onClick={() => setStep(2)}>
                    Back
                </button>
                <button
                    className="btn linear"
                    onClick={() => setStep(4)}
                    disabled={selectedInterests.length === 0}
                >
                    Continue
                </button>
            </div>

        </div>
    );
}