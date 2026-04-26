import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ── Hero background slider (uses dynamic URLs) ── */
function HeroSlider({ slides }) {
    const [current, setCurrent] = useState(0);
    const count = slides.length;

    useEffect(() => {
        if (count < 2) return;
        const timer = setInterval(() => setCurrent(c => (c + 1) % count), 6000);
        return () => clearInterval(timer);
    }, [count]);

    const move = dir => setCurrent(c => (c + dir + count) % count);

    return (
        <>
            {slides.map((url, i) => (
                <div key={i} className={`slide${i === current ? ' active' : ''}`}
                    style={{ backgroundImage: `url('${url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
            ))}
            {count > 1 && <>
                <button className="slide-arrow slide-prev" onClick={() => move(-1)}><i className="fas fa-chevron-left"></i></button>
                <button className="slide-arrow slide-next" onClick={() => move(1)}><i className="fas fa-chevron-right"></i></button>
                <div className="slide-nav">
                    {slides.map((_, i) => (
                        <button key={i} className={`slide-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)}></button>
                    ))}
                </div>
            </>}
        </>
    );
}

/* ── Right-side image carousel ── */
function HeroRCarousel({ images, floatTitle, floatSubtitle }) {
    const [cur, setCur] = useState(0);

    useEffect(() => {
        if (images.length < 2) return;
        const timer = setInterval(() => setCur(c => (c + 1) % images.length), 3500);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="hero-img-wrap">
            <div className="rcarousel" id="heroRCarousel">
                <div className="rcarousel-track" style={{ transform: `translateX(-${cur * 100}%)` }}>
                    {images.map((img, i) => (
                        <div key={i} className="rcarousel-slide"><img src={img.src} alt={img.alt || ''} /></div>
                    ))}
                </div>
                {images.length > 1 && (
                    <div className="rcarousel-dots">
                        {images.map((_, i) => (
                            <button key={i} className={`rcarousel-dot${i === cur ? ' active' : ''}`} aria-label={`Slide ${i + 1}`} onClick={() => setCur(i)}></button>
                        ))}
                    </div>
                )}
            </div>
            <div className="hero-img-sparkle"><i className="fas fa-star"></i></div>
            <div className="hero-float-card">
                <div className="hero-float-icon"><i className="fas fa-code"></i></div>
                <div>
                    <strong>{floatTitle || 'Live Projects'}</strong>
                    <p>{floatSubtitle || 'Real-world experience'}</p>
                </div>
            </div>
        </div>
    );
}

/* ── Animated counter ── */
function Counter({ target }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                let c = 0;
                const step = Math.ceil(target / 60);
                const timer = setInterval(() => {
                    c = Math.min(c + step, target);
                    setCount(c);
                    if (c >= target) clearInterval(timer);
                }, 25);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return <span ref={ref}>{count}</span>;
}

/* ── Values carousel ── */
function ValuesCarousel({ values }) {
    const [cur, setCur] = useState(0);
    const [visible, setVisible] = useState(4);

    useEffect(() => {
        const update = () => {
            if (window.innerWidth <= 600) setVisible(1);
            else if (window.innerWidth <= 1024) setVisible(2);
            else setVisible(4);
        };
        update();
        window.addEventListener('resize', update);
        const timer = setInterval(() => {
            setCur(c => {
                const max = Math.max(0, values.length - visible);
                return c >= max ? 0 : c + 1;
            });
        }, 3000);
        return () => { window.removeEventListener('resize', update); clearInterval(timer); };
    }, [visible, values.length]);

    if (!values.length) return null;
    const max = Math.max(0, values.length - visible);

    return (
        <div className="values-carousel-wrap">
            <button className="values-btn values-btn-prev" onClick={() => setCur(c => Math.max(0, c - 1))}>
                <i className="fas fa-chevron-left"></i>
            </button>
            <div className="values-carousel-viewport">
                <div className="values-carousel-track"
                    style={{ transform: `translateX(-${cur * (100 / values.length) * (values.length / visible)}%)`, display: 'flex', width: `${(values.length / visible) * 100}%` }}>
                    {values.map((v, i) => (
                        <div key={i} className="value-card" style={{ width: `${100 / values.length}%` }}>
                            <div className="value-icon">{v.icon}</div>
                            <h4>{v.title}</h4>
                            <p>{v.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <button className="values-btn values-btn-next" onClick={() => setCur(c => Math.min(max, c + 1))}>
                <i className="fas fa-chevron-right"></i>
            </button>
            <div className="values-dots">
                {Array.from({ length: max + 1 }).map((_, i) => (
                    <button key={i} className={`values-dot${i === cur ? ' active' : ''}`} onClick={() => setCur(i)} aria-label={`Slide ${i + 1}`}></button>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════ MAIN HOME ═══════════════════ */
export default function Home() {
    const [content, setContent] = useState(null);

    useEffect(() => {
        fetch('/api/home-content')
            .then(r => r.json())
            .then(setContent)
            .catch(() => {});
    }, []);

    /* Scroll reveal */
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.step-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity .6s ease, transform .6s ease';
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [content]);

    /* Defaults while loading */
    const hero   = content?.hero   || {};
    const about  = content?.about  || {};
    const values = content?.values || [];
    const steps  = content?.steps  || [];
    const heroImages = content?.hero_images || [];

    const bgSlides   = (content?.bg_slides  || []).map(s => s.src);
    const features = about.features || [];

    /* Helper to highlight part of a title */
    const hl = (normal, highlight, hlClass = 'text-teal') => (
        <>{normal} <span className={hlClass}>{highlight}</span></>
    );

    return (
        <>
            {/* HERO */}
            <section id="hero">
                <HeroSlider slides={bgSlides} />
                <div className="hero-content">
                    <div className="hero-left">
                        <div className="hero-badge">
                            <i className="fas fa-star" style={{ color: '#ffe066', fontSize: '.75rem' }}></i> {hero.badge_text || 'New batch starting soon!'}
                        </div>
                        <h1 className="hero-title">
                            {hero.title_part1 || 'Launch Your'} <span className="text-teal">{hero.title_highlight1 || 'Tech'}</span><br />
                            <span className="text-orange">{hero.title_highlight2 || 'Career'}</span> {hero.title_part2 || 'Today'}
                        </h1>
                        <p className="hero-sub">{hero.subtitle || 'Join Techsphere Digital Skills Academy and master cutting-edge technologies with industry experts.'}</p>
                        <div className="hero-btns">
                            <Link to={hero.btn1_link || '/courses'} className="btn-hero-primary">{hero.btn1_label || 'Explore Courses'} <i className="fas fa-arrow-right"></i></Link>
                            <a href="#" className="btn-hero-secondary"><i className="fas fa-download"></i> {hero.btn2_label || 'Download Brochure'}</a>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat"><strong>{hero.stat1_value || '1,000+'}</strong><span>{hero.stat1_label || 'Graduates'}</span></div>
                            <div className="hero-stat-divider"></div>
                            <div className="hero-stat"><strong>{hero.stat2_value || '95%'}</strong><span>{hero.stat2_label || 'Job Placement'}</span></div>
                            <div className="hero-stat-divider"></div>
                            <div className="hero-stat"><strong>{hero.stat3_value || '50+'}</strong><span>{hero.stat3_label || 'Industry Partners'}</span></div>
                        </div>
                    </div>
                    <div className="hero-right">
                        <HeroRCarousel
                            images={heroImages}
                            floatTitle={hero.float_title}
                            floatSubtitle={hero.float_subtitle}
                        />
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="section">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-img-wrap">
                            {about.image_url && (
                                <img src={about.image_url} alt="About Techsphere" className="about-img" />
                            )}
                            <div className="about-badge">
                                <h3>{about.years_badge || '12+'}</h3>
                                <p>{about.years_label || 'Years of Excellence'}</p>
                            </div>
                        </div>
                        <div className="about-content">
                            <span className="badge">{about.badge_text || 'Who We Are'}</span>
                            <h2 className="section-title">
                                {about.title || 'Empowering Growth Through'} <span>{about.title_highlight || 'World-Class Training'}</span>
                            </h2>
                            <p className="section-subtitle">{about.subtitle || 'We deliver transformative training programs…'}</p>
                            {about.quote_text && (
                                <blockquote>"{about.quote_text}"<cite>— {about.quote_author}</cite></blockquote>
                            )}
                            {features.length > 0 && (
                                <div className="about-features">
                                    {features.map((f, i) => (
                                        <div key={i} className="about-feat"><i className="fas fa-check-circle"></i> {f}</div>
                                    ))}
                                </div>
                            )}
                            <Link to={about.cta_link || '/contact'} className="btn btn-navy">
                                <i className="fas fa-paper-plane"></i> {about.cta_label || 'Start Your Training Journey'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CORE VALUES */}
            {values.length > 0 && (
                <section id="values" className="section">
                    <div className="container">
                        <div className="section-header" style={{ textAlign: 'center' }}>
                            <span className="badge" style={{ background: 'rgba(254,115,12,.2)' }}>{about.values_badge || 'Our'}</span>
                            <h2 className="section-title">
                                {(about.values_title || 'Core Values').replace(about.values_title_highlight || 'Values', '').trim()}{' '}
                                <span>{about.values_title_highlight || 'Values'}</span>
                            </h2>
                            <p className="section-subtitle" style={{ margin: '0 auto' }}>{about.values_subtitle || ''}</p>
                        </div>
                        <ValuesCarousel values={values} />
                    </div>
                </section>
            )}

            {/* HOW WE WORK */}
            {steps.length > 0 && (
                <section id="how" className="section">
                    <div className="container">
                        <div className="section-header" style={{ textAlign: 'center' }}>
                            <span className="badge">{about.steps_badge || 'Our Methodology'}</span>
                            <h2 className="section-title">
                                {(about.steps_title || 'Our Training Process').replace(about.steps_title_highlight || 'Process', '').trim()}{' '}
                                <span>{about.steps_title_highlight || 'Process'}</span>
                            </h2>
                            <p className="section-subtitle" style={{ margin: '0 auto' }}>{about.steps_subtitle || ''}</p>
                        </div>
                        <div className="steps-grid">
                            {steps.map(s => (
                                <div key={s.id} className="step-card">
                                    <div className="step-num">{s.step_number}</div>
                                    <h4>{s.title}</h4>
                                    <p>{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <button id="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><i className="fas fa-chevron-up"></i></button>
        </>
    );
}
