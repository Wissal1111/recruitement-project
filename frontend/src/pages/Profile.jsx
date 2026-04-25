import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState } from "react";
import { clearSession } from "../utils/AuthSession"
import { useNavigate } from "react-router-dom";
import Info from "../components/profile/info/Info";
import Biography from "../components/profile/biography/Biography";
import BottomCards from "../components/profile/bottomcards/BottomCards";
import { getProfile } from "../api/ProfileApi";
import { useEffect } from "react";

export default function Profile() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    const logout = () => {
        clearSession();
        navigate("/login");
    };

    function SaveData(data) {
        setProfile(data);
    }

    useEffect(() => {
        getProfile()
            .then(data => SaveData(data))
            .catch(err => console.log(err));
    }, []);

    return (
        <>
            <TopNavBar
                page="home"
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <SideBar
                page="profile"
                part="home"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="wrapper">
                <Info
                    firstName={profile?.firstname}
                    LastName={profile?.lastname}
                    Profession={profile?.profile?.profession}
                    roles={profile?.roles?.map(r => r.role?.name) || []}
                />

                <Biography
    email={profile?.email}
    location={
        `${profile?.profile?.city || ""}, ${profile?.profile?.country || ""}`
    }
    bio={profile?.profile?.bio}
    interests={profile?.profile?.interests || []}
/>

               <BottomCards
    onLogout={logout}
    education={profile?.profile?.education}
    dateOfBirth={profile?.profile?.dateOfBirth}
/>
            </div>
        </>
    );
}