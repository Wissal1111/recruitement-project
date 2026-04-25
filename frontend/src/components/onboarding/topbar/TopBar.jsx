import './TopBar.css';
import profileImg from '../../../assets/images/user.png';
export default function TopBar({}){
    return(
        <div className="topbar">
            <span>LucidCurator</span>
            <img src={profileImg} alt="profile" />
        </div>
    );
}