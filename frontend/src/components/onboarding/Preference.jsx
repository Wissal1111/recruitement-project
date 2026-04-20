import './Preference.css';
import socialsImg from '../../assets/images/socials.png';
export default function Preference({ setStep }) {
    return(
        <div className="preference">
            <span className="step-label">
                STEP 4 OF 4 
                <div className="point"></div> 
                75% COMPLETE
            </span>
             <h1 className="onboarding-title" >
               Help us know you better
            </h1>
            

            
            <div className="preference-container">
                <div className="preference-form">
                    <div className="input">
                        <label htmlFor="socials" className='lbl'>MOST USED SOCIAL MEDIA PLATFORMS</label>
                    <select type="text" id="socials" name="socials" placeholder="e.g., Twitter, Instagram, LinkedIn" >
                        <option value="">Select a platform</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="instagram">Tik Tok</option>
                        <option value="linkedin">LinkedIn</option>
                    </select>
                    </div>
                    <div className="input">
                        <label htmlFor="socials" className='lbl'>USAGE FREQUENCY</label>
                  
<div className="radio-inputs">

  <label className="radio">
    <input type="radio" name="radio" value="low" defaultChecked />
    <span className="name">Low</span>
  </label>

  <label className="radio">
    <input type="radio" name="radio" value="medium" />
    <span className="name">Medium</span>
  </label>

  <label className="radio">
    <input type="radio" name="radio" value="high" />
    <span className="name">High</span>
  </label>

</div>
                    </div>
                    <div className="input">
                        <label htmlFor="socials" className='lbl'>HOW DID YOU HEAR ABOUT US?</label>
                    <input type="text" id="socials" name="socials" placeholder="e.g. Professional network, Newsletter, Podcast..." />
                        
                    </div>
                     <div className="preference-btn">
                    <button className="btn goback" onClick={() => setStep(3)}>
                        Back
                    </button>

                    <button 
                        className="btn linear"
                    >
                        Continue
                    </button>
                </div>

                </div>
                <div className="preference-overview">
                         <img src={socialsImg} alt="socials" />
                    </div>
            </div>
            </div>
    );  
}