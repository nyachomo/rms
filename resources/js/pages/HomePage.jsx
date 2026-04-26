import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';
import RichTextEditor from '../components/RichTextEditor';

/* ── Toast ── */
function Toast({ message, type, onClose }) {
    if (!message) return null;
    const err = type === 'error';
    return (
        <div className="profile-toast" style={{ background: err ? '#fef2f2' : '#f0fdf4', borderColor: err ? '#fca5a5' : '#86efac' }}>
            <i className={`fas ${err ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ color: err ? '#dc2626' : '#16a34a' }}></i>
            <span style={{ color: err ? '#991b1b' : '#15803d' }}>{message}</span>
            <button onClick={onClose} className="profile-toast-close"><i className="fas fa-times"></i></button>
        </div>
    );
}

/* ── Section label ── */
const SectionLabel = ({ children }) => (
    <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14, marginTop: 24 }}>{children}</p>
);

/* ── Field ── */
function Field({ label, error, children }) {
    return (
        <div className="profile-field">
            {label && <label className="profile-label">{label}</label>}
            {children}
            {error && <span className="profile-error">{error[0]}</span>}
        </div>
    );
}

/* ── Text input helper ── */
const TInput = ({ icon, ...props }) => (
    <div className="profile-input-wrap">
        {icon && <i className={`fas ${icon}`}></i>}
        <input {...props} />
    </div>
);

/* ── Textarea helper ── */
const TArea = ({ icon, rows = 3, ...props }) => (
    <div className="profile-input-wrap profile-textarea-wrap">
        {icon && <i className={`fas ${icon}`}></i>}
        <textarea rows={rows} style={{ resize: 'vertical' }} {...props} />
    </div>
);

/* ── Value / Step card modal ── */
function ItemModal({ item, type, onSave, onClose, token }) {
    const isEdit = !!item?.id;
    const isValue = type === 'value';

    const [form, setForm] = useState({
        icon:        item?.icon        || (isValue ? '📚' : ''),
        step_number: item?.step_number || '',
        title:       item?.title       || '',
        description: item?.description || '',
        sort_order:  item?.sort_order  ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const endpoint = isValue ? '/api/home/values' : '/api/home/steps';
            const url    = isEdit ? `${endpoint}/${item.id}` : endpoint;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) { setErrors(json.errors || {}); return; }
            onSave();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="db-modal-header">
                    <h3><i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i> {isEdit ? 'Edit' : 'Add'} {isValue ? 'Value' : 'Step'}</h3>
                    <button className="db-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {isValue && (
                            <Field label="Icon (emoji)" error={errors.icon}>
                                <TInput icon="fa-smile" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="📚" />
                            </Field>
                        )}
                        {!isValue && (
                            <Field label="Step Number" error={errors.step_number}>
                                <TInput icon="fa-hashtag" value={form.step_number} onChange={e => set('step_number', e.target.value)} placeholder="01" />
                            </Field>
                        )}
                        <Field label="Sort Order" error={errors.sort_order}>
                            <TInput icon="fa-sort" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="1" />
                        </Field>
                        <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                            <label className="profile-label">Title <span style={{ color: '#ef4444' }}>*</span></label>
                            <TInput icon="fa-heading" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Enter title" />
                            {errors.title && <span className="profile-error">{errors.title[0]}</span>}
                        </div>
                        <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                            <label className="profile-label">Description</label>
                            <RichTextEditor value={form.description || ''} onChange={v => set('description', v)} placeholder="Enter description…" />
                        </div>
                    </div>
                    <div className="db-modal-actions" style={{ marginTop: 20 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={saving}>
                            {saving ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Image modal (reused for bg slides + hero carousel) ── */
function ImageModal({ image, endpoint, label, onSave, onClose, token }) {
    const isEdit = !!image?.id;
    const [form, setForm] = useState({ src: image?.src || '', alt: image?.alt || '', sort_order: image?.sort_order ?? '' });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            const url    = isEdit ? `${endpoint}/${image.id}` : endpoint;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            if (res.ok) onSave();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="db-modal-header">
                    <h3><i className="fas fa-image"></i> {isEdit ? `Edit ${label || 'Image'}` : `Add ${label || 'Image'}`}</h3>
                    <button className="db-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <Field label="Image URL *">
                            <TInput icon="fa-link" value={form.src} onChange={e => set('src', e.target.value)} required placeholder="https://…" />
                        </Field>
                        {form.src && (
                            <img src={form.src} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid #e5e7eb' }} onError={e => e.target.style.display='none'} />
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <Field label="Alt Text">
                                <TInput icon="fa-font" value={form.alt} onChange={e => set('alt', e.target.value)} placeholder="Image description" />
                            </Field>
                            <Field label="Sort Order">
                                <TInput icon="fa-sort" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} placeholder="1" />
                            </Field>
                        </div>
                    </div>
                    <div className="db-modal-actions" style={{ marginTop: 20 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={saving}>
                            {saving ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function HomePage() {
    const { user, token, can } = useAuth();
    const [tab, setTab]     = useState('hero');
    const [toast, setToast] = useState(null);
    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    /* ── Hero state ── */
    const [hero, setHero]               = useState(null);
    const [heroErrors, setHeroErrors]   = useState({});
    const [heroSaving, setHeroSaving]   = useState(false);
    const [bgSlides, setBgSlides]       = useState([]);
    const [bgModal, setBgModal]         = useState(false);
    const [editBg, setEditBg]           = useState(null);
    const [heroImages, setHeroImages]   = useState([]);
    const [imgModal, setImgModal]       = useState(false);
    const [editImg, setEditImg]         = useState(null);

    /* ── About state ── */
    const [about, setAbout]             = useState(null);
    const [aboutErrors, setAboutErrors] = useState({});
    const [aboutSaving, setAboutSaving] = useState(false);
    const [features, setFeatures]       = useState([]);

    /* ── Values state ── */
    const [values, setValues]         = useState([]);
    const [valModal, setValModal]     = useState(false);
    const [editVal, setEditVal]       = useState(null);
    const [delVal, setDelVal]         = useState(null);

    /* ── Steps state ── */
    const [steps, setSteps]           = useState([]);
    const [stepModal, setStepModal]   = useState(false);
    const [editStep, setEditStep]     = useState(null);
    const [delStep, setDelStep]       = useState(null);

    const h = { Accept: 'application/json', Authorization: `Bearer ${token}` };

    /* ── Load all data ── */
    const loadAll = useCallback(async () => {
        const res  = await fetch('/api/home-content');
        const json = await res.json();
        if (json.hero) {
            setHero(json.hero);
        }
        setBgSlides(json.bg_slides   || []);
        setHeroImages(json.hero_images || []);
        if (json.about) {
            setAbout(json.about);
            setFeatures(json.about.features || []);
        }
        setValues(json.values || []);
        setSteps(json.steps   || []);
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    /* ── Save hero ── */
    const saveHero = async () => {
        setHeroSaving(true);
        setHeroErrors({});
        try {
            const res = await fetch('/api/home/hero', {
                method: 'PUT',
                headers: { ...h, 'Content-Type': 'application/json' },
                body: JSON.stringify(hero),
            });
            const json = await res.json();
            if (!res.ok) { setHeroErrors(json.errors || {}); return; }
            setHero(json.hero);
            setToast({ message: 'Hero section saved.', type: 'success' });
        } finally {
            setHeroSaving(false);
        }
    };

    /* ── Save about ── */
    const saveAbout = async () => {
        setAboutSaving(true);
        setAboutErrors({});
        try {
            const res = await fetch('/api/home/about', {
                method: 'PUT',
                headers: { ...h, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...about, features }),
            });
            const json = await res.json();
            if (!res.ok) { setAboutErrors(json.errors || {}); return; }
            setAbout(json.about);
            setFeatures(json.about.features || []);
            setToast({ message: 'About section saved.', type: 'success' });
        } finally {
            setAboutSaving(false);
        }
    };

    /* ── Delete helpers ── */
    const deleteValue = async id => {
        await fetch(`/api/home/values/${id}`, { method: 'DELETE', headers: h });
        setDelVal(null);
        setToast({ message: 'Value deleted.', type: 'success' });
        loadAll();
    };

    const deleteStep = async id => {
        await fetch(`/api/home/steps/${id}`, { method: 'DELETE', headers: h });
        setDelStep(null);
        setToast({ message: 'Step deleted.', type: 'success' });
        loadAll();
    };

    const deleteBgSlide = async id => {
        await fetch(`/api/home/bg-slides/${id}`, { method: 'DELETE', headers: h });
        setToast({ message: 'Background slide deleted.', type: 'success' });
        loadAll();
    };

    const deleteImage = async id => {
        await fetch(`/api/home/hero-images/${id}`, { method: 'DELETE', headers: h });
        setToast({ message: 'Image deleted.', type: 'success' });
        loadAll();
    };

    if (!can('homepage', 'view')) return <AccessDenied />;

    const setH = (k, v) => setHero(f => ({ ...f, [k]: v }));
    const setA = (k, v) => setAbout(f => ({ ...f, [k]: v }));

    /* ── Tab styles ── */
    const tabStyle = active => ({
        padding: '9px 20px', border: 'none', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'Poppins,sans-serif', fontSize: '.85rem', fontWeight: 600,
        background: active ? '#fe730c' : 'transparent',
        color: active ? '#fff' : '#6b7280',
        transition: 'all .15s',
    });

    const card = (children, style = {}) => (
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(8,31,78,.06)', border: '1px solid rgba(8,31,78,.06)', marginBottom: 20, ...style }}>
            {children}
        </div>
    );

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">

                <DashboardNavbar page="Home Page" />

                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Home Page</h1>
                            <p className="db-page-sub">Manage all content displayed on the public home page</p>
                        </div>
                        <a href="/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '8px 16px', fontFamily: 'Poppins,sans-serif', fontSize: '.84rem', fontWeight: 600, textDecoration: 'none' }}>
                            <i className="fas fa-external-link-alt"></i> View Site
                        </a>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 6, background: '#f3f4f6', borderRadius: 10, padding: 5, marginBottom: 24, flexWrap: 'wrap' }}>
                        {[
                            { key: 'hero',   icon: 'fa-rocket',    label: 'Hero Section' },
                            { key: 'about',  icon: 'fa-info-circle', label: 'About' },
                            { key: 'values', icon: 'fa-star',       label: 'Core Values' },
                            { key: 'steps',  icon: 'fa-list-ol',    label: 'Process Steps' },
                        ].map(t => (
                            <button key={t.key} style={tabStyle(tab === t.key)} onClick={() => setTab(t.key)}>
                                <i className={`fas ${t.icon}`} style={{ marginRight: 7 }}></i>{t.label}
                            </button>
                        ))}
                    </div>

                    {/* ══════════════ HERO TAB ══════════════ */}
                    {tab === 'hero' && hero && (<>

                        {card(<>
                            <SectionLabel>Hero Text</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="Badge text" error={heroErrors.badge_text}>
                                    <TInput icon="fa-tag" value={hero.badge_text || ''} onChange={e => setH('badge_text', e.target.value)} placeholder="New batch starting soon!" />
                                </Field>
                                <div />
                                <Field label="Title — Part 1" error={heroErrors.title_part1}>
                                    <TInput icon="fa-heading" value={hero.title_part1 || ''} onChange={e => setH('title_part1', e.target.value)} placeholder="Launch Your" />
                                </Field>
                                <Field label="Title — Highlight 1 (coloured)" error={heroErrors.title_highlight1}>
                                    <TInput icon="fa-highlighter" value={hero.title_highlight1 || ''} onChange={e => setH('title_highlight1', e.target.value)} placeholder="Tech" />
                                </Field>
                                <Field label="Title — Part 2" error={heroErrors.title_part2}>
                                    <TInput icon="fa-heading" value={hero.title_part2 || ''} onChange={e => setH('title_part2', e.target.value)} placeholder="Career" />
                                </Field>
                                <Field label="Title — Highlight 2 (coloured)" error={heroErrors.title_highlight2}>
                                    <TInput icon="fa-highlighter" value={hero.title_highlight2 || ''} onChange={e => setH('title_highlight2', e.target.value)} placeholder="Today" />
                                </Field>
                                <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                                    <label className="profile-label">Subtitle</label>
                                    <RichTextEditor value={hero.subtitle || ''} onChange={v => setH('subtitle', v)} placeholder="Join Techsphere…" />
                                </div>
                            </div>

                            <SectionLabel>Buttons</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="Button 1 Label"><TInput icon="fa-mouse-pointer" value={hero.btn1_label || ''} onChange={e => setH('btn1_label', e.target.value)} placeholder="Explore Courses" /></Field>
                                <Field label="Button 1 Link"><TInput icon="fa-link" value={hero.btn1_link || ''} onChange={e => setH('btn1_link', e.target.value)} placeholder="/courses" /></Field>
                                <Field label="Button 2 Label"><TInput icon="fa-mouse-pointer" value={hero.btn2_label || ''} onChange={e => setH('btn2_label', e.target.value)} placeholder="Download Brochure" /></Field>
                            </div>

                            <SectionLabel>Stats Bar</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                                {[1,2,3].map(n => (
                                    <div key={n} style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                                        <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase' }}>Stat {n}</p>
                                        <Field label="Value"><TInput value={hero[`stat${n}_value`] || ''} onChange={e => setH(`stat${n}_value`, e.target.value)} placeholder="1,000+" /></Field>
                                        <Field label="Label"><TInput value={hero[`stat${n}_label`] || ''} onChange={e => setH(`stat${n}_label`, e.target.value)} placeholder="Graduates" /></Field>
                                    </div>
                                ))}
                            </div>

                            <SectionLabel>Float Card (bottom-left overlay)</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="Title"><TInput icon="fa-credit-card" value={hero.float_title || ''} onChange={e => setH('float_title', e.target.value)} placeholder="Live Projects" /></Field>
                                <Field label="Subtitle"><TInput icon="fa-text-width" value={hero.float_subtitle || ''} onChange={e => setH('float_subtitle', e.target.value)} placeholder="Real-world experience" /></Field>
                            </div>

                            {/* ── managed below in its own card ── */}

                            {can('homepage', 'update') && (
                                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="profile-btn-save" onClick={saveHero} disabled={heroSaving}>
                                        {heroSaving ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save Hero</>}
                                    </button>
                                </div>
                            )}
                        </>)}

                        {/* ── Background slides gallery ── */}
                        {card(<>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div>
                                    <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>Background Slide Images</p>
                                    <p style={{ fontSize: '.8rem', color: '#9ca3af', margin: 0 }}>Full-screen hero background carousel</p>
                                </div>
                                {can('homepage', 'update') && (
                                    <button className="db-btn-primary" style={{ fontSize: '.82rem', padding: '7px 14px' }} onClick={() => { setEditBg(null); setBgModal(true); }}>
                                        <i className="fas fa-plus"></i> Add Slide
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                                {bgSlides.map(img => (
                                    <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={img.src} alt={img.alt} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
                                            <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(8,31,78,.65)', color: '#fff', fontSize: '.68rem', fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}>
                                                #{img.sort_order}
                                            </span>
                                        </div>
                                        <div style={{ padding: '8px 10px 4px', background: '#f9fafb' }}>
                                            <p style={{ margin: 0, fontSize: '.73rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.alt || '—'}</p>
                                        </div>
                                        {can('homepage', 'update') && (
                                            <div style={{ display: 'flex', gap: 4, padding: '4px 8px 8px', background: '#f9fafb' }}>
                                                <button onClick={() => { setEditBg(img); setBgModal(true); }}
                                                    style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, padding: '5px 0', fontSize: '.76rem', cursor: 'pointer' }}>
                                                    <i className="fas fa-edit" style={{ marginRight: 4 }}></i>Edit
                                                </button>
                                                <button onClick={() => deleteBgSlide(img.id)}
                                                    style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 0', fontSize: '.76rem', cursor: 'pointer' }}>
                                                    <i className="fas fa-trash-alt" style={{ marginRight: 4 }}></i>Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {bgSlides.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                                        <i className="fas fa-images" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
                                        No background slides yet. Click "Add Slide" to upload the first one.
                                    </div>
                                )}
                            </div>
                        </>)}

                        {/* ── Right carousel images ── */}
                        {card(<>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div>
                                    <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>Hero Carousel Images</p>
                                    <p style={{ fontSize: '.8rem', color: '#9ca3af', margin: 0 }}>Right-side image slideshow</p>
                                </div>
                                {can('homepage', 'update') && (
                                    <button className="db-btn-primary" style={{ fontSize: '.82rem', padding: '7px 14px' }} onClick={() => { setEditImg(null); setImgModal(true); }}>
                                        <i className="fas fa-plus"></i> Add Image
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                                {heroImages.map(img => (
                                    <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={img.src} alt={img.alt} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
                                            <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(8,31,78,.65)', color: '#fff', fontSize: '.68rem', fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}>
                                                #{img.sort_order}
                                            </span>
                                        </div>
                                        <div style={{ padding: '8px 10px 4px', background: '#f9fafb' }}>
                                            <p style={{ margin: 0, fontSize: '.73rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.alt || '—'}</p>
                                        </div>
                                        {can('homepage', 'update') && (
                                            <div style={{ display: 'flex', gap: 4, padding: '4px 8px 8px', background: '#f9fafb' }}>
                                                <button onClick={() => { setEditImg(img); setImgModal(true); }}
                                                    style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, padding: '5px 0', fontSize: '.76rem', cursor: 'pointer' }}>
                                                    <i className="fas fa-edit" style={{ marginRight: 4 }}></i>Edit
                                                </button>
                                                <button onClick={() => deleteImage(img.id)}
                                                    style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 0', fontSize: '.76rem', cursor: 'pointer' }}>
                                                    <i className="fas fa-trash-alt" style={{ marginRight: 4 }}></i>Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {heroImages.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                                        <i className="fas fa-images" style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}></i>
                                        No carousel images yet. Click "Add Image" to upload the first one.
                                    </div>
                                )}
                            </div>
                        </>)}
                    </>)}

                    {/* ══════════════ ABOUT TAB ══════════════ */}
                    {tab === 'about' && about && (<>

                        {card(<>
                            <SectionLabel>About Section</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                                    <label className="profile-label">About Section Image URL</label>
                                    <TInput icon="fa-image" value={about.image_url || ''} onChange={e => setA('image_url', e.target.value)} placeholder="https://…" />
                                    {about.image_url && (
                                        <img src={about.image_url} alt="About preview"
                                            style={{ marginTop: 10, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid #e5e7eb' }}
                                            onError={e => e.target.style.display='none'} />
                                    )}
                                </div>
                                <Field label="Years Badge (e.g. 12+)"><TInput icon="fa-award" value={about.years_badge || ''} onChange={e => setA('years_badge', e.target.value)} placeholder="12+" /></Field>
                                <Field label="Years Label"><TInput icon="fa-text-width" value={about.years_label || ''} onChange={e => setA('years_label', e.target.value)} placeholder="Years of Excellence" /></Field>
                                <Field label="Badge Text"><TInput icon="fa-tag" value={about.badge_text || ''} onChange={e => setA('badge_text', e.target.value)} placeholder="Who We Are" /></Field>
                                <div />
                                <Field label="Title"><TInput icon="fa-heading" value={about.title || ''} onChange={e => setA('title', e.target.value)} placeholder="Empowering Growth Through" /></Field>
                                <Field label="Title Highlight (coloured)"><TInput icon="fa-highlighter" value={about.title_highlight || ''} onChange={e => setA('title_highlight', e.target.value)} placeholder="World-Class Training" /></Field>
                                <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                                    <label className="profile-label">Subtitle</label>
                                    <RichTextEditor value={about.subtitle || ''} onChange={v => setA('subtitle', v)} placeholder="We deliver…" />
                                </div>
                                <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                                    <label className="profile-label">Quote Text</label>
                                    <RichTextEditor value={about.quote_text || ''} onChange={v => setA('quote_text', v)} placeholder="Learning is the foundation…" minHeight={80} />
                                </div>
                                <Field label="Quote Author"><TInput icon="fa-user" value={about.quote_author || ''} onChange={e => setA('quote_author', e.target.value)} placeholder="CEO, Techsphere…" /></Field>
                                <div />
                                <Field label="CTA Button Label"><TInput icon="fa-mouse-pointer" value={about.cta_label || ''} onChange={e => setA('cta_label', e.target.value)} placeholder="Start Your Training Journey" /></Field>
                                <Field label="CTA Button Link"><TInput icon="fa-link" value={about.cta_link || ''} onChange={e => setA('cta_link', e.target.value)} placeholder="/contact" /></Field>
                            </div>

                            <SectionLabel>Features List</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                                {features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div className="profile-input-wrap" style={{ flex: 1 }}>
                                            <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                                            <input
                                                value={f} onChange={e => {
                                                    const arr = [...features]; arr[i] = e.target.value; setFeatures(arr);
                                                }} placeholder="Feature text…" />
                                        </div>
                                        <button onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setFeatures([...features, ''])}
                                style={{ background: '#eff6ff', color: '#2563eb', border: '1.5px dashed #bfdbfe', borderRadius: 8, padding: '7px 16px', fontSize: '.83rem', fontWeight: 600, cursor: 'pointer' }}>
                                <i className="fas fa-plus" style={{ marginRight: 6 }}></i> Add Feature
                            </button>
                        </>)}

                        {card(<>
                            <SectionLabel>Core Values — Section Header</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="Badge"><TInput icon="fa-tag" value={about.values_badge || ''} onChange={e => setA('values_badge', e.target.value)} placeholder="Our" /></Field>
                                <div />
                                <Field label="Title"><TInput icon="fa-heading" value={about.values_title || ''} onChange={e => setA('values_title', e.target.value)} placeholder="Core Values" /></Field>
                                <Field label="Title Highlight"><TInput icon="fa-highlighter" value={about.values_title_highlight || ''} onChange={e => setA('values_title_highlight', e.target.value)} placeholder="Values" /></Field>
                                <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                                    <label className="profile-label">Subtitle</label>
                                    <RichTextEditor value={about.values_subtitle || ''} onChange={v => setA('values_subtitle', v)} placeholder="The principles that shape…" minHeight={80} />
                                </div>
                            </div>

                            <SectionLabel>Process Steps — Section Header</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="Badge"><TInput icon="fa-tag" value={about.steps_badge || ''} onChange={e => setA('steps_badge', e.target.value)} placeholder="Our Methodology" /></Field>
                                <div />
                                <Field label="Title"><TInput icon="fa-heading" value={about.steps_title || ''} onChange={e => setA('steps_title', e.target.value)} placeholder="Our Training Process" /></Field>
                                <Field label="Title Highlight"><TInput icon="fa-highlighter" value={about.steps_title_highlight || ''} onChange={e => setA('steps_title_highlight', e.target.value)} placeholder="Process" /></Field>
                                <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                                    <label className="profile-label">Subtitle</label>
                                    <RichTextEditor value={about.steps_subtitle || ''} onChange={v => setA('steps_subtitle', v)} placeholder="A proven four-step…" minHeight={80} />
                                </div>
                            </div>
                        </>)}

                        {can('homepage', 'update') && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                <button className="profile-btn-save" onClick={saveAbout} disabled={aboutSaving}>
                                    {aboutSaving ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save About & Section Headers</>}
                                </button>
                            </div>
                        )}
                    </>)}

                    {/* ══════════════ VALUES TAB ══════════════ */}
                    {tab === 'values' && (<>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            {can('homepage', 'update') && (
                                <button className="db-btn-primary" onClick={() => { setEditVal(null); setValModal(true); }}>
                                    <i className="fas fa-plus"></i> Add Value
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                            {values.map(v => (
                                <div key={v.id} style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(8,31,78,.06)', border: '1px solid rgba(8,31,78,.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fef9ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{v.icon}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#111827', fontSize: '.9rem' }}>{v.title}</div>
                                                <div style={{ fontSize: '.72rem', color: '#9ca3af' }}>Order: {v.sort_order}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {can('homepage', 'update') && <>
                                                <button onClick={() => { setEditVal(v); setValModal(true); }}
                                                    style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => setDelVal(v)}
                                                    style={{ width: 28, height: 28, borderRadius: 6, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </>}
                                        </div>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '.83rem', margin: 0, lineHeight: 1.6 }}>{v.description}</p>
                                </div>
                            ))}
                            {values.length === 0 && <p style={{ color: '#9ca3af' }}>No values yet. Click "Add Value" to get started.</p>}
                        </div>
                    </>)}

                    {/* ══════════════ STEPS TAB ══════════════ */}
                    {tab === 'steps' && (<>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            {can('homepage', 'update') && (
                                <button className="db-btn-primary" onClick={() => { setEditStep(null); setStepModal(true); }}>
                                    <i className="fas fa-plus"></i> Add Step
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                            {steps.map(s => (
                                <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(8,31,78,.06)', border: '1px solid rgba(8,31,78,.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#fe730c,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1rem' }}>{s.step_number}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#111827', fontSize: '.9rem' }}>{s.title}</div>
                                                <div style={{ fontSize: '.72rem', color: '#9ca3af' }}>Order: {s.sort_order}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {can('homepage', 'update') && <>
                                                <button onClick={() => { setEditStep(s); setStepModal(true); }}
                                                    style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => setDelStep(s)}
                                                    style={{ width: 28, height: 28, borderRadius: 6, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem' }}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </>}
                                        </div>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '.83rem', margin: 0, lineHeight: 1.6 }}>{s.description}</p>
                                </div>
                            ))}
                            {steps.length === 0 && <p style={{ color: '#9ca3af' }}>No steps yet. Click "Add Step" to get started.</p>}
                        </div>
                    </>)}

                </div>
            </div>

            {/* Modals */}
            {bgModal   && <ImageModal image={editBg}  endpoint="/api/home/bg-slides"   label="Background Slide" token={token} onClose={() => setBgModal(false)}  onSave={() => { setBgModal(false);  loadAll(); setToast({ message: 'Slide saved.',  type: 'success' }); }} />}
            {imgModal  && <ImageModal image={editImg} endpoint="/api/home/hero-images" label="Carousel Image"   token={token} onClose={() => setImgModal(false)} onSave={() => { setImgModal(false); loadAll(); setToast({ message: 'Image saved.', type: 'success' }); }} />}
            {valModal  && <ItemModal  item={editVal}  type="value" token={token} onClose={() => setValModal(false)}  onSave={() => { setValModal(false);  loadAll(); setToast({ message: 'Value saved.',  type: 'success' }); }} />}
            {stepModal && <ItemModal  item={editStep} type="step"  token={token} onClose={() => setStepModal(false)} onSave={() => { setStepModal(false); loadAll(); setToast({ message: 'Step saved.',   type: 'success' }); }} />}

            {/* Confirm delete value */}
            {delVal && (
                <div className="db-modal-overlay" onClick={() => setDelVal(null)}>
                    <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="db-modal-header" style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                            <h3 style={{ color: '#dc2626' }}><i className="fas fa-trash-alt"></i> Delete Value</h3>
                        </div>
                        <div style={{ padding: '20px 24px 24px' }}>
                            <p style={{ color: '#374151', marginBottom: 20 }}>Delete <strong>{delVal.title}</strong>? This cannot be undone.</p>
                            <div className="db-modal-actions">
                                <button className="db-btn-secondary" onClick={() => setDelVal(null)}>Cancel</button>
                                <button className="db-btn-danger" onClick={() => deleteValue(delVal.id)}><i className="fas fa-trash-alt"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm delete step */}
            {delStep && (
                <div className="db-modal-overlay" onClick={() => setDelStep(null)}>
                    <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="db-modal-header" style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                            <h3 style={{ color: '#dc2626' }}><i className="fas fa-trash-alt"></i> Delete Step</h3>
                        </div>
                        <div style={{ padding: '20px 24px 24px' }}>
                            <p style={{ color: '#374151', marginBottom: 20 }}>Delete step <strong>{delStep.title}</strong>? This cannot be undone.</p>
                            <div className="db-modal-actions">
                                <button className="db-btn-secondary" onClick={() => setDelStep(null)}>Cancel</button>
                                <button className="db-btn-danger" onClick={() => deleteStep(delStep.id)}><i className="fas fa-trash-alt"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
