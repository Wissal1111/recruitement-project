import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRoles } from "../api/Role";

export default function RecruitRouter() {
    const navigate = useNavigate();

    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const isCreator = roles.some(r => r?.roleName === "CREATOR");
                if (isCreator) {
                    navigate("/recruit/surveys", { replace: true });
                } else {
                    navigate("/recruit/become-creator", { replace: true });
                }
            })
            .catch(() => navigate("/home", { replace: true }));
    }, []);

    return null;
}