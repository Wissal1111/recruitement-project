import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { useState, useEffect } from "react";
import { clearSession, getSession } from "../../utils/AuthSession";
import { useNavigate } from "react-router-dom";
import Info from "../../components/profile/info/Info";
import Biography from "../../components/profile/biography/Biography";
import BottomCards from "../../components/profile/bottomcards/BottomCards";
import { getProfile } from "../../api/ProfileApi";
import { logoutUser } from "../../api/Auth";
import EditProfileModal from "../../components/profile/modals/EditProfileModal";
import ChangePasswordModal from "../../components/profile/modals/ChangePasswordModal";
import "./Profile.css";

function ProfileSkeleton() {
    return (
        <div className="profile-skeleton">
            <div className="skeleton-card skeleton-info">
                <div className="skeleton-avatar" />
                <div className="skeleton-info-text">
                    <div className="skeleton-line skeleton-line--name" />
                    <div className="skeleton-line skeleton-line--sub" />
                    <div className="skeleton-badges">
                        <div className="skeleton-badge" />
                        <div className="skeleton-badge" />
                    </div>
                </div>
            </div>
            <div className="skeleton-bio-row">
                <div className="skeleton-card skeleton-bio">
                    <div className="skeleton-line skeleton-line--label" />
                    <div className="skeleton-bio-fields">
                        <div className="skeleton-field">
                            <div className="skeleton-line skeleton-line--xs" />
                            <div className="skeleton-line skeleton-line--md" />
                        </div>
                        <div className="skeleton-field">
                            <div className="skeleton-line skeleton-line--xs" />
                            <div className="skeleton-line skeleton-line--md" />
                        </div>
                    </div>
                    <div className="skeleton-divider" />
                    <div className="skeleton-line skeleton-line--xs" />
                    <div className="skeleton-line skeleton-line--full" />
                    <div className="skeleton-line skeleton-line--lg" />
                </div>
                <div className="skeleton-card skeleton-interests">
                    <div className="skeleton-line skeleton-line--label" />
                    <div className="skeleton-tags">
                        <div className="skeleton-tag skeleton-tag--md" />
                        <div className="skeleton-tag skeleton-tag--sm" />
                        <div className="skeleton-tag skeleton-tag--lg" />
                        <div className="skeleton-tag skeleton-tag--sm" />
                        <div className="skeleton-tag skeleton-tag--md" />
                    </div>
                </div>
            </div>
            <div className="skeleton-bottom-row">
                <div className="skeleton-card skeleton-bottom-card">
                    <div className="skeleton-line skeleton-line--xs" />
                    <div className="skeleton-line skeleton-line--md" />
                </div>
                <div className="skeleton-card skeleton-bottom-card">
                    <div className="skeleton-line skeleton-line--xs" />
                    <div className="skeleton-line skeleton-line--md" />
                </div>
                <div className="skeleton-card skeleton-bottom-card">
                    <div className="skeleton-line skeleton-line--xs" />
                    <div className="skeleton-line skeleton-line--md" />
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        console.log("📦 Session on mount:", getSession());
        getProfile()
            .then(data => {
                console.log("interests shape:", data?.profile?.interests);
                setProfile(data);
            })
            .catch(err => console.log("getProfile error:", err))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        const { refreshToken } = getSession();
        await logoutUser(refreshToken); // revoke on server
        clearSession();
        navigate("/login");
    };

    // Merge saved data back into profile state without a full refetch
    const handleProfileSaved = (savedData) => {
        setProfile(prev => ({
            ...prev,
            firstname: savedData.firstname ?? prev.firstname,
            lastname:  savedData.lastname  ?? prev.lastname,
            profile: {
                ...prev.profile,
                ...(savedData.profile ?? savedData),
            }
        }));
    };

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
                {loading ? (
                    <ProfileSkeleton />
                ) : (
                    <>
                        <Info
                            firstName={profile?.firstname}
                            LastName={profile?.lastname}
                            Profession={profile?.profile?.profession}
                            roles={profile?.roles?.map(r => r.role?.name) || []}
                            onEditProfile={() => setShowEditModal(true)}
                        />

                        <Biography
                            email={profile?.email}
                            location={`${profile?.profile?.city || ""}, ${profile?.profile?.country || ""}`}
                            bio={profile?.profile?.bio}
                            interests={profile?.profile?.interests || []}
                        />

                        <BottomCards
                            onLogout={logout}
                            onChangePassword={() => setShowPasswordModal(true)}
                            education={profile?.profile?.education}
                            dateOfBirth={profile?.profile?.dateOfBirth}
                        />
                    </>
                )}
            </div>

            {showEditModal && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEditModal(false)}
                    onSaved={handleProfileSaved}
                />
            )}

            {showPasswordModal && (
                <ChangePasswordModal
                    onClose={() => setShowPasswordModal(false)}
                />
            )}
        </>
    );
}