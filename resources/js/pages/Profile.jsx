import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';

function Toast({ message, type, onClose }) {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div className="profile-toast" style={{ background: isError ? '#fef2f2' : '#f0fdf4', borderColor: isError ? '#fca5a5' : '#86efac' }}>
            <i className={`fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}`}
               style={{ color: isError ? '#dc2626' : '#16a34a' }}></i>
            <span style={{ color: isError ? '#991b1b' : '#15803d' }}>{message}</span>
            <button onClick={onClose} className="profile-toast-close"><i className="fas fa-times"></i></button>
        </div>
    );
}

export default function Profile() {
    const { user, updateProfile, updatePassword, logout, can } = useAuth();
    const navigate = useNavigate();

    // Profile form
    const [profile, setProfile]         = useState({ name: user?.name || '', email: user?.email || '' });
    const [profileErrors, setProfileErrors] = useState({});
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileToast, setProfileToast]     = useState(null);

    // Password form
    const [pwd, setPwd]               = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwdErrors, setPwdErrors]   = useState({});
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdToast, setPwdToast]     = useState(null);
    const [showPwd, setShowPwd]       = useState({ current: false, new: false, confirm: false });

    const handleProfile = e => setProfile({ ...profile, [e.target.name]: e.target.value });
    const handlePwd     = e => setPwd({ ...pwd, [e.target.name]: e.target.value });

    const submitProfile = async e => {
        e.preventDefault();
        setProfileErrors({});
        setProfileLoading(true);
        try {
            await updateProfile(profile.name, profile.email);
            setProfileToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setProfileErrors(err.errors || {});
            setProfileToast({ message: err.message || 'Update failed.', type: 'error' });
        } finally {
            setProfileLoading(false);
        }
    };

    const submitPassword = async e => {
        e.preventDefault();
        setPwdErrors({});
        setPwdLoading(true);
        try {
            await updatePassword(pwd.current_password, pwd.password, pwd.password_confirmation);
            setPwd({ current_password: '', password: '', password_confirmation: '' });
            setPwdToast({ message: 'Password changed! Please log in again.', type: 'success' });
            setTimeout(async () => {
                await logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setPwdErrors(err.errors || {});
            setPwdToast({ message: err.message || 'Password change failed.', type: 'error' });
        } finally {
            setPwdLoading(false);
        }
    };

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="db-wrap">
            {/* SIDEBAR */}
            <DashboardSidebar />

            {/* MAIN */}
            <div className="db-main">
                <DashboardNavbar page="My Profile" />

                {/* CONTENT */}
                <div className="db-content">
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">My Profile</h1>
                            <p className="db-page-sub">Manage your account information and security</p>
                        </div>
                    </div>

                    <div className="profile-grid">

                        {/* ── LEFT: Avatar card ── */}
                        <div className="profile-avatar-card">
                            <div className="profile-avatar-wrap">
                                <div className="profile-avatar-circle">{initials}</div>
                                <div className="profile-avatar-ring"></div>
                            </div>
                            <h3 className="profile-avatar-name">{user?.name}</h3>
                            <p className="profile-avatar-email">{user?.email}</p>
                            <span className="profile-role-badge"><i className="fas fa-shield-alt"></i> {user?.role?.name ?? 'Super Admin'}</span>
                            <div className="profile-meta">
                                <div className="profile-meta-item">
                                    <i className="fas fa-id-badge"></i>
                                    <div>
                                        <small>User ID</small>
                                        <span>#{user?.id}</span>
                                    </div>
                                </div>
                                <div className="profile-meta-item">
                                    <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                                    <div>
                                        <small>Account Status</small>
                                        <span style={{ color: '#10b981' }}>Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Forms ── */}
                        <div className="profile-forms">

                            {/* Personal Info */}
                            <div className="profile-card">
                                <div className="profile-card-head">
                                    <div className="profile-card-icon" style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)' }}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <h4>Personal Information</h4>
                                        <p>Update your name and email address</p>
                                    </div>
                                </div>

                                <Toast
                                    message={profileToast?.message}
                                    type={profileToast?.type}
                                    onClose={() => setProfileToast(null)}
                                />

                                <form onSubmit={submitProfile} className="profile-form">
                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label>Full Name</label>
                                            <div className="profile-input-wrap">
                                                <i className="fas fa-user"></i>
                                                <input
                                                    type="text" name="name" required
                                                    placeholder="Your full name"
                                                    value={profile.name} onChange={handleProfile}
                                                />
                                            </div>
                                            {profileErrors.name && <span className="profile-error">{profileErrors.name[0]}</span>}
                                        </div>
                                        <div className="profile-field">
                                            <label>Email Address</label>
                                            <div className="profile-input-wrap">
                                                <i className="fas fa-envelope"></i>
                                                <input
                                                    type="email" name="email" required
                                                    placeholder="you@example.com"
                                                    value={profile.email} onChange={handleProfile}
                                                />
                                            </div>
                                            {profileErrors.email && <span className="profile-error">{profileErrors.email[0]}</span>}
                                        </div>
                                    </div>
                                    <div className="profile-form-footer">
                                        <button type="submit" className="profile-btn-save" disabled={profileLoading}>
                                            {profileLoading
                                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                                : <><i className="fas fa-save"></i> Save Changes</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Change Password */}
                            <div className="profile-card">
                                <div className="profile-card-head">
                                    <div className="profile-card-icon" style={{ background: 'linear-gradient(135deg,#8b5cf6,#a855f7)' }}>
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <div>
                                        <h4>Change Password</h4>
                                        <p>Use a strong password of at least 8 characters</p>
                                    </div>
                                </div>

                                <Toast
                                    message={pwdToast?.message}
                                    type={pwdToast?.type}
                                    onClose={() => setPwdToast(null)}
                                />

                                <form onSubmit={submitPassword} className="profile-form">
                                    {/* Current password */}
                                    <div className="profile-field">
                                        <label>Current Password</label>
                                        <div className="profile-input-wrap">
                                            <i className="fas fa-lock"></i>
                                            <input
                                                type={showPwd.current ? 'text' : 'password'}
                                                name="current_password" required
                                                placeholder="Enter your current password"
                                                value={pwd.current_password} onChange={handlePwd}
                                            />
                                            <button type="button" className="profile-eye" onClick={() => setShowPwd(s => ({ ...s, current: !s.current }))}>
                                                <i className={`fas fa-eye${showPwd.current ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                        {pwdErrors.current_password && <span className="profile-error">{pwdErrors.current_password[0]}</span>}
                                    </div>

                                    <div className="profile-form-row">
                                        {/* New password */}
                                        <div className="profile-field">
                                            <label>New Password</label>
                                            <div className="profile-input-wrap">
                                                <i className="fas fa-key"></i>
                                                <input
                                                    type={showPwd.new ? 'text' : 'password'}
                                                    name="password" required
                                                    placeholder="Min. 8 characters"
                                                    value={pwd.password} onChange={handlePwd}
                                                />
                                                <button type="button" className="profile-eye" onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))}>
                                                    <i className={`fas fa-eye${showPwd.new ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>
                                            {pwdErrors.password && <span className="profile-error">{pwdErrors.password[0]}</span>}
                                        </div>

                                        {/* Confirm password */}
                                        <div className="profile-field">
                                            <label>Confirm New Password</label>
                                            <div className="profile-input-wrap">
                                                <i className="fas fa-key"></i>
                                                <input
                                                    type={showPwd.confirm ? 'text' : 'password'}
                                                    name="password_confirmation" required
                                                    placeholder="Repeat new password"
                                                    value={pwd.password_confirmation} onChange={handlePwd}
                                                />
                                                <button type="button" className="profile-eye" onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))}>
                                                    <i className={`fas fa-eye${showPwd.confirm ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strength hint */}
                                    {pwd.password && (
                                        <PasswordStrength password={pwd.password} />
                                    )}

                                    <div className="profile-form-footer">
                                        <button type="submit" className="profile-btn-save profile-btn-purple" disabled={pwdLoading}>
                                            {pwdLoading
                                                ? <><i className="fas fa-circle-notch fa-spin"></i> Updating…</>
                                                : <><i className="fas fa-lock"></i> Update Password</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>{/* /profile-forms */}
                    </div>{/* /profile-grid */}
                </div>{/* /db-content */}
            </div>{/* /db-main */}
        </div>
    );
}

function PasswordStrength({ password }) {
    const checks = [
        { label: 'At least 8 characters', pass: password.length >= 8 },
        { label: 'Contains a number',     pass: /\d/.test(password) },
        { label: 'Contains uppercase',    pass: /[A-Z]/.test(password) },
        { label: 'Contains symbol',       pass: /[^a-zA-Z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.pass).length;
    const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return (
        <div className="pwd-strength">
            <div className="pwd-strength-bars">
                {[0,1,2,3].map(i => (
                    <div key={i} className="pwd-strength-bar" style={{ background: i < score ? colors[score - 1] : '#e5e7eb' }}></div>
                ))}
            </div>
            <span className="pwd-strength-label" style={{ color: colors[score - 1] || '#aaa' }}>
                {score > 0 ? labels[score - 1] : 'Too short'}
            </span>
            <div className="pwd-checks">
                {checks.map(c => (
                    <div key={c.label} className="pwd-check" style={{ color: c.pass ? '#10b981' : '#aaa' }}>
                        <i className={`fas fa-${c.pass ? 'check' : 'times'}-circle`}></i> {c.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
