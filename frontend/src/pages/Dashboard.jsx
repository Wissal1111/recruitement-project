import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState } from "react";

export default function Dashboard(){
    const [page,setPage]=useState("home");
return(
    <div className="dashboard">
    <TopNavBar page={page} setPage={setPage}/>
    <SideBar/>
    </div>
)
}