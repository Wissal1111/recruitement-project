import Creator from '../../assets/icons/Creator';
import Participant from '../../assets/icons/Participant';
import './RoleSection.css'
function Card({role}){
    const c= role==="CREATOR" ? "creator" : "participant";
    return(
        <div className={`role-card ${c}`}>
            {role==="CREATOR" ? <Creator/> : <Participant/>}
            <span className='role'>{role}</span>
            <span className="description">
  {role === "CREATOR" ? (
    <>
      Create high-impact surveys, define your ideal audience, and<br />
      reward people for their valuable time and intellectual<br />
      contributions.
    </>
  ) : (
    <>
      Answer meaningful surveys, contribute to ground-breaking<br />
      research, and earn rewards for sharing your unique<br />
      perspectives.
    </>
  )}
</span>
            <button className='btn white'>Start {role==="CREATOR" ? "creating" : "earning"}</button>

        </div>
    );
}
export default function RoleSection(){
    return(
        <div className="role-section">
            <h1 className="role-title">
                Choose your journey
            </h1>
            <span className="role-content">
                Whether you're seeking insights or sharing them, LucidCurator provides a curated <br />
experience tailored to your role.
            </span>
            <div className="role-cards">
                <Card role="CREATOR"/>
                <Card role="PARTICIPANT"/>
            </div>

        </div>
    );
}