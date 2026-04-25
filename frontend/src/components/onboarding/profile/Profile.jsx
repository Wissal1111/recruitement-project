import './Profile.css';
import { useState } from "react";
import { Country, City } from 'country-state-city';
import { ProfessionIcon, CountryIcon, StudiesIcon, CityIcon } from "../../../assets/icons/ProfileIcons";

export default function Profile({
    setStep,
    setCountry,
    setCity,
    setProfession,
    setEducation
}) {

    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedEducation, setSelectedEducation] = useState("");
    const [cities, setCities] = useState([]);

    const countries = Country.getAllCountries();

    const handleCountryChange = (e) => {
    const countryCode = e.target.value;

    const country = countries.find(
        (c) => c.isoCode === countryCode
    );

    setSelectedCountry(countryCode);
    setSelectedCity("");

    // ✅ SAVE NAME ONLY
    setCountry(country?.name || "");

    const citiesList = City.getCitiesOfCountry(countryCode);
    setCities(citiesList || []);
};

    return (
        <div className="onboarding-profile">

            <span className="step-label">
                STEP 4 OF 5 
                <div className="point"></div> 
                60% COMPLETE
            </span>

            <h1 className="onboarding-title" id='tt1'>
                Complete your <div className='highlight'>professional</div> profile.
            </h1>

            <h1 className="onboarding-title" id='tt2'>
                <div className='highlight'>Professional</div> profile.
            </h1>

            <p className="onboarding-content">
                Tell us more about your background so we can curate the right surveys.
            </p>

            <div className="profile-form">

                {/* ROW 1 */}
                <div className="input-row">

                    <div className="input-grp">
                        <ProfessionIcon />
                        <label>PROFESSION</label>
                        <input
                            type="text"
                            placeholder="e.g. Software Engineer"
                            onChange={(e) => setProfession(e.target.value)} // ✅ FIXED
                        />
                    </div>

                    <div className="input-grp">
                        <StudiesIcon />
                        <label>EDUCATION LEVEL</label>

                        <select
                            value={selectedEducation}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedEducation(value);
                                setEducation(value); // ✅ send to parent
                            }}
                        >
                            <option value="">Select Education</option>
                            <option value="High School">High School Diploma</option>
                            <option value="Associate">Associate Degree</option>
                            <option value="Bachelor">Bachelor's Degree</option>
                            <option value="Master">Master's Degree</option>
                            <option value="PhD">Doctorate (PhD)</option>
                            <option value="Bootcamp">Bootcamp / Certification</option>
                        </select>
                    </div>

                </div>

                {/* ROW 2 */}
                <div className="input-row">

                    {/* COUNTRY */}
                    <div className="input-grp">
                        <CountryIcon />
                        <label>COUNTRY</label>

                        <select
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
                        <label>CITY</label>

                        <select
                            value={selectedCity}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedCity(value);
                                setCity(value); // ✅ send to parent
                            }}
                            disabled={!selectedCountry}
                        >
                            <option value="">
                                {selectedCountry ? "Select City" : "Select country first"}
                            </option>

                            {cities.map((city, index) => (
                                <option key={index} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="line"></div>

                {/* BUTTONS */}
                <div className="profile-btn">

                    <button className="btn goback" onClick={() => setStep(3)}>
                        Back
                    </button>

                    <button
                        className="btn linear"
                        onClick={() => setStep(5)}
                    >
                        Continue
                    </button>

                </div>

            </div>
        </div>
    );
}