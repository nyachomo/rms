import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BANNER_SLIDES = [
    { icon: 'fas fa-users', iconClass: 'teal', number: '500', label: 'Members', title: 'Thriving Tech Community', desc: 'Join 500+ passionate learners, developers, and innovators building the future of technology in East Africa.', tags: ['Community', 'Networking', 'Innovation'] },
    { icon: 'fas fa-calendar-alt', iconClass: 'orange', number: '48', label: 'Events/Year', title: 'Regular Hands-On Events', desc: 'Monthly workshops, hackathons, coding bootcamps, and industry talks to keep your skills sharp.', tags: ['Workshops', 'Hackathons', 'Bootcamps'] },
    { icon: 'fas fa-trophy', iconClass: 'green', number: '120', label: 'Projects Launched', title: 'Real Projects, Real Impact', desc: 'Members have launched 120+ digital projects, apps, and startups through our club programs.', tags: ['Projects', 'Startups', 'Portfolio'] },
];

const CURRICULUM = [
    { icon: 'fas fa-code', title: 'Web & App Development', desc: 'Hands-on sessions covering modern web development, mobile apps, and software engineering fundamentals.', items: ['HTML, CSS & JavaScript', 'React & Node.js', 'Mobile Development', 'Version Control (Git)'] },
    { icon: 'fas fa-shield-alt', title: 'Cybersecurity Basics', desc: 'Learn to identify threats, protect systems, and develop a security-first mindset for the digital world.', items: ['Network security fundamentals', 'Ethical hacking intro', 'Password & account security', 'Cyber incident response'] },
    { icon: 'fas fa-chart-bar', title: 'Data & AI Literacy', desc: 'Explore data analysis, visualisation, and the basics of artificial intelligence and machine learning.', items: ['Data analysis with Python', 'Visualisation tools', 'AI & ML fundamentals', 'Prompt engineering'] },
    { icon: 'fas fa-bullhorn', title: 'Digital Marketing', desc: 'Practical introduction to social media marketing, SEO, content creation, and online brand building.', items: ['Social media strategy', 'SEO fundamentals', 'Content creation tools', 'Analytics & insights'] },
    { icon: 'fas fa-pencil-ruler', title: 'UI/UX & Design Thinking', desc: 'Learn design principles, wireframing, and how to create user-centred digital experiences.', items: ['Design thinking process', 'Figma basics', 'Wireframing & prototyping', 'User research methods'] },
    { icon: 'fas fa-microphone', title: 'Tech Entrepreneurship', desc: 'Turn your ideas into reality with sessions on startup fundamentals, pitching, and building digital products.', items: ['Ideation & validation', 'Business model canvas', 'Pitching to investors', 'Building an MVP'] },
];

const BENEFITS = [
    { icon: 'fas fa-laptop-code', title: 'Hands-On Learning', desc: 'Every session involves building real things — not just theory. You leave with tangible skills and a growing portfolio.' },
    { icon: 'fas fa-users', title: 'Vibrant Community', desc: 'Connect with like-minded peers, find collaborators for projects, and build friendships that last beyond the club.' },
    { icon: 'fas fa-user-tie', title: 'Industry Mentorship', desc: 'Get guidance from experienced tech professionals, startup founders, and Techsphere facilitators.' },
    { icon: 'fas fa-briefcase', title: 'Career Opportunities', desc: 'Access exclusive job boards, internship connections, and career-building resources through our industry network.' },
    { icon: 'fas fa-certificate', title: 'Certificates & Recognition', desc: 'Earn certificates for completed modules and projects to showcase on your CV and LinkedIn profile.' },
    { icon: 'fas fa-rocket', title: 'Launch Your Startup', desc: 'Get support, resources, and mentorship to turn your tech idea into a real product or business venture.' },
];

const HOW_STEPS = [
    { num: '01', title: 'Register', desc: 'Fill out the online registration form and submit your details. Registration is free and takes under 5 minutes.' },
    { num: '02', title: 'Orientation', desc: 'Attend our monthly orientation session to meet the team, learn the schedule, and choose your learning track.' },
    { num: '03', title: 'Learn & Build', desc: 'Attend weekly workshops, hackathons, and project sessions. Build your skills and your portfolio simultaneously.' },
    { num: '04', title: 'Grow & Contribute', desc: 'Become a mentor, lead projects, speak at events, and give back to the community as you advance in your journey.' },
];

function RegModal({ open, onClose }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', school: '', track: '', why: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/ict-club/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : (data.message || 'Registration failed. Please try again.');
                setError(msg);
            } else {
                setResult(data);
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm({ name: '', email: '', phone: '', school: '', track: '', why: '' });
        setError('');
        setResult(null);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="reg-modal-overlay open" onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="reg-modal">
                <button className="reg-modal-close" onClick={handleClose}><i className="fas fa-times"></i></button>
                {result ? (
                    <div className="reg-success" style={{ display: 'block', padding: '32px 28px' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(13,148,136,.35)' }}>
                            <i className="fas fa-check" style={{ fontSize: '1.6rem', color: '#fff' }}></i>
                        </div>
                        <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#081f4e', marginBottom: 10 }}>Registration Successful!</h4>
                        <p style={{ color: '#6b7280', fontSize: '.92rem', marginBottom: 20 }}>Welcome to the Techsphere ICT Club! Your account has been created.</p>
                        <div style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: 12, padding: '18px 20px', marginBottom: 18, textAlign: 'left' }}>
                            <p style={{ fontSize: '.82rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                                <i className="fas fa-key" style={{ marginRight: 6 }}></i>Your Login Credentials
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: '#374151', marginBottom: 6 }}>
                                <span style={{ color: '#6b7280' }}>Email</span>
                                <strong style={{ fontFamily: 'monospace' }}>{result.login_email}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: '#374151' }}>
                                <span style={{ color: '#6b7280' }}>Password</span>
                                <strong style={{ fontFamily: 'monospace', letterSpacing: '.08em' }}>12345678</strong>
                            </div>
                        </div>
                        <p style={{ fontSize: '.8rem', color: '#9ca3af', marginBottom: 20 }}>
                            <i className="fas fa-lock" style={{ marginRight: 5 }}></i>Please change your password after first login.
                        </p>
                        <button onClick={handleClose} style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', color: '#fff', border: 'none', borderRadius: 50, padding: '11px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '.92rem', cursor: 'pointer' }}>
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="reg-modal-head">
                            <div className="modal-badge"><i className="fas fa-laptop-code"></i> ICT Club Registration</div>
                            <h3>Join the Club</h3>
                            <p>Fill in your details to register for the Techsphere ICT Club. Membership is free for all students.</p>
                        </div>
                        <form className="reg-form" onSubmit={submit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" name="name" placeholder="Jane Mwangi" required value={form.name} onChange={handle} />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" name="email" placeholder="jane@example.com" required value={form.email} onChange={handle} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" name="phone" placeholder="+254 700 000 000" required value={form.phone} onChange={handle} />
                                </div>
                                <div className="form-group">
                                    <label>School / Institution</label>
                                    <input type="text" name="school" placeholder="University of Nairobi" value={form.school} onChange={handle} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Learning Track of Interest *</label>
                                <select name="track" required value={form.track} onChange={handle}>
                                    <option value="">Select a track...</option>
                                    <option>Web & App Development</option>
                                    <option>Cybersecurity</option>
                                    <option>Data & AI Literacy</option>
                                    <option>Digital Marketing</option>
                                    <option>UI/UX & Design Thinking</option>
                                    <option>Tech Entrepreneurship</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Why do you want to join? (Optional)</label>
                                <textarea name="why" placeholder="Tell us briefly what you're hoping to learn or achieve..." value={form.why} onChange={handle}></textarea>
                            </div>
                            {error && (
                            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '11px 16px', marginBottom: 14, color: '#dc2626', fontSize: '.87rem' }}>
                                <i className="fas fa-exclamation-circle" style={{ marginRight: 7 }}></i>{error}
                            </div>
                        )}
                        <button type="submit" className="btn-submit" disabled={loading} style={loading ? { opacity: .65, cursor: 'not-allowed' } : {}}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                                : <><i className="fas fa-paper-plane"></i> Submit Registration</>}
                        </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function IctClub() {
    const [bannerSlide, setBannerSlide] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setBannerSlide(s => (s + 1) % BANNER_SLIDES.length), 4000);
        return () => clearInterval(t);
    }, []);

    return (
        <>
            <RegModal open={modalOpen} onClose={() => setModalOpen(false)} />

            {/* PAGE BANNER */}
            <div className="page-banner" style={{ marginTop: '128px', padding: '36px 0 30px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #081f4e 0%, #0d2d6b 60%, #1a1a4e 100%)' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1588072432836-e10032774350?w=1600&q=60')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08 }}></div>
                <div className="page-banner-inner" style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 420px', alignItems: 'center', gap: '60px' }}>
                    <div>
                        <div className="breadcrumb">
                            <Link to="/">Home</Link>
                            <i className="fas fa-chevron-right"></i>
                            <span>ICT Club</span>
                        </div>
                        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '14px' }}>
                            Techsphere <span style={{ color: 'var(--red)' }}>ICT Club</span>
                        </h1>
                        <p className="banner-desc">A community of passionate learners building real-world tech skills through hands-on workshops, hackathons, mentorship, and collaborative projects.</p>
                        <div className="banner-stats">
                            {[
                                { icon: 'fas fa-users', strong: '500+', small: 'Active Members' },
                                { icon: 'fas fa-calendar-alt', strong: '4/Month', small: 'Events & Workshops' },
                                { icon: 'fas fa-laptop-code', strong: 'Free', small: 'Membership' },
                            ].map((s, i) => (
                                <div key={i} className="banner-stat">
                                    <i className={s.icon}></i>
                                    <div><strong>{s.strong}</strong><small>{s.small}</small></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
                            <button className="btn-register-ict" onClick={() => setModalOpen(true)}>
                                <i className="fas fa-user-plus"></i> Register Now — It's Free
                            </button>
                            <a href="tel:+254748800500" className="btn-register-ict-outline">
                                <i className="fas fa-phone-alt"></i> Call Us
                            </a>
                        </div>
                    </div>
                    <div className="banner-carousel-wrap" style={{ position: 'relative' }}>
                        <div className="banner-carousel" style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
                            {BANNER_SLIDES.map((s, i) => (
                                <div key={i} className={`banner-slide${i === bannerSlide ? ' active' : ''}`}>
                                    <div className="bs-top-row">
                                        <div className={`bs-icon ${s.iconClass}`}><i className={s.icon}></i></div>
                                        <div>
                                            <div className="bs-number">{s.number}<span>+</span></div>
                                            <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.8rem' }}>{s.label}</div>
                                        </div>
                                    </div>
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                    <div className="bs-tags">{s.tags.map(t => <span key={t} className="bs-tag">{t}</span>)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="banner-dots">
                            {BANNER_SLIDES.map((_, i) => (
                                <button key={i} className={`banner-dot${i === bannerSlide ? ' active' : ''}`} onClick={() => setBannerSlide(i)}></button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ABOUT */}
            <section className="section">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-img-wrap">
                            <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" alt="ICT Club Community" style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', borderRadius: '20px' }} />
                            <div className="about-img-badge"><i className="fas fa-star"></i> Est. 2019 · 500+ Members</div>
                        </div>
                        <div className="about-text">
                            <span className="sec-label">Who We Are</span>
                            <h2 className="sec-title">A Community Built for <span>Tech Leaders</span> of Tomorrow</h2>
                            <p>The Techsphere ICT Club is a free, student-focused community designed to bridge the gap between classroom learning and industry-ready skills. Whether you're a complete beginner or an experienced developer, there's a place for you here.</p>
                            <p>We meet regularly for workshops, hackathons, project sessions, and industry talks — all designed to accelerate your growth in the digital economy.</p>
                            <div className="about-feats">
                                {['Free membership for all students', 'Weekly practical workshops', 'Industry mentors and speakers', 'Hackathons and competitions',
                                  'Project portfolio support', 'Job & internship connections', 'Certificate recognition', 'Startup incubation support'].map((f, i) => (
                                    <div key={i} className="about-feat"><i className="fas fa-check-circle"></i> {f}</div>
                                ))}
                            </div>
                            <button className="btn-register-ict" onClick={() => setModalOpen(true)} style={{ marginTop: '8px', border: 'none' }}>
                                <i className="fas fa-user-plus"></i> Join the Club Today
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section section-alt">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '0' }}>
                        <span className="sec-label">Getting Started</span>
                        <h2 className="sec-title">How to <span>Join &amp; Participate</span></h2>
                        <p className="sec-desc" style={{ margin: '0 auto' }}>Four simple steps to become an active member of the Techsphere ICT Club.</p>
                    </div>
                    <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '28px', marginTop: '48px' }}>
                        {HOW_STEPS.map(s => (
                            <div key={s.num} className="step-card" style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #e8edf5', padding: '28px 22px', textAlign: 'center' }}>
                                <div className="step-num" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #fe730c, #ff9a5c)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 18px rgba(254,115,12,0.35)' }}>{s.num}</div>
                                <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.95rem', fontWeight: 700, color: '#081f4e', marginBottom: '10px' }}>{s.title}</h4>
                                <p style={{ fontSize: '.86rem', color: '#6b7280', lineHeight: 1.65 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* IMPACT STRIP */}
            <div className="impact-strip">
                <div className="container">
                    <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px', textAlign: 'center' }}>
                        {[
                            { num: '500+', label: 'Active Members' },
                            { num: '48', label: 'Events Per Year' },
                            { num: '120+', label: 'Projects Launched' },
                            { num: '85%', label: 'Employment Rate' },
                        ].map((s, i) => (
                            <div key={i}>
                                <span className="impact-num">{s.num}</span>
                                <span className="impact-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CURRICULUM */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center' }}>
                        <span className="sec-label">Learning Tracks</span>
                        <h2 className="sec-title">What You'll <span>Learn & Build</span></h2>
                        <p className="sec-desc" style={{ margin: '0 auto' }}>Six practical learning tracks designed for different interests and career paths in the tech industry.</p>
                    </div>
                    <div className="curriculum-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px', marginTop: '48px' }}>
                        {CURRICULUM.map((c, i) => (
                            <div key={i} className="curriculum-card" style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #e8edf5', padding: '28px 24px' }}>
                                <div className="curriculum-icon"><i className={c.icon}></i></div>
                                <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#081f4e', marginBottom: '10px' }}>{c.title}</h4>
                                <p style={{ fontSize: '.87rem', color: '#6b7280', lineHeight: 1.7 }}>{c.desc}</p>
                                <ul style={{ listStyle: 'none', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                    {c.items.map((item, j) => (
                                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.84rem', color: '#4b5563' }}>
                                            <i className="fas fa-check" style={{ color: 'var(--red)', fontSize: '.75rem' }}></i> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="section section-alt">
                <div className="container">
                    <div style={{ textAlign: 'center' }}>
                        <span className="sec-label">Member Benefits</span>
                        <h2 className="sec-title">Why Join the <span>ICT Club?</span></h2>
                        <p className="sec-desc" style={{ margin: '0 auto' }}>Beyond just learning — we provide a complete ecosystem for your tech career growth.</p>
                    </div>
                    <div className="benefits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '24px', marginTop: '48px' }}>
                        {BENEFITS.map((b, i) => (
                            <div key={i} className="benefit-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', background: '#fff', borderRadius: '14px', border: '1.5px solid #e8edf5', padding: '24px' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(254,115,12,0.15), rgba(254,115,12,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--red)', flexShrink: 0, border: '1.5px solid rgba(254,115,12,0.2)' }}>
                                    <i className={b.icon}></i>
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.97rem', fontWeight: 700, color: '#081f4e', marginBottom: '7px' }}>{b.title}</h4>
                                    <p style={{ fontSize: '.87rem', color: '#6b7280', lineHeight: 1.7 }}>{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ background: 'linear-gradient(135deg, #081f4e 0%, #1a1a4e 100%)', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(254,115,12,.12) 0%, transparent 70%)' }}></div>
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px', margin: '0 auto', padding: '0 20px' }}>
                    <span className="sec-label" style={{ background: 'rgba(254,115,12,0.2)' }}>Free to Join</span>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 800, color: '#fff', margin: '16px 0', lineHeight: 1.3 }}>
                        Ready to Start Your <span style={{ color: 'var(--red)' }}>Tech Journey?</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,.72)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '32px' }}>
                        Join hundreds of students and young professionals already building their digital skills at the Techsphere ICT Club. It's completely free.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-register-ict" onClick={() => setModalOpen(true)} style={{ border: 'none', padding: '15px 32px', fontSize: '1rem' }}>
                            <i className="fas fa-user-plus"></i> Register Now — Free
                        </button>
                        <Link to="/contact" className="btn-register-ict-outline" style={{ padding: '14px 30px', fontSize: '1rem' }}>
                            <i className="fas fa-envelope"></i> Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
