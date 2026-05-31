import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export default function useMyStudies() {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudy, setSelectedStudy] = useState(null);

    useEffect(() => {
        axiosInstance.get("/studies/my-studies")
            .then(res => {
                const list = res.data?.studies || res.data || [];
                setStudies(list);
                if (list.length > 0) setSelectedStudy(list[0]);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return { studies, loading, selectedStudy, setSelectedStudy };
}