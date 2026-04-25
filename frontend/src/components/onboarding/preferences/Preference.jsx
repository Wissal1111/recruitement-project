import './Preference.css';
import socialsImg from '../../../assets/images/socials.png';
function WhyIcon(){
    return(<svg width="25" height="28" viewBox="0 0 25 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0054 23.7123C12.0054 23.7123 11.8718 23.7123 11.6046 23.7123C11.3373 23.7123 11.0134 23.522 10.6327 23.1414C10.2521 22.7608 10.0618 22.3032 10.0618 21.7687H13.9491C13.9491 22.3032 13.7587 22.7608 13.3781 23.1414C12.9975 23.522 12.5399 23.7123 12.0054 23.7123ZM8.11816 20.7969V18.8533H15.8927V20.7969H8.11816ZM8.36111 17.8814C7.24352 17.2174 6.35674 16.3265 5.70076 15.2089C5.04479 14.0913 4.7168 12.8766 4.7168 11.5646C4.7168 9.54 5.42541 7.81908 6.84265 6.40184C8.25988 4.98461 9.98081 4.27599 12.0054 4.27599C14.03 4.27599 15.751 4.98461 17.1682 6.40184C18.5854 7.81908 19.2941 9.54 19.2941 11.5646C19.2941 12.8766 18.9661 14.0913 18.3101 15.2089C17.6541 16.3265 16.7673 17.2174 15.6497 17.8814H8.36111ZM8.9442 15.9378H15.0667C15.7955 15.4195 16.3584 14.7797 16.7552 14.0185C17.152 13.2572 17.3504 12.4393 17.3504 11.5646C17.3504 10.0745 16.8321 8.81114 15.7955 7.77453C14.7589 6.73793 13.4955 6.21963 12.0054 6.21963C10.5153 6.21963 9.25195 6.73793 8.21534 7.77453C7.17873 8.81114 6.66043 10.0745 6.66043 11.5646C6.66043 12.4393 6.85884 13.2572 7.25567 14.0185C7.6525 14.7797 8.21534 15.4195 8.9442 15.9378Z" fill="#4A4BD7"/>
</svg>
)
}
export default function Preference({ setStep , handleSubmitProfile}) {
    return(
        <div className="preference">
            <span className="step-label">
                STEP 5 OF 5 
                <div className="point"></div> 
                80% COMPLETE
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
                    <button className="btn goback" onClick={() => setStep(4)}>
                        Back
                    </button>

                    <button 
                        className="btn linear"
                        onClick={handleSubmitProfile}
                    >
                        Complete Setup
                    </button>
                </div>

                </div>
                <div className="preference-overview">
                         <img src={socialsImg} alt="socials" />
                         <div className="why-ask">
                            <WhyIcon/>
                           <h3>Why we ask?</h3>
                           <p>We use this data to prioritize
feature development for the
platforms you use most. All data
is anonymized.</p>
                         </div>
                    </div>
            </div>
            </div>
    );  
}