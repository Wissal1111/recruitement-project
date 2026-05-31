import './Intrests.css';
import { useState } from 'react';
import { 
    FaMicrochip, FaHeartbeat, FaGraduationCap, FaBriefcase,
    FaGamepad, FaMusic, FaDumbbell, FaUtensils,
    FaFlask, FaPaintBrush, FaChartLine, FaLeaf,
    FaPlane, FaFilm, FaTshirt, FaBook
} from "react-icons/fa";
import Error from '../../../assets/icons/Error';

const PAGE_1 = [
    { name: "Technology", desc: "AI, SaaS, infrastructure", icon: <FaMicrochip />,     color: "#4A4BD7", key: "Technology" },
    { name: "Health",     desc: "Wellness and biotech",     icon: <FaHeartbeat />,     color: "#EC4899", key: "Health" },
    { name: "Education",  desc: "Learning & research",      icon: <FaGraduationCap />, color: "#F59E0B", key: "Education" },
    { name: "Business",   desc: "Markets & strategy",       icon: <FaBriefcase />,     color: "#caec36", key: "Business" },
    { name: "Gaming",     desc: "Entertainment & esports",  icon: <FaGamepad />,       color: "#8B5CF6", key: "Gaming" },
    { name: "Music",      desc: "Audio & culture",          icon: <FaMusic />,         color: "#F43F5E", key: "Music" },
    { name: "Fitness",    desc: "Sport & wellness",         icon: <FaDumbbell />,      color: "#22C55E", key: "Fitness" },
    { name: "Food",       desc: "Cooking & cuisine",        icon: <FaUtensils />,      color: "#F97316", key: "Food" },
];

const PAGE_2 = [
    { name: "Science",   desc: "Physics, bio & space",   icon: <FaFlask />,      color: "#06B6D4", key: "Science" },
    { name: "Design",    desc: "UI/UX & visual arts",    icon: <FaPaintBrush />, color: "#A855F7", key: "Design" },
    { name: "Finance",   desc: "Investing & crypto",     icon: <FaChartLine />,  color: "#EAB308", key: "Finance" },
    { name: "Nature",    desc: "Ecology & outdoors",     icon: <FaLeaf />,       color: "#10B981", key: "Nature" },
    { name: "Travel",    desc: "Destinations & culture", icon: <FaPlane />,      color: "#F87171", key: "Travel" },
    { name: "Film & TV", desc: "Cinema & streaming",     icon: <FaFilm />,       color: "#60A5FA", key: "Film & TV" },
    { name: "Fashion",   desc: "Style & trends",         icon: <FaTshirt />,     color: "#FB7185", key: "Fashion" },
    { name: "Books",     desc: "Literature & writing",   icon: <FaBook />,       color: "#34D399", key: "Books" },
];

const groupRows = (list) => {
    const rows = [];
    let i = 0;
    const pattern = [3, 2, 3];
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
    const [page, setPage] = useState(0);

    const currentList = page === 0 ? PAGE_1 : PAGE_2;
    const rows = groupRows(currentList);

    const toggle = (key) => {
        setSelectedInterests((prev) =>
            prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
        );
    };

    const handleMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };

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

            <div className="slider-nav">
                <button className="nav-arrow" onClick={() => setPage(0)} disabled={page === 0}>‹</button>
                <div className="page-dots">
                    <div className={`dot ${page === 0 ? "active" : ""}`} onClick={() => setPage(0)} />
                    <div className={`dot ${page === 1 ? "active" : ""}`} onClick={() => setPage(1)} />
                </div>
                <button className="nav-arrow" onClick={() => setPage(1)} disabled={page === 1}>›</button>
            </div>

            {selectedInterests.length === 0 && (
                <span className="interests-warning">
                    <Error /> Please select at least one interest
                </span>
            )}

            <div className="intrests-btn">
                <button className="btn goback" onClick={() => setStep(2)}>Back</button>
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