import './Profile.css';
import { useState } from "react";
import { Country, City } from 'country-state-city';
import { ProfessionIcon, CountryIcon, StudiesIcon, CityIcon } from "../../assets/icons/ProfileIcons";

export default function Profile({ setStep }) {

    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [cities, setCities] = useState([]);

    const countries = Country.getAllCountries();

    const handleCountryChange = (e) => {
        const countryCode = e.target.value;

        setSelectedCountry(countryCode);
        setSelectedCity("");

        const citiesList = City.getCitiesOfCountry(countryCode);
        console.log("Cities:", citiesList);

        setCities(citiesList || []);
    };

    return(
        <div className="onboarding-profile">
            <span className="step-label">
                STEP 3 OF 4 
                <div className="point"></div> 
                50% COMPLETE
            </span>

            <h1 className="onboarding-title" id='tt1'>
                Complete your <div className='highlight'>professional</div> profile.
            </h1>
            <h1 className="onboarding-title" id='tt2'>
            <div className='highlight'>Professional</div> profile.
            </h1>

            <p className="onboarding-content">
                Tell us a bit more about your background so we can curate the right
                surveys for your expertise.
            </p>

            <div className="profile-form">

                {/* ROW 1 */}
                <div className="input-row">
                    
                    <div className="input-grp">
                        <ProfessionIcon />
                        <label htmlFor="profession">PROFESSION</label>
                        <input 
                            type="text" 
                            name='profession' 
                            placeholder="e.g. UX Designer"
                        />
                    </div>

                    <div className="input-grp">
                        <StudiesIcon />
                        <label htmlFor="studies">LEVEL OF STUDIES</label>
                        <select name='studies'>
                            <option value="">Select Level</option>
                            <option value="Bachelor">Bachelor's Degree</option>
                            <option value="Master">Master's Degree</option>
                            <option value="PhD">PhD</option>
                        </select>
                    </div>

                </div>

                {/* ROW 2 */}
                <div className="input-row">

                    {/* COUNTRY */}
                    <div className="input-grp">
                        <CountryIcon />
                        <label htmlFor="country">COUNTRY</label>
                        <select 
                            name='country' 
                            value={selectedCountry}
                            onChange={handleCountryChange}
                        >
                            <option value="">Select Country</option>
                            {countries.map((c) => (
                                <option key={c.isoCode} value={c.isoCode}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CITY */}
                    <div className="input-grp">
                        <CityIcon />
                        <label htmlFor="city">CITY</label>
                        <select
                            name='city'
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedCountry}
                        >
                            <option value="">
                                {selectedCountry ? "Select City" : "Select country first"}
                            </option>

                            {cities.length > 0 ? (
                                cities.map((city, index) => (
                                    <option key={index} value={city.name}>
                                        {city.name}
                                    </option>
                                ))
                            ) : selectedCountry ? (
                                <option disabled>No cities available</option>
                            ) : null}
                        </select>
                    </div>

                </div>
                <div className="line"></div>
                {/* BUTTONS */}
                <div className="profile-btn">
                    <button className="btn goback" onClick={() => setStep(2)}>
                        Back
                    </button>

                    <button 
                        className="btn linear"
                        onClick={() => {
                            setStep(4);
                        }}
                    >
                        Continue
                    </button>
                </div>

            </div>
        </div>
    );
}