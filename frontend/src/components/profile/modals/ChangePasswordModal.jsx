import { useState } from 'react';
import { changePassword } from '../../../api/Auth';
import './ChangePasswordModal.css';
import { Eye, EyeOff } from 'lucide-react';

function PasswordField({ label, value, onChange, placeholder }) {
    const [show, setShow] = useState(false);
    return (
        <div className="cpm-field">
            <label>{label}</label>
            <div className="cpm-input-wrap">
                
<input
    type={show ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    autoComplete="new-password"
/>
                <button className="cpm-eye" onClick={() => setShow(s => !s)} type="button">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

export default function ChangePasswordModal({ onClose }) {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async () => {
        setError(null);
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (form.newPassword.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await changePassword({ oldPassword: form.currentPassword, newPassword: form.newPassword });
            setSuccess(true);
            setTimeout(onClose, 1500);
        } catch (err) {
            setError(err?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cpm-overlay" onClick={onClose}>
            <div className="cpm-modal" onClick={e => e.stopPropagation()}>

                <div className="cpm-header">
                    <h3>Change Password</h3>
                    <button className="cpm-close" onClick={onClose}>×</button>
                </div>

                <div className="cpm-body">
                    {success ? (
                        <div className="cpm-success">
                            <div className="cpm-success-icon">✓</div>
                            <p>Password changed successfully!</p>
                        </div>
                    ) : (
                        <>
                            <PasswordField
                                label="Current Password"
                                value={form.currentPassword}
                                onChange={set('currentPassword')}
                                placeholder="Enter current password"
                            />
                            <PasswordField
                                label="New Password"
                                value={form.newPassword}
                                onChange={set('newPassword')}
                                placeholder="Min. 8 characters"
                            />
                            <PasswordField
                                label="Confirm New Password"
                                value={form.confirmPassword}
                                onChange={set('confirmPassword')}
                                placeholder="Repeat new password"
                            />

                            {/* Strength indicator */}
                            {form.newPassword && (
                                <PasswordStrength password={form.newPassword} />
                            )}

                            {error && <div className="cpm-error">{error}</div>}
                        </>
                    )}
                </div>

                {!success && (
                    <div className="cpm-footer">
                        <button className="cpm-btn cpm-btn--cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button className="cpm-btn cpm-btn--save" onClick={handleSubmit} disabled={loading}>
                            {loading ? <span className="cpm-spinner" /> : null}
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak',   color: '#EF4444', bars: 1 };
    if (score <= 3) return { label: 'Fair',   color: '#F59E0B', bars: 2 };
    if (score <= 4) return { label: 'Good',   color: '#6366F1', bars: 3 };
    return             { label: 'Strong', color: '#10B981', bars: 4 };
}

function PasswordStrength({ password }) {
    const { label, color, bars } = getStrength(password);
    return (
        <div className="cpm-strength">
            <div className="cpm-strength-bars">
                {[1,2,3,4].map(i => (
                    <div
                        key={i}
                        className="cpm-strength-bar"
                        style={{ background: i <= bars ? color : '#E2E8F0' }}
                    />
                ))}
            </div>
            <span className="cpm-strength-label" style={{ color }}>{label}</span>
        </div>
    );
}