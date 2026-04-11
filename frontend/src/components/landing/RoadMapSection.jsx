import './RoadMapSection.css';
function Line({color}){
    return(
        <svg width="48" height="1" viewBox="0 0 48 1" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="1" fill={color}/>
</svg>

    )
}
function Circle({number}){
    return(
        <div className="circle">
            <span>{number}</span>
        </div>
    )
}
function RoadMapItem({number, title, description}){
    return(
        <div className="roadmap-item">
            <Circle number={number}/>
           <div className="roadmap-item-content">
             <h2 className="roadmap-title">{title}</h2>
            <p className="roadmap-description">{description}</p>
           </div>
        </div>
    )
}
export default function RoadMapSection(){
    return(
        <div className="roadmap-section">
            <div className="roadmap-container">
                <span className="creator-title"><Line color="#4A4BD7"/>CREATOR ROADMAP</span>
                <div className="roadmap">
                    <div className="grayline"></div>
                    <RoadMapItem number="1" title={"Create"} description={"Design your survey with ease"}/>
                    <RoadMapItem number={2} title={"Set criteria"} description={"Target specific demographics"}/>
                    <RoadMapItem number={3} title={"Publish"} description={"Launch to our global network"}/>
                    <RoadMapItem number={4} title={"Get responses"} description={"Receive high-quality data"}/>
                </div>
            <span className="participant-title"><Line color="#4C5B9C"/>PARTICIPANT ROADMAP</span>
            <div className="roadmap">
                    <div className="grayline"></div>
                    <RoadMapItem number={1} title={"Sign up"} description={"Join the curated community"}/>
                    <RoadMapItem number={2} title={"Profile"} description={"Complete  your persona data"}/>
                    <RoadMapItem number={3} title={"Join"} description={"Select surveys that fit you"}/>
                    <RoadMapItem number={4} title={"Earn"} description={"Get paid for your honesty"}/>
                </div>
            </div>
        </div>
    );
}