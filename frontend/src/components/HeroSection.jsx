import Hero from '../assets/illustrations/Hero';
import './HeroSection.css'
export default function HeroSection(){
    return(
        <div className="hero-section">
            <div className="blurcircle top"></div>
            <div className="blurcircle bottom"></div>
            <div className="hero-container">
                <div className="hero-text-container">
                    <div className="header">Editorial Intelligence</div>
                 <h1 className="hero-title">
                    Collect feedback.<br/>
                    Make <i>smarter</i><br/>
                    decisions.
                 </h1>
                 <span className='hero-content'>Start creating surveys or join as a participant to share your opinions.<br/>
A sophisticated, editorial-grade environment that treats data
collection as a premium conversation.</span>
               <div className="hero-btns">
                <div className="btn linear shadow">Learn More</div>
                <div className="btn gray">View Samples</div>
               </div>
               <div className="hero-stats">
                <div className="stat">
                    <div className="number">+1200</div>
                    <div className="nb-desc">SURVEY CREATED</div>
                </div>
                <div className="stat">
                    <div className="number">+5000</div>
                    <div className="nb-desc">RESPONSES COLLECTED</div>
                </div>
                <div className="stat">
                    <div className="number">+600</div>
                    <div className="nb-desc">ACTIVE USERS</div>
                </div>
               </div>
            </div>
            <div className="hero-image-container">
                
                <Hero/>
            </div>
            </div>
        </div>
    );
}