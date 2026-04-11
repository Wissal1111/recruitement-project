import './CommunitySection.css';
import pic1 from '../../assets/images/pic1.png';
import pic2 from '../../assets/images/pic2.png';
import pic3 from '../../assets/images/pic3.png';
function Icon(){
    return(
        <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.25 30L10 20C7.25 20 4.89583 19.0208 2.9375 17.0625C0.979167 15.1042 0 12.75 0 10C0 7.25 0.979167 4.89583 2.9375 2.9375C4.89583 0.979166 7.25 0 10 0C12.75 0 15.1042 0.979166 17.0625 2.9375C19.0208 4.89583 20 7.25 20 10C20 10.9583 19.8854 11.8438 19.6562 12.6562C19.4271 13.4688 19.0833 14.25 18.625 15L10 30H4.25ZM26.75 30L32.5 20C29.75 20 27.3958 19.0208 25.4375 17.0625C23.4792 15.1042 22.5 12.75 22.5 10C22.5 7.25 23.4792 4.89583 25.4375 2.9375C27.3958 0.979166 29.75 0 32.5 0C35.25 0 37.6042 0.979166 39.5625 2.9375C41.5208 4.89583 42.5 7.25 42.5 10C42.5 10.9583 42.3854 11.8438 42.1562 12.6562C41.9271 13.4688 41.5833 14.25 41.125 15L32.5 30H26.75ZM10 13.75C10 13.75 10.2604 13.75 10.7812 13.75C11.3021 13.75 11.9271 13.3854 12.6562 12.6562C13.3854 11.9271 13.75 11.0417 13.75 10C13.75 8.95833 13.3854 8.07292 12.6562 7.34375C11.9271 6.61458 11.0417 6.25 10 6.25C8.95833 6.25 8.07292 6.61458 7.34375 7.34375C6.61458 8.07292 6.25 8.95833 6.25 10C6.25 11.0417 6.61458 11.9271 7.34375 12.6562C8.07292 13.3854 8.95833 13.75 10 13.75ZM32.5 13.75C32.5 13.75 32.7604 13.75 33.2812 13.75C33.8021 13.75 34.4271 13.3854 35.1562 12.6562C35.8854 11.9271 36.25 11.0417 36.25 10C36.25 8.95833 35.8854 8.07292 35.1562 7.34375C34.4271 6.61458 33.5417 6.25 32.5 6.25C31.4583 6.25 30.5729 6.61458 29.8438 7.34375C29.1146 8.07292 28.75 8.95833 28.75 10C28.75 11.0417 29.1146 11.9271 29.8438 12.6562C30.5729 13.3854 31.4583 13.75 32.5 13.75Z" fill="#4A4BD7" fill-opacity="0.2"/>
</svg>

    );
}
function Profile({src,name,work}){
    return(
        <div className="community-profile">
           <img src={src} alt="profile-picture" />
           <div className="info">
            <span className="name">{name}</span>
            <span className="work">{work}</span>
           </div>
        </div>
    )
}
function Card({src,name,work,content}){
    return(
        <div className="community-card">
            <div className="top-profile">
                <Profile src={src} name={name} work={work}/>
                <Icon/>
            </div>
            <div className="content">
                <p><i>{content}</i></p>
            </div>
        </div>
    )
}
export default function CommunitySection(){
    return(
        <div className="community-section">
            <h1 className="community-title">
                Voices from the community
            </h1>
            <span className="community-content">
                Trusted by researchers and appreciated by respondents worldwide.
            </span>
            <div className="community-cards">
             <Card src={pic1} name="Sarah Johnson" work="MARKET RESEARCHER" content={<>"The level of audience targeting <br />
LucidCurator provides is unmatched. We <br />
saw a 40% increase in data accuracy within <br />
the first month."</>}/>
             <Card src={pic2} name="David Lee" work="UX SPECIALIST" content={<>"LucidCurator doesn't feel like a survey <br />
tool. It feels like a high-end editorial <br />
platform. Our users actually enjoy the <br />
experience."</>}/>
             <Card src={pic3} name="Emily Davis" work="PARTICIPANT" content={<>"I've joined many platforms, but this is the <br />
first one where I feel like my time is actually <br />
respected. The rewards are fast and <br />
transparent."</>}/>
            </div>
            <div className="big-card">
                <h1>Start collecting insights today</h1>
                <p>Join thousands of researchers and participants shaping the future <br />
                 of information intelligence.</p>
                 <div className="big-card-btns">
                    <button className='btn linear b1'>Create Survey</button>
                    <button className='btn gray b2'>Join as Participant</button>
                 </div>
            </div>
        </div>
    );
}