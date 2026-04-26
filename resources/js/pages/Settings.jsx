import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';
import RichTextEditor from '../components/RichTextEditor';

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

export default function Settings() {
    const { user, token, logout, can } = useAuth();

    const [form, setForm] = useState({
        company_name:    '',
        company_address: '',
        company_vision:  '',
        company_mission: '',
        company_phone:   '',
        company_email:   '',
        company_kra_pin: '',
        facebook_link:   '',
        instagram_link:  '',
        youtube_link:    '',
        linkedin_link:   '',
        twitter_link:    '',
        theme_primary:   '#fe730c',
        theme_navy:      '#081f4e',
    });
    const [logoFile, setLogoFile]     = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [existingLogo, setExistingLogo] = useState(null);
    const [errors, setErrors]         = useState({});
    const [loading, setLoading]       = useState(false);
    const [fetching, setFetching]     = useState(true);
    const [toast, setToast]           = useState(null);
    const [removingLogo, setRemovingLogo] = useState(false);
    const logoInputRef                = useRef(null);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    /* ── Load existing settings ── */
    useEffect(() => {
        fetch('/api/settings', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(data => {
                setForm({
                    company_name:    data.company_name    || '',
                    company_address: data.company_address || '',
                    company_vision:  data.company_vision  || '',
                    company_mission: data.company_mission || '',
                    company_phone:   data.company_phone   || '',
                    company_email:   data.company_email   || '',
                    company_kra_pin: data.company_kra_pin || '',
                    facebook_link:   data.facebook_link   || '',
                    instagram_link:  data.instagram_link  || '',
                    youtube_link:    data.youtube_link    || '',
                    linkedin_link:   data.linkedin_link   || '',
                    twitter_link:    data.twitter_link    || '',
                    theme_primary:   data.theme_primary   || '#fe730c',
                    theme_navy:      data.theme_navy      || '#081f4e',
                });
                setExistingLogo(data.company_logo_url || null);
            })
            .catch(() => setToast({ message: 'Failed to load settings.', type: 'error' }))
            .finally(() => setFetching(false));
    }, [token]);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const pickLogo = f => {
        if (!f) return;
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!allowed.includes(f.type)) {
            setToast({ message: 'Please select a valid image file (JPG, PNG, GIF, SVG, WEBP).', type: 'error' });
            return;
        }
        if (f.size > 2 * 1024 * 1024) {
            setToast({ message: 'Logo must be under 2 MB.', type: 'error' });
            return;
        }
        setLogoFile(f);
        setLogoPreview(URL.createObjectURL(f));
    };

    const handleLogoChange = e => pickLogo(e.target.files[0]);

    const handleRemoveLogo = async () => {
        if (!existingLogo) { setLogoFile(null); setLogoPreview(null); return; }
        setRemovingLogo(true);
        try {
            await fetch('/api/settings/logo', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            setExistingLogo(null);
            setLogoFile(null);
            setLogoPreview(null);
            setToast({ message: 'Logo removed successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to remove logo.', type: 'error' });
        } finally {
            setRemovingLogo(false);
        }
    };

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (logoFile) fd.append('company_logo', logoFile);

            const res  = await fetch('/api/settings', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                body: fd,
            });
            const data = await res.json();

            if (!res.ok) {
                setErrors(data.errors || {});
                setToast({ message: 'Please fix the errors below.', type: 'error' });
                return;
            }

            if (data.settings?.company_logo_url) {
                setExistingLogo(data.settings.company_logo_url + '?t=' + Date.now());
                setLogoFile(null);
                setLogoPreview(null);
            }
            setToast({ message: data.message || 'Settings saved!', type: 'success' });
        } catch {
            setToast({ message: 'Failed to save settings.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const displayLogo = logoPreview || existingLogo;

    return (
        <div className="db-wrap">
            {/* SIDEBAR */}
            <DashboardSidebar />

            {/* MAIN */}
            <div className="db-main">
                <DashboardNavbar page="Settings" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('settings', 'view') && <AccessDenied />}
                    {can('settings', 'view') && (
                    <>
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Company Settings</h1>
                            <p className="db-page-sub">Manage your organisation's details and branding</p>
                        </div>
                    </div>

                    {fetching ? (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem' }}></i>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="settings-card">

                            {/* ── Logo ── */}
                            <div className="settings-section">
                                <h2 className="settings-section-title">
                                    <i className="fas fa-image"></i> Company Logo
                                </h2>
                                <div className="settings-logo-area">
                                    <div className="settings-logo-preview">
                                        {displayLogo ? (
                                            <img src={displayLogo} alt="Company logo" />
                                        ) : (
                                            <div className="settings-logo-placeholder">
                                                <i className="fas fa-building"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="settings-logo-actions">
                                        <p style={{ color: '#6b7280', fontSize: '.83rem', marginBottom: 12 }}>
                                            Recommended: square image, at least 200×200 px · JPG, PNG, SVG, WEBP · max 2 MB
                                        </p>
                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                className="db-btn-secondary"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                <i className="fas fa-upload"></i>
                                                {displayLogo ? 'Change Logo' : 'Upload Logo'}
                                            </button>
                                            {displayLogo && (
                                                <button
                                                    type="button"
                                                    className="db-btn-danger"
                                                    onClick={handleRemoveLogo}
                                                    disabled={removingLogo}
                                                    style={{ fontSize: '.82rem', padding: '8px 16px' }}
                                                >
                                                    {removingLogo
                                                        ? <><i className="fas fa-circle-notch fa-spin"></i> Removing…</>
                                                        : <><i className="fas fa-trash-alt"></i> Remove</>
                                                    }
                                                </button>
                                            )}
                                        </div>
                                        {logoFile && (
                                            <p style={{ color: '#16a34a', fontSize: '.8rem', marginTop: 8 }}>
                                                <i className="fas fa-check-circle" style={{ marginRight: 5 }}></i>
                                                New logo selected: {logoFile.name}
                                            </p>
                                        )}
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Basic Info ── */}
                            <div className="settings-section">
                                <h2 className="settings-section-title">
                                    <i className="fas fa-info-circle"></i> Basic Information
                                </h2>
                                <div className="settings-grid">
                                    <div className="profile-field">
                                        <label>Company Name</label>
                                        <div className="profile-input-wrap">
                                            <i className="fas fa-building"></i>
                                            <input
                                                type="text" name="company_name"
                                                placeholder="e.g. Techsphere Digital Skills Academy"
                                                value={form.company_name} onChange={handle}
                                            />
                                        </div>
                                        {errors.company_name && <span className="profile-error">{errors.company_name[0]}</span>}
                                    </div>

                                    <div className="profile-field">
                                        <label>Phone Number</label>
                                        <div className="profile-input-wrap">
                                            <i className="fas fa-phone"></i>
                                            <input
                                                type="text" name="company_phone"
                                                placeholder="e.g. +254 700 000 000"
                                                value={form.company_phone} onChange={handle}
                                            />
                                        </div>
                                        {errors.company_phone && <span className="profile-error">{errors.company_phone[0]}</span>}
                                    </div>

                                    <div className="profile-field">
                                        <label>Email Address</label>
                                        <div className="profile-input-wrap">
                                            <i className="fas fa-envelope"></i>
                                            <input
                                                type="email" name="company_email"
                                                placeholder="e.g. info@techsphere.ac.ke"
                                                value={form.company_email} onChange={handle}
                                            />
                                        </div>
                                        {errors.company_email && <span className="profile-error">{errors.company_email[0]}</span>}
                                    </div>

                                    <div className="profile-field">
                                        <label>KRA PIN</label>
                                        <div className="profile-input-wrap">
                                            <i className="fas fa-id-card"></i>
                                            <input
                                                type="text" name="company_kra_pin"
                                                placeholder="e.g. P051234567X"
                                                value={form.company_kra_pin} onChange={handle}
                                            />
                                        </div>
                                        {errors.company_kra_pin && <span className="profile-error">{errors.company_kra_pin[0]}</span>}
                                    </div>

                                    <div className="profile-field settings-full-col">
                                        <label>Physical Address</label>
                                        <div className="profile-input-wrap profile-textarea-wrap">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <textarea
                                                name="company_address" rows={3}
                                                placeholder="e.g. 2nd Floor, ABC Building, Moi Avenue, Nairobi, Kenya"
                                                value={form.company_address} onChange={handle}
                                            />
                                        </div>
                                        {errors.company_address && <span className="profile-error">{errors.company_address[0]}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* ── Vision & Mission ── */}
                            <div className="settings-section">
                                <h2 className="settings-section-title">
                                    <i className="fas fa-bullseye"></i> Vision &amp; Mission
                                </h2>
                                <div className="settings-grid">
                                    <div className="profile-field settings-full-col">
                                        <label>Company Vision</label>
                                        <RichTextEditor value={form.company_vision || ''} onChange={v => setForm(f => ({ ...f, company_vision: v }))} placeholder="e.g. To be the leading digital skills training institution in Africa…" />
                                        {errors.company_vision && <span className="profile-error">{errors.company_vision[0]}</span>}
                                    </div>

                                    <div className="profile-field settings-full-col">
                                        <label>Company Mission</label>
                                        <RichTextEditor value={form.company_mission || ''} onChange={v => setForm(f => ({ ...f, company_mission: v }))} placeholder="e.g. To empower youth with practical digital skills that unlock economic opportunities…" />
                                        {errors.company_mission && <span className="profile-error">{errors.company_mission[0]}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* ── Social Media ── */}
                            <div className="settings-section">
                                <h2 className="settings-section-title">
                                    <i className="fas fa-share-alt"></i> Social Media Links
                                </h2>
                                <div className="settings-grid">
                                    {[
                                        { name: 'facebook_link',  icon: 'fab fa-facebook-f',  label: 'Facebook',  color: '#1877f2', placeholder: 'https://facebook.com/yourpage' },
                                        { name: 'instagram_link', icon: 'fab fa-instagram',   label: 'Instagram', color: '#e1306c', placeholder: 'https://instagram.com/yourhandle' },
                                        { name: 'youtube_link',   icon: 'fab fa-youtube',     label: 'YouTube',   color: '#ff0000', placeholder: 'https://youtube.com/@yourchannel' },
                                        { name: 'linkedin_link',  icon: 'fab fa-linkedin-in',  label: 'LinkedIn',  color: '#0a66c2', placeholder: 'https://linkedin.com/company/yourpage' },
                                        { name: 'twitter_link',   icon: 'fab fa-x-twitter',   label: 'X (Twitter)', color: '#000', placeholder: 'https://x.com/yourhandle' },
                                    ].map(s => (
                                        <div className="profile-field" key={s.name}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 26, height: 26, borderRadius: 7, background: s.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <i className={s.icon} style={{ color: '#fff', fontSize: '.7rem' }}></i>
                                                </span>
                                                {s.label}
                                            </label>
                                            <div className="profile-input-wrap">
                                                <i className="fas fa-link"></i>
                                                <input type="url" name={s.name} placeholder={s.placeholder}
                                                    value={form[s.name]} onChange={handle} />
                                            </div>
                                            {errors[s.name] && <span className="profile-error">{errors[s.name][0]}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Theme Colors ── */}
                            <div className="settings-section">
                                <h2 className="settings-section-title">
                                    <i className="fas fa-palette"></i> Theme Colors
                                </h2>
                                <p style={{ color: '#6b7280', fontSize: '.83rem', marginBottom: 20, fontFamily: 'Poppins, sans-serif' }}>
                                    Changes apply to the entire site — buttons, accents, navigation, and more.
                                </p>
                                <div className="settings-grid">
                                    {/* Primary / Accent color */}
                                    <div className="profile-field">
                                        <label>Accent Color <span style={{ color: '#9ca3af', fontSize: '.75rem', fontWeight: 400 }}>(buttons, highlights, icons)</span></label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {['#fe730c','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#0d9488'].map(c => (
                                                    <button key={c} type="button" title={c}
                                                        onClick={() => {
                                                            setForm(f => ({ ...f, theme_primary: c }));
                                                            document.documentElement.style.setProperty('--red', c);
                                                        }}
                                                        style={{ width: 32, height: 32, borderRadius: 8, background: c, border: form.theme_primary === c ? '3px solid #081f4e' : '2px solid transparent', cursor: 'pointer', boxShadow: form.theme_primary === c ? '0 0 0 2px #fff inset' : 'none', transition: 'all .15s' }} />
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: form.theme_primary, border: '2px solid #e5e7eb', flexShrink: 0 }} />
                                                <div className="profile-input-wrap" style={{ flex: 1 }}>
                                                    <i className="fas fa-hashtag"></i>
                                                    <input type="text" value={form.theme_primary}
                                                        onChange={e => {
                                                            setForm(f => ({ ...f, theme_primary: e.target.value }));
                                                            if (/^#[0-9a-f]{6}$/i.test(e.target.value))
                                                                document.documentElement.style.setProperty('--red', e.target.value);
                                                        }}
                                                        placeholder="#fe730c" maxLength={7} />
                                                    <input type="color" value={form.theme_primary}
                                                        onChange={e => {
                                                            setForm(f => ({ ...f, theme_primary: e.target.value }));
                                                            document.documentElement.style.setProperty('--red', e.target.value);
                                                        }}
                                                        style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'transparent' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navy / Dark color */}
                                    <div className="profile-field">
                                        <label>Dark Color <span style={{ color: '#9ca3af', fontSize: '.75rem', fontWeight: 400 }}>(navbar, sidebar, headings)</span></label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {['#081f4e','#1e3a8a','#064e3b','#4c1d95','#1f2937','#0f172a','#7c2d12','#831843'].map(c => (
                                                    <button key={c} type="button" title={c}
                                                        onClick={() => {
                                                            setForm(f => ({ ...f, theme_navy: c }));
                                                            document.documentElement.style.setProperty('--navy', c);
                                                        }}
                                                        style={{ width: 32, height: 32, borderRadius: 8, background: c, border: form.theme_navy === c ? '3px solid #fe730c' : '2px solid transparent', cursor: 'pointer', boxShadow: form.theme_navy === c ? '0 0 0 2px #fff inset' : 'none', transition: 'all .15s' }} />
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: form.theme_navy, border: '2px solid #e5e7eb', flexShrink: 0 }} />
                                                <div className="profile-input-wrap" style={{ flex: 1 }}>
                                                    <i className="fas fa-hashtag"></i>
                                                    <input type="text" value={form.theme_navy}
                                                        onChange={e => {
                                                            setForm(f => ({ ...f, theme_navy: e.target.value }));
                                                            if (/^#[0-9a-f]{6}$/i.test(e.target.value))
                                                                document.documentElement.style.setProperty('--navy', e.target.value);
                                                        }}
                                                        placeholder="#081f4e" maxLength={7} />
                                                    <input type="color" value={form.theme_navy}
                                                        onChange={e => {
                                                            setForm(f => ({ ...f, theme_navy: e.target.value }));
                                                            document.documentElement.style.setProperty('--navy', e.target.value);
                                                        }}
                                                        style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'transparent' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Save ── */}
                            {can('settings', 'update') && (
                                <div className="settings-footer">
                                    <button type="submit" className="profile-btn-save" disabled={loading}>
                                        {loading
                                            ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                            : <><i className="fas fa-save"></i> Save Settings</>
                                        }
                                    </button>
                                </div>
                            )}

                        </form>
                    )}
                    </>
                    )}{/* /can settings view */}
                </div>
            </div>
        </div>
    );
}
