import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const fmt = iso => iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

/* ── tiny helpers ── */
const Req = () => <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;

const ErrMsg = ({ children }) => children ? (
    <p style={{ color: '#ef4444', fontSize: '.72rem', fontFamily: 'Poppins,sans-serif', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
        <i className="fas fa-exclamation-circle"></i>{children}
    </p>
) : null;

const FLabel = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins,sans-serif', marginBottom: 6 }}>
        {children}{required && <Req />}
    </label>
);

const Field = ({ icon, error, children }) => (
    <div>
        <div className="profile-input-wrap" style={{ ...(error ? { '--border': '#ef4444' } : {}) }}>
            {icon && <i className={icon} style={{ color: error ? '#ef4444' : undefined }}></i>}
            {children}
        </div>
        <ErrMsg>{error}</ErrMsg>
    </div>
);

const Step = ({ n, icon, color, title, children }) => (
    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(8,31,78,.06)', border: '1px solid #e8eaf0', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0f4fb', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${color},${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${color}40` }}>
                <i className={icon} style={{ color: '#fff', fontSize: '.85rem' }}></i>
            </div>
            <div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, color: '#081f4e', fontSize: '.97rem' }}>{title}</div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: '.7rem', color: '#94a3b8', fontWeight: 600, marginTop: 1 }}>Step {n}</div>
            </div>
        </div>
        <div style={{ padding: '22px 28px' }}>{children}</div>
    </div>
);

export default function Enrol() {
    const { courseSlug } = useParams();

    const [course,       setCourse]     = useState(null);
    const [intakes,      setIntakes]    = useState([]);
    const [levels,       setLevels]     = useState([]);
    const [classes,      setClasses]    = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loading,      setLoading]    = useState(true);
    const [notFound,     setNotFound]   = useState(false);
    const [submitting,   setSubmitting] = useState(false);
    const [success,      setSuccess]    = useState(null);
    const [errors,       setErrors]     = useState({});

    const [form, setForm] = useState({
        intake_id:       '',
        school_level_id: '',
        class_id:        '',
        name:            '',
        email:           '',
        phone:           '',
        sponsorship:     'self',
        sponsor_name:    '',
        sponsor_email:   '',
        sponsor_phone:   '',
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/courses/${courseSlug}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
            fetch('/api/active-intakes').then(r => r.json()),
            fetch('/api/public-school-levels').then(r => r.json()),
        ])
        .then(([c, i, l]) => { setCourse(c); setIntakes(i); setLevels(l); })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }, [courseSlug]);

    /* When level changes, fetch classes for that level */
    useEffect(() => {
        if (!form.school_level_id) { setClasses([]); return; }
        setLoadingClasses(true);
        fetch(`/api/public-classes?level_id=${form.school_level_id}`)
            .then(r => r.json())
            .then(d => setClasses(d))
            .catch(() => setClasses([]))
            .finally(() => setLoadingClasses(false));
    }, [form.school_level_id]);

    const set = (k, v) => setForm(f => ({
        ...f,
        [k]: v,
        ...(k === 'school_level_id' ? { class_id: '' } : {}),
    }));
    const handle = e => set(e.target.name, e.target.value);

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            const res  = await fetch('/api/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ ...form, course_id: course.id }),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            setSuccess(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const selectedIntake = intakes.find(i => String(i.id) === String(form.intake_id));
    const canSubmit      = !submitting && intakes.length > 0 && form.intake_id;

    /* ── Loading ── */
    if (loading) return (
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#fe730c,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(254,115,12,.3)', animation: 'pulse 1.5s infinite' }}>
                <i className="fas fa-graduation-cap" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
            </div>
            <p style={{ color: '#64748b', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.9rem' }}>Loading enrollment form…</p>
        </div>
    );

    if (notFound || !course) return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '60px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', color: '#ef4444' }}></i>
            </div>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', color: '#081f4e', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Course Not Found</h2>
            <p style={{ color: '#64748b', fontFamily: 'Poppins,sans-serif', fontSize: '.9rem', margin: 0 }}>The course you're looking for doesn't exist or is no longer available.</p>
            <Link to="/courses" style={{ marginTop: 8, background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', color: '#fff', padding: '12px 28px', borderRadius: 50, fontFamily: 'Poppins,sans-serif', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.88rem' }}>
                <i className="fas fa-arrow-left"></i> Browse Courses
            </Link>
        </div>
    );

    /* ── Success ── */
    if (success) return (
        <div style={{ background: 'linear-gradient(160deg,#f0fdf4 0%,#ecfdf5 50%,#f0f9ff 100%)', minHeight: '100vh', paddingTop: 100, paddingBottom: 80 }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

                {/* Big check */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 16px 48px rgba(16,185,129,.35)' }}>
                            <i className="fas fa-check" style={{ color: '#fff', fontSize: '2.6rem' }}></i>
                        </div>
                        <div style={{ position: 'absolute', top: -6, right: -6, width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,.4)' }}>
                            <i className="fas fa-star" style={{ color: '#fff', fontSize: '.65rem' }}></i>
                        </div>
                    </div>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', color: '#065f46', fontSize: '2rem', fontWeight: 900, marginBottom: 10 }}>You're Enrolled!</h1>
                    <p style={{ color: '#047857', fontFamily: 'Poppins,sans-serif', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                        Welcome, <strong>{form.name}</strong>! Your application for <strong>{course.title}</strong> has been received and is pending review.
                    </p>
                </div>

                {/* Course summary strip */}
                <div style={{ background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', borderRadius: 16, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    {course.image_url
                        ? <img src={course.image_url} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><i className="fas fa-book-open" style={{ color: '#fff', fontSize: '1.2rem' }}></i></div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.7rem', fontFamily: 'Poppins,sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>Enrolled in</div>
                        <div style={{ color: '#fff', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                        {selectedIntake && <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.75rem', fontFamily: 'Poppins,sans-serif', marginTop: 2 }}>{selectedIntake.intake_name}</div>}
                    </div>
                    <span style={{ background: 'rgba(16,185,129,.2)', color: '#6ee7b7', padding: '5px 12px', borderRadius: 20, fontSize: '.72rem', fontFamily: 'Poppins,sans-serif', fontWeight: 700, border: '1px solid rgba(16,185,129,.3)', flexShrink: 0 }}>Pending Review</span>
                </div>

                {/* Credentials card */}
                <div style={{ background: '#fff', borderRadius: 18, padding: '24px 26px', boxShadow: '0 8px 32px rgba(0,0,0,.07)', marginBottom: 20, border: '1px solid #d1fae5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-key" style={{ color: '#fff', fontSize: '.8rem' }}></i>
                        </div>
                        <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, color: '#065f46', fontSize: '.9rem' }}>Your Login Credentials</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '.68rem', color: '#6b7280', fontFamily: 'Poppins,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <i className="fas fa-envelope" style={{ color: '#10b981' }}></i> Email
                            </div>
                            <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#047857', fontSize: '.82rem', wordBreak: 'break-all' }}>{form.email}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '.68rem', color: '#6b7280', fontFamily: 'Poppins,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <i className="fas fa-lock" style={{ color: '#10b981' }}></i> Password
                            </div>
                            <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', fontSize: '1rem', letterSpacing: '.1em' }}>12345678</div>
                        </div>
                    </div>

                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <i className="fas fa-shield-alt" style={{ color: '#d97706', fontSize: '.85rem', marginTop: 1, flexShrink: 0 }}></i>
                        <span style={{ color: '#92400e', fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', lineHeight: 1.5 }}>
                            <strong>Security reminder:</strong> Please change your password immediately after your first login.
                        </span>
                    </div>
                </div>

                {/* What's next */}
                <div style={{ background: '#fff', borderRadius: 18, padding: '22px 26px', boxShadow: '0 4px 20px rgba(0,0,0,.06)', marginBottom: 24, border: '1px solid #e8eaf0' }}>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, color: '#081f4e', fontSize: '.88rem', marginBottom: 16 }}>
                        <i className="fas fa-road" style={{ color: '#fe730c', marginRight: 8 }}></i>What Happens Next
                    </div>
                    {[
                        { icon: 'fas fa-envelope-open-text', color: '#3b82f6', title: 'Check your email', desc: 'Your login credentials have been noted above' },
                        { icon: 'fas fa-search', color: '#8b5cf6', title: 'Application review', desc: 'Our team will review your enrollment application' },
                        { icon: 'fas fa-check-double', color: '#10b981', title: 'Confirmation', desc: "You'll receive an approval notification from us" },
                        { icon: 'fas fa-rocket', color: '#fe730c', title: 'Start learning', desc: 'Access your course materials and begin your journey' },
                    ].map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 14, marginBottom: idx < 3 ? 14 : 0, paddingBottom: idx < 3 ? 14 : 0, borderBottom: idx < 3 ? '1px solid #f0f4fb' : 'none' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={s.icon} style={{ color: s.color, fontSize: '.82rem' }}></i>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#1e293b', fontSize: '.83rem' }}>{s.title}</div>
                                <div style={{ color: '#64748b', fontSize: '.78rem', fontFamily: 'Poppins,sans-serif', marginTop: 2 }}>{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link to="/login" style={{ flex: 1, minWidth: 160, background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', color: '#fff', padding: '14px 20px', borderRadius: 50, fontFamily: 'Poppins,sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '.88rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(8,31,78,.3)' }}>
                        <i className="fas fa-sign-in-alt"></i> Login to Dashboard
                    </Link>
                    <Link to="/courses" style={{ flex: 1, minWidth: 160, background: '#fff', color: '#081f4e', padding: '14px 20px', borderRadius: 50, fontFamily: 'Poppins,sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '.88rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px solid #e5e7eb' }}>
                        <i className="fas fa-th-large"></i> Browse Courses
                    </Link>
                </div>
            </div>
        </div>
    );

    /* ══════════════════════════════════════════
       ENROLLMENT FORM
       ══════════════════════════════════════════ */
    return (
        <div style={{ background: '#f4f6fb', minHeight: '100vh' }}>

            {/* ── Hero ── */}
            <div style={{ background: 'linear-gradient(135deg,#081f4e 0%,#0d2060 55%,#1e3a8a 100%)', position: 'relative', overflow: 'hidden', paddingTop: 110, paddingBottom: 48 }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(254,115,12,.08)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: -80, left: '30%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }}></div>

                <div className="container">
                    {/* Breadcrumb */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Home', to: '/' },
                            { label: 'Courses', to: '/courses' },
                            { label: course.title, to: `/courses/${courseSlug}` },
                        ].map((crumb, idx) => (
                            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Link to={crumb.to} style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontFamily: 'Poppins,sans-serif', fontSize: '.75rem', fontWeight: 500, transition: 'color .2s' }}
                                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,.85)'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.5)'}
                                >{crumb.label}</Link>
                                <i className="fas fa-chevron-right" style={{ color: 'rgba(255,255,255,.25)', fontSize: '.5rem' }}></i>
                            </span>
                        ))}
                        <span style={{ color: '#fe730c', fontFamily: 'Poppins,sans-serif', fontSize: '.75rem', fontWeight: 700 }}>Enrol</span>
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(254,115,12,.15)', border: '1px solid rgba(254,115,12,.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 14 }}>
                                <i className="fas fa-graduation-cap" style={{ color: '#fe730c', fontSize: '.72rem' }}></i>
                                <span style={{ color: '#fe730c', fontFamily: 'Poppins,sans-serif', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>Enrollment Form</span>
                            </div>
                            <h1 style={{ fontFamily: 'Poppins,sans-serif', color: '#fff', fontWeight: 900, fontSize: 'clamp(1.5rem,3.5vw,2.3rem)', margin: '0 0 10px', lineHeight: 1.15 }}>
                                Enrol in <span style={{ color: '#fe730c' }}>{course.title}</span>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,.65)', fontFamily: 'Poppins,sans-serif', fontSize: '.88rem', lineHeight: 1.65, margin: 0, maxWidth: 480 }}>
                                Complete the form below. Your login account will be created automatically — you'll receive credentials to track your application.
                            </p>
                        </div>

                        {/* Quick stats strip */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignSelf: 'flex-end', paddingBottom: 4 }}>
                            {[
                                { icon: 'fas fa-clock',      label: course.duration,            color: '#60a5fa' },
                                { icon: 'fas fa-tag',        label: course.price,               color: '#34d399' },
                                { icon: 'fas fa-users',      label: `${course.students_count}+`, color: '#fbbf24' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '7px 13px' }}>
                                    <i className={s.icon} style={{ color: s.color, fontSize: '.75rem' }}></i>
                                    <span style={{ color: 'rgba(255,255,255,.85)', fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', fontWeight: 600 }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container" style={{ padding: '36px 20px 60px', maxWidth: 1080 }}>
                <div className="enrol-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>

                    {/* ════ FORM ════ */}
                    <form onSubmit={submit}>

                        {/* Step 1 — Intake */}
                        <Step n="1" icon="fas fa-calendar-alt" color="#0d9488" title="Choose Your Intake">
                            {intakes.length === 0 ? (
                                <div style={{ padding: '16px 18px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <i className="fas fa-exclamation-circle" style={{ color: '#f97316', marginTop: 2, flexShrink: 0 }}></i>
                                    <div>
                                        <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#9a3412', fontSize: '.85rem', marginBottom: 3 }}>No active intakes</div>
                                        <div style={{ color: '#c2410c', fontFamily: 'Poppins,sans-serif', fontSize: '.78rem' }}>There are no open intakes at the moment. Please check back soon or contact us directly.</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {intakes.map(intake => {
                                        const sel = String(form.intake_id) === String(intake.id);
                                        return (
                                            <label key={intake.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14, border: `2px solid ${sel ? '#0d9488' : '#e5e7eb'}`, background: sel ? 'rgba(13,148,136,.06)' : '#fff', cursor: 'pointer', transition: 'all .2s', boxShadow: sel ? '0 4px 14px rgba(13,148,136,.15)' : '0 1px 4px rgba(0,0,0,.04)' }}>
                                                <input type="radio" name="intake_id" value={intake.id} checked={sel} onChange={handle} style={{ accentColor: '#0d9488', width: 18, height: 18, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#081f4e', fontSize: '.9rem' }}>{intake.intake_name}</div>
                                                    <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                                                        <span style={{ color: '#64748b', fontSize: '.75rem', fontFamily: 'Poppins,sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <i className="fas fa-play-circle" style={{ color: '#0d9488', fontSize: '.65rem' }}></i> Starts {fmt(intake.intake_start_date)}
                                                        </span>
                                                        <span style={{ color: '#64748b', fontSize: '.75rem', fontFamily: 'Poppins,sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <i className="fas fa-flag-checkered" style={{ color: '#64748b', fontSize: '.65rem' }}></i> Ends {fmt(intake.intake_end_date)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: sel ? '#0d9488' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                                                    {sel
                                                        ? <i className="fas fa-check" style={{ color: '#fff', fontSize: '.6rem' }}></i>
                                                        : <i className="fas fa-circle" style={{ color: '#cbd5e1', fontSize: '.45rem' }}></i>
                                                    }
                                                </div>
                                            </label>
                                        );
                                    })}
                                    <ErrMsg>{errors.intake_id?.[0]}</ErrMsg>
                                </div>
                            )}
                        </Step>

                        {/* Step 2 — Personal Info */}
                        <Step n="2" icon="fas fa-user" color="#3b82f6" title="Personal Information">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <FLabel required>Full Name</FLabel>
                                    <Field icon="fas fa-user" error={errors.name?.[0]}>
                                        <input type="text" name="name" placeholder="Your full legal name" value={form.name} onChange={handle} required />
                                    </Field>
                                </div>
                                <div>
                                    <FLabel required>Email Address</FLabel>
                                    <Field icon="fas fa-envelope" error={errors.email?.[0]}>
                                        <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
                                    </Field>
                                </div>
                                <div>
                                    <FLabel>Phone Number</FLabel>
                                    <Field icon="fas fa-phone" error={errors.phone?.[0]}>
                                        <input type="text" name="phone" placeholder="+254 700 000 000" value={form.phone} onChange={handle} />
                                    </Field>
                                </div>
                            </div>
                        </Step>

                        {/* Step 3 — Education Background */}
                        <Step n="3" icon="fas fa-graduation-cap" color="#8b5cf6" title="Education Background">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                                {/* Level of Education */}
                                <div>
                                    <FLabel required>Level of Education</FLabel>
                                    <Field icon="fas fa-layer-group" error={errors.school_level_id?.[0]}>
                                        <select name="school_level_id" value={form.school_level_id} onChange={handle}
                                            style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.9rem', color: form.school_level_id ? '#081f4e' : '#94a3b8' }}>
                                            <option value="">— Select level —</option>
                                            {levels.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Class (depends on level) */}
                                <div>
                                    <FLabel required>
                                        Class
                                        {!form.school_level_id && (
                                            <span style={{ color:'#94a3b8', fontWeight:500, textTransform:'none', fontSize:'.7rem', marginLeft:6 }}>(select level first)</span>
                                        )}
                                    </FLabel>
                                    <Field icon="fas fa-chalkboard" error={errors.class_id?.[0]}>
                                        <select name="class_id" value={form.class_id} onChange={handle}
                                            disabled={!form.school_level_id || loadingClasses}
                                            style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.9rem', color: form.class_id ? '#081f4e' : '#94a3b8', cursor: !form.school_level_id ? 'not-allowed' : 'pointer' }}>
                                            <option value="">
                                                {loadingClasses ? 'Loading classes…' : classes.length === 0 && form.school_level_id ? 'No classes for this level' : '— Select class —'}
                                            </option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                            </div>
                            <p style={{ margin:'10px 0 0', fontSize:'.75rem', color:'#94a3b8', fontFamily:'Poppins,sans-serif', display:'flex', alignItems:'center', gap:5 }}>
                                <i className="fas fa-info-circle"></i>
                                These fields are optional but help us place you in the right learning group.
                            </p>
                        </Step>

                        {/* Step 4 — Sponsorship */}
                        <Step n="4" icon="fas fa-hand-holding-heart" color="#f59e0b" title="Sponsorship">
                            {/* Radio cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: form.sponsorship === 'guardian' ? 18 : 0 }}>
                                {[
                                    { value: 'self',     icon: 'fas fa-user-check', label: 'Self Sponsored',     desc: 'I will fund my own studies' },
                                    { value: 'guardian', icon: 'fas fa-user-friends', label: 'Guardian / Sponsor', desc: 'Someone else will fund me' },
                                ].map(opt => {
                                    const active = form.sponsorship === opt.value;
                                    return (
                                        <label key={opt.value} style={{ display: 'flex', gap: 14, padding: '18px', borderRadius: 16, border: `2px solid ${active ? '#f59e0b' : '#e5e7eb'}`, background: active ? 'rgba(245,158,11,.05)' : '#fff', cursor: 'pointer', transition: 'all .2s', boxShadow: active ? '0 4px 14px rgba(245,158,11,.15)' : '0 1px 4px rgba(0,0,0,.04)' }}>
                                            <input type="radio" name="sponsorship" value={opt.value} checked={active} onChange={handle} style={{ accentColor: '#f59e0b', marginTop: 3, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#081f4e', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                                    <i className={opt.icon} style={{ color: '#f59e0b', fontSize: '.82rem' }}></i> {opt.label}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '.75rem', fontFamily: 'Poppins,sans-serif', lineHeight: 1.4 }}>{opt.desc}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Guardian fields */}
                            {form.sponsorship === 'guardian' && (
                                <div style={{ borderRadius: 16, border: '1.5px solid #fde68a', background: 'linear-gradient(135deg,#fffbeb,#fef9ec)', padding: '20px 22px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #fde68a' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-info" style={{ color: '#d97706', fontSize: '.7rem' }}></i>
                                        </div>
                                        <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '.8rem', color: '#92400e', fontWeight: 700 }}>Guardian / Sponsor Details</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div style={{ gridColumn: '1/-1' }}>
                                            <FLabel required>Sponsor Full Name</FLabel>
                                            <Field icon="fas fa-user-tie" error={errors.sponsor_name?.[0]}>
                                                <input type="text" name="sponsor_name" placeholder="Guardian / sponsor's full name" value={form.sponsor_name} onChange={handle} required />
                                            </Field>
                                        </div>
                                        <div>
                                            <FLabel required>Sponsor Email</FLabel>
                                            <Field icon="fas fa-envelope" error={errors.sponsor_email?.[0]}>
                                                <input type="email" name="sponsor_email" placeholder="sponsor@example.com" value={form.sponsor_email} onChange={handle} required />
                                            </Field>
                                        </div>
                                        <div>
                                            <FLabel>Sponsor Phone</FLabel>
                                            <Field icon="fas fa-phone" error={errors.sponsor_phone?.[0]}>
                                                <input type="text" name="sponsor_phone" placeholder="+254 700 000 000" value={form.sponsor_phone} onChange={handle} />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Step>

                        {/* Submit */}
                        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 28px', boxShadow: '0 4px 24px rgba(8,31,78,.06)', border: '1px solid #e8eaf0' }}>
                            {Object.keys(errors).length > 0 && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '13px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <i className="fas fa-exclamation-circle" style={{ color: '#ef4444', marginTop: 1, flexShrink: 0 }}></i>
                                    <div>
                                        <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#991b1b', fontSize: '.83rem', marginBottom: 2 }}>Please fix the following errors:</div>
                                        {Object.values(errors).flat().map((err, i) => (
                                            <div key={i} style={{ color: '#b91c1c', fontFamily: 'Poppins,sans-serif', fontSize: '.78rem' }}>• {err}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={!canSubmit}
                                style={{ width: '100%', padding: '17px', background: canSubmit ? 'linear-gradient(135deg,#fe730c,#f97316)' : '#e2e8f0', color: canSubmit ? '#fff' : '#94a3b8', border: 'none', borderRadius: 14, fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1rem', cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: canSubmit ? '0 8px 28px rgba(254,115,12,.35)' : 'none', transition: 'all .25s', letterSpacing: '.01em' }}>
                                {submitting
                                    ? <><i className="fas fa-circle-notch fa-spin"></i> Submitting your application…</>
                                    : <><i className="fas fa-paper-plane"></i> Complete Enrollment</>
                                }
                            </button>

                            {!form.intake_id && intakes.length > 0 && (
                                <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: '.75rem', fontFamily: 'Poppins,sans-serif', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                    <i className="fas fa-arrow-up"></i> Please select an intake to continue
                                </p>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f0f4fb' }}>
                                {[
                                    { icon: 'fas fa-lock', text: 'Secure submission' },
                                    { icon: 'fas fa-user-shield', text: 'Account created automatically' },
                                    { icon: 'fas fa-bell', text: 'Instant confirmation' },
                                ].map((b, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: '.7rem', fontFamily: 'Poppins,sans-serif' }}>
                                        <i className={b.icon} style={{ color: '#cbd5e1', fontSize: '.68rem' }}></i> {b.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>

                    {/* ════ SIDEBAR ════ */}
                    <div className="enrol-sidebar" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Course card */}
                        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(8,31,78,.07)', border: '1px solid #e8eaf0' }}>
                            {course.image_url
                                ? <img src={course.image_url} alt={course.title} style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
                                : <div style={{ height: 120, background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-book-open" style={{ color: 'rgba(255,255,255,.3)', fontSize: '3rem' }}></i>
                                  </div>
                            }
                            <div style={{ padding: '18px 20px' }}>
                                {course.level && (
                                    <span className={`course-level ${course.level_class || ''}`} style={{ marginBottom: 8, display: 'inline-block', fontSize: '.7rem' }}>{course.level}</span>
                                )}
                                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, color: '#081f4e', fontSize: '1rem', margin: '0 0 14px', lineHeight: 1.3 }}>{course.title}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { icon: 'fas fa-clock',          label: course.duration,             color: '#3b82f6' },
                                        { icon: 'fas fa-tag',            label: course.price,                color: '#10b981' },
                                        { icon: 'fas fa-users',          label: `${course.students_count}+ enrolled`, color: '#8b5cf6' },
                                        { icon: 'fas fa-star',           label: `${course.rating} / 5 rating`, color: '#f59e0b' },
                                    ].map((r, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: 7, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className={r.icon} style={{ color: r.color, fontSize: '.62rem' }}></i>
                                            </div>
                                            <span style={{ fontSize: '.8rem', color: '#475569', fontFamily: 'Poppins,sans-serif', fontWeight: 500 }}>{r.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selected intake */}
                        {selectedIntake ? (
                            <div style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius: 18, padding: '20px', color: '#fff', boxShadow: '0 8px 24px rgba(13,148,136,.25)' }}>
                                <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.65)', fontFamily: 'Poppins,sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <i className="fas fa-calendar-check"></i> Selected Intake
                                </div>
                                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.95rem', marginBottom: 10 }}>{selectedIntake.intake_name}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.78rem', color: 'rgba(255,255,255,.8)', fontFamily: 'Poppins,sans-serif' }}>
                                        <i className="fas fa-play-circle" style={{ fontSize: '.7rem' }}></i> Starts {fmt(selectedIntake.intake_start_date)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.78rem', color: 'rgba(255,255,255,.8)', fontFamily: 'Poppins,sans-serif' }}>
                                        <i className="fas fa-flag-checkered" style={{ fontSize: '.7rem' }}></i> Ends {fmt(selectedIntake.intake_end_date)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: 18, border: '2px dashed #e2e8f0', padding: '20px', textAlign: 'center' }}>
                                <i className="fas fa-calendar-alt" style={{ color: '#cbd5e1', fontSize: '1.5rem', display: 'block', marginBottom: 8 }}></i>
                                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#94a3b8', fontSize: '.82rem' }}>No intake selected</div>
                                <div style={{ color: '#cbd5e1', fontSize: '.75rem', fontFamily: 'Poppins,sans-serif', marginTop: 4 }}>Choose an intake from the form</div>
                            </div>
                        )}

                        {/* What happens next */}
                        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e8eaf0', padding: '20px', boxShadow: '0 2px 12px rgba(8,31,78,.04)' }}>
                            <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, color: '#081f4e', fontSize: '.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fas fa-list-ol" style={{ color: '#fe730c' }}></i> What Happens Next
                            </div>
                            {[
                                { icon: 'fas fa-paper-plane', color: '#3b82f6', text: 'Submit this form' },
                                { icon: 'fas fa-key',         color: '#10b981', text: 'Receive login credentials' },
                                { icon: 'fas fa-search',      color: '#8b5cf6', text: 'Application is reviewed' },
                                { icon: 'fas fa-rocket',      color: '#fe730c', text: 'Get confirmed & start' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 9, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={s.icon} style={{ color: s.color, fontSize: '.68rem' }}></i>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.55rem', fontWeight: 800, fontFamily: 'Poppins,sans-serif', flexShrink: 0 }}>{i + 1}</span>
                                        <span style={{ color: '#475569', fontSize: '.78rem', fontFamily: 'Poppins,sans-serif', fontWeight: 500 }}>{s.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Help link */}
                        <div style={{ background: 'linear-gradient(135deg,#f8faff,#eff4ff)', borderRadius: 16, border: '1px solid #dbeafe', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className="fas fa-headset" style={{ color: '#fff', fontSize: '.85rem' }}></i>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#1e40af', fontSize: '.82rem', marginBottom: 2 }}>Need help?</div>
                                <Link to="/contact" style={{ color: '#3b82f6', fontFamily: 'Poppins,sans-serif', fontSize: '.75rem', fontWeight: 600, textDecoration: 'none' }}>Contact our admissions team →</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 860px) {
                    .enrol-grid { grid-template-columns: 1fr !important; }
                    .enrol-sidebar { position: static !important; }
                }
                @media (max-width: 540px) {
                    .enrol-grid > form > div > div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
