import { useState, useEffect } from 'react';
import { updateProfile } from '../../../api/ProfileApi';
import './EditProfileModal.css';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
const EDUCATION_OPTIONS = ['High School', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'];

export default function EditProfileModal({ profile, onClose, onSaved }) {
    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        profession: '',
        bio: '',
        city: '',
        country: '',
        gender: '',
        education: '',
        dateOfBirth: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (profile) {
            setForm({
                firstname:   profile.firstname   || '',
                lastname:    profile.lastname    || '',
                profession:  profile.profile?.profession  || '',
                bio:         profile.profile?.bio         || '',
                city:        profile.profile?.city        || '',
                country:     profile.profile?.country     || '',
                gender:      profile.profile?.gender      || '',
                education:   profile.profile?.education   || '',
                dateOfBirth: profile.profile?.dateOfBirth
                    ? new Date(profile.profile.dateOfBirth).toISOString().split('T')[0]
                    : '',
            });
        }
    }, [profile]);

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await updateProfile(form);
            onSaved(data);
            onClose();
        } catch (err) {
            setError(err?.message || 'Failed to save changes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="epm-overlay" onClick={onClose}>
            <div className="epm-modal" onClick={e => e.stopPropagation()}>

                <div className="epm-header">
                    <h3>Edit Profile</h3>
                    <button className="epm-close" onClick={onClose}>×</button>
                </div>

                <div className="epm-body">

                    <div className="epm-section-label">Personal Info</div>
                    <div className="epm-row">
                        <div className="epm-field">
                            <label>First Name</label>
                            <input value={form.firstname} onChange={set('firstname')} placeholder="First name" />
                        </div>
                        <div className="epm-field">
                            <label>Last Name</label>
                            <input value={form.lastname} onChange={set('lastname')} placeholder="Last name" />
                        </div>
                    </div>

                    <div className="epm-row">
                        <div className="epm-field">
                            <label>Profession</label>
                            <input value={form.profession} onChange={set('profession')} placeholder="e.g. Software Engineer" />
                        </div>
                        <div className="epm-field">
                            <label>Gender</label>
                            <select value={form.gender} onChange={set('gender')}>
                                <option value="">Select gender</option>
                                {GENDER_OPTIONS.map(g => (
                                    <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="epm-row">
                        <div className="epm-field">
                            <label>Date of Birth</label>
                            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                        </div>
                        <div className="epm-field">
                            <label>Education</label>
                            <select value={form.education} onChange={set('education')}>
                                <option value="">Select education</option>
                                {EDUCATION_OPTIONS.map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="epm-section-label">Location</div>
                    <div className="epm-row">
                        <div className="epm-field">
                            <label>City</label>
                            <input value={form.city} onChange={set('city')} placeholder="City" />
                        </div>
                        <div className="epm-field">
                            <label>Country</label>
                            <input value={form.country} onChange={set('country')} placeholder="Country" />
                        </div>
                    </div>

                    <div className="epm-section-label">About</div>
                    <div className="epm-field epm-field--full">
                        <label>Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={set('bio')}
                            placeholder="Write a short bio..."
                            rows={4}
                        />
                    </div>

                    {error && <div className="epm-error">{error}</div>}
                </div>

                <div className="epm-footer">
                    <button className="epm-btn epm-btn--cancel" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="epm-btn epm-btn--save" onClick={handleSubmit} disabled={loading}>
                        {loading ? <span className="epm-spinner" /> : null}
                        {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
}