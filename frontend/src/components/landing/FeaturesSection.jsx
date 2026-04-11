import FirstFIcon from '../../assets/icons/FirstFIcon';
import SecondFIcon from '../../assets/icons/SecondFIcon';
import ThirdFIcon from '../../assets/icons/ThirdFIcon';
import FourthFIcon from '../../assets/icons/FourthFIcon';
import './FeaturesSection.css'
function Card({icon, title, content}){
    return(
      <div className="features-card">
        <div className="features-icon">
          {icon}
        </div>
        <h2 className="features-card-title">
          {title}
        </h2>
        <p className="features-card-content">
          {content}
        </p>
      </div>  
    );
}
export default function FeaturesSection(){
    return(
        <div className="features-section">
            <h1 className="features-title">
                Precision-engineered features
            </h1>
            <span className="features-content">
              Every tool in the LucidCurator ecosystem is designed to minimize friction and <br />
                maximize the clarity of your data results.
            </span>
            <div className="features-cards">
                <Card  
                icon={<FirstFIcon/>} 
                title={"Easy survey creation"} 
                content={<>Drag-and-drop builder with<br/>
                editorial-grade templates for <br />
                every research need.</>}/>
                <Card  icon={<SecondFIcon/>} 
                title={<>Smart participant <br />
                matching</>} 
                content={<>Our AI ensures your questions <br />
                reach the most relevant and <br />
                high-quality audience.</>}/>
                <Card  
                icon={<ThirdFIcon/>} 
                title={"Secure payments"} 
                content={<>Instant, automated reward <br />
                distributions through our secure <br />
                financial gateway.</>}/>
                <Card  icon={<FourthFIcon/>} 
                title={"Real-time analytics"} 
                content={<>Watch your insights grow with <br />
                live dashboards and advanced <br />
                sentiment analysis.</>}/>
            </div>

        </div>
    );
}