import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* Color → CSS icon-class map (matches existing stylesheet) */
const COLOR_TO_ICON_CLASS = {
    teal:   'icon-proficiency',
    orange: 'icon-foundational',
    purple: 'icon-mastery',
    navy:   'icon-corporate',
    green:  'icon-proficiency',
    red:    'icon-mastery',
    blue:   'icon-proficiency',
    amber:  'icon-foundational',
};

/* Fallback so any legacy slug that isn't in the DB still renders */
const LEGACY_META = {
    foundational: { label: 'Foundational',      icon: 'fas fa-seedling',    iconClass: 'icon-foundational', desc: 'Build a solid foundation in digital skills' },
    proficiency:  { label: 'Proficiency',        icon: 'fas fa-chart-line',  iconClass: 'icon-proficiency',  desc: 'Advance your skills to professional level' },
    mastery:      { label: 'Mastery',            icon: 'fas fa-trophy',      iconClass: 'icon-mastery',      desc: 'Expert-level specialisation and certification' },
    corporate:    { label: 'Corporate Training', icon: 'fas fa-building',    iconClass: 'icon-corporate',    desc: 'Tailored programs for teams and organisations' },
};

const BANNER_SLIDES = [
    { icon: 'fas fa-graduation-cap', iconClass: 'teal', label: 'Programs', title: 'Industry-Certified Programs', desc: 'Each course is designed with input from industry leaders and delivers real-world applicable skills.', tags: ['Certified', 'Practical', 'Industry-Led'] },
    { icon: 'fas fa-users', iconClass: 'orange', label: 'Students', title: 'Join a Thriving Community', desc: 'Learn alongside motivated professionals and build a powerful network that lasts a lifetime.', tags: ['Community', 'Networking', 'Mentorship'] },
    { icon: 'fas fa-briefcase', iconClass: 'green', label: '% Job Ready', title: 'Career-Ready Graduates', desc: 'Our graduates are equipped with the skills employers demand, with dedicated career support.', tags: ['Career Support', 'Job Placement', 'Portfolio'] },
];

export default function Courses() {
    const [courses, setCourses]           = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch]             = useState('');
    const [bannerSlide, setBannerSlide]   = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            fetch('/api/courses').then(r => r.json()),
            fetch('/api/public-course-categories').then(r => r.json()),
        ])
            .then(([coursesData, catsData]) => {
                setCourses(coursesData);
                setDbCategories(Array.isArray(catsData) ? catsData : []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const t = setInterval(() => setBannerSlide(s => (s + 1) % BANNER_SLIDES.length), 4000);
        return () => clearInterval(t);
    }, []);

    /* Build a category meta map from DB, falling back to legacy hard-coded values */
    const categoryMetaMap = dbCategories.reduce((acc, cat) => {
        acc[cat.slug] = {
            label:     cat.name,
            icon:      cat.icon || LEGACY_META[cat.slug]?.icon || 'fas fa-tag',
            iconClass: COLOR_TO_ICON_CLASS[cat.color] ?? LEGACY_META[cat.slug]?.iconClass ?? 'icon-foundational',
            desc:      cat.description || LEGACY_META[cat.slug]?.desc || '',
        };
        return acc;
    }, { ...LEGACY_META }); // seed with legacy so existing slugs still work if DB is empty

    /* Ordered category slugs from DB (active only, sorted by sort_order) */
    const orderedSlugs = dbCategories.length
        ? dbCategories.map(c => c.slug)
        : Object.keys(LEGACY_META);

    const filtered = courses.filter(c => {
        const matchCat    = activeFilter === 'all' || c.category === activeFilter;
        const tags        = Array.isArray(c.tags) ? c.tags : [];
        const matchSearch = !search
            || c.title.toLowerCase().includes(search.toLowerCase())
            || (c.description || '').toLowerCase().includes(search.toLowerCase())
            || tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchSearch;
    });

    const visibleSlugs = activeFilter === 'all' ? orderedSlugs : [activeFilter];

    /* Filter bar buttons — one per DB category + "All" */
    const FILTERS = [
        { key: 'all', label: 'All Courses', icon: 'fas fa-th-large', count: courses.length },
        ...orderedSlugs.map(slug => ({
            key:   slug,
            label: categoryMetaMap[slug]?.label ?? slug,
            icon:  categoryMetaMap[slug]?.icon  ?? 'fas fa-tag',
            count: courses.filter(c => c.category === slug).length,
        })),
    ];

    const totalStudents = courses.reduce((s, c) => s + (c.students_count || 0), 0);
    const avgRating = courses.length ? (courses.reduce((s, c) => s + parseFloat(c.rating || 0), 0) / courses.length).toFixed(1) : '0';

    return (
        <>
            {/* PAGE BANNER */}
            <div className="page-banner" style={{ marginTop: '128px' }}>
                <div className="page-banner-inner">
                    <div>
                        <div className="breadcrumb">
                            <Link to="/">Home</Link>
                            <i className="fas fa-chevron-right"></i>
                            <span>Courses</span>
                        </div>
                        <h1>Our <span>Courses</span></h1>
                        <p>Explore our industry-aligned programs designed to transform your career and unlock new opportunities in the digital economy.</p>
                        <div className="banner-stats">
                            {[
                                { icon: 'fas fa-book-open', strong: `${courses.length}`, small: 'Active Courses' },
                                { icon: 'fas fa-users', strong: `${totalStudents.toLocaleString()}+`, small: 'Enrolled Students' },
                                { icon: 'fas fa-star', strong: `${avgRating}★`, small: 'Average Rating' },
                            ].map((s, i) => (
                                <div key={i} className="banner-stat">
                                    <i className={s.icon}></i>
                                    <div><strong>{s.strong}</strong><small>{s.small}</small></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="banner-carousel-wrap">
                        <div className="banner-carousel">
                            {BANNER_SLIDES.map((s, i) => (
                                <div key={i} className={`banner-slide${i === bannerSlide ? ' active' : ''}`}>
                                    <div className="bs-top-row">
                                        <div className={`bs-icon ${s.iconClass}`}><i className={s.icon}></i></div>
                                        <div>
                                            <div className="bs-number">{i === 0 ? courses.length : i === 1 ? (totalStudents > 1000 ? Math.round(totalStudents / 100) * 100 : totalStudents) : 95}<span>+</span></div>
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

            {/* TWO-COLUMN LAYOUT */}
            <section className="courses-page-section" style={{ padding: '40px 0 60px' }}>
                <div className="container" style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>

                    {/* ── Left: Category sidebar ── */}
                    <div style={{ width: 270, flexShrink: 0, position: 'sticky', top: 100, marginRight: 32 }}>
                        <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 20px rgba(8,31,78,.06)' }}>
                            {/* Sidebar header */}
                            <div style={{ background: 'linear-gradient(135deg,#081f4e,#0d2d6b)', padding: '20px 20px 18px' }}>
                                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Browse By</div>
                                <div style={{ color: '#fff', fontWeight: 800, fontSize: '.82rem', fontFamily: 'Poppins,sans-serif', whiteSpace: 'nowrap' }}>Courses/Program Categories</div>
                            </div>

                            {/* Category tabs */}
                            <div style={{ padding: '10px 10px', maxHeight: 380, overflowY: 'auto', overflowX: 'hidden' }}>
                                {FILTERS.map(f => {
                                    const isActive = activeFilter === f.key;
                                    return (
                                        <button key={f.key} onClick={() => setActiveFilter(f.key)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '12px 14px', borderRadius: 12, border: 'none',
                                                cursor: 'pointer', textAlign: 'left', marginBottom: 3,
                                                background: isActive ? 'linear-gradient(135deg,#081f4e,#1a3a7a)' : 'transparent',
                                                transition: 'all .18s',
                                                fontFamily: 'Poppins,sans-serif',
                                            }}
                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f4f6fb'; }}
                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                                            {/* Icon */}
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '.85rem',
                                                background: isActive ? 'rgba(255,255,255,.15)' : '#f4f6fb',
                                                color: isActive ? '#fdba74' : '#6b7280',
                                                transition: 'all .18s',
                                            }}>
                                                <i className={f.icon}></i>
                                            </div>
                                            {/* Label */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '.85rem', fontWeight: 700, color: isActive ? '#fff' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {f.label}
                                                </div>
                                                {f.key !== 'all' && categoryMetaMap[f.key]?.desc && (
                                                    <div style={{ fontSize: '.68rem', color: isActive ? 'rgba(255,255,255,.5)' : '#9ca3af', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {categoryMetaMap[f.key].desc}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Count badge */}
                                            <span style={{
                                                flexShrink: 0, minWidth: 26, height: 22, borderRadius: 50,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '.7rem', fontWeight: 700, padding: '0 7px',
                                                background: isActive ? 'rgba(254,115,12,.25)' : '#f1f5f9',
                                                color: isActive ? '#fdba74' : '#6b7280',
                                                transition: 'all .18s',
                                            }}>
                                                {f.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* CTA inside sidebar */}
                            <div style={{ margin: '4px 10px 10px', background: 'linear-gradient(135deg,rgba(254,115,12,.1),rgba(254,115,12,.05))', border: '1.5px solid rgba(254,115,12,.2)', borderRadius: 12, padding: '14px 16px' }}>
                                <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#081f4e', marginBottom: 4 }}>
                                    <i className="fas fa-question-circle" style={{ color: '#fe730c', marginRight: 6 }}></i>
                                    Not sure where to start?
                                </div>
                                <p style={{ fontSize: '.72rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>
                                    Get free advice from our counsellors.
                                </p>
                                <Link to="/contact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#fe730c,#f97316)', color: '#fff', borderRadius: 8, padding: '8px 12px', textDecoration: 'none', fontSize: '.75rem', fontWeight: 700, fontFamily: 'Poppins,sans-serif' }}>
                                    <i className="fas fa-envelope"></i> Free Counselling
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Search + Courses ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Search + results count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                                <i className="fas fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '.85rem' }}></i>
                                <input
                                    type="text"
                                    placeholder="Search course, topics, programs…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '.88rem', fontFamily: 'Poppins,sans-serif', color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none', boxShadow: '0 1px 6px rgba(8,31,78,.05)' }}
                                />
                            </div>
                            <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: '.83rem', color: '#6b7280', whiteSpace: 'nowrap', boxShadow: '0 1px 6px rgba(8,31,78,.05)' }}>
                                <span style={{ color: '#081f4e', fontWeight: 800 }}>{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''} found
                            </div>
                        </div>

                        {/* Active category header */}
                        {activeFilter !== 'all' && categoryMetaMap[activeFilter] && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', padding: '16px 20px', boxShadow: '0 2px 10px rgba(8,31,78,.04)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#fe730c', flexShrink: 0 }}>
                                    <i className={categoryMetaMap[activeFilter].icon}></i>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#081f4e', fontFamily: 'Poppins,sans-serif' }}>{categoryMetaMap[activeFilter].label}</div>
                                    {categoryMetaMap[activeFilter].desc && (
                                        <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 2 }}>{categoryMetaMap[activeFilter].desc}</div>
                                    )}
                                </div>
                                <span style={{ marginLeft: 'auto', background: '#f4f6fb', color: '#6b7280', borderRadius: 50, padding: '4px 14px', fontSize: '.75rem', fontWeight: 700 }}>
                                    {filtered.length} course{filtered.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}

                        {/* Courses */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
                                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: 12, display: 'block', color: '#fe730c' }}></i>
                                <p style={{ fontFamily: 'Poppins,sans-serif' }}>Loading courses…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="no-results visible">
                                <i className="fas fa-search"></i>
                                <h3>No courses found</h3>
                                <p>Try a different search term or select another category.</p>
                            </div>
                        ) : (
                            <div className="courses-page-grid">
                                {(activeFilter === 'all' ? visibleSlugs : [activeFilter]).map(cat => {
                                    const catCourses = filtered.filter(c => c.category === cat);
                                    if (!catCourses.length) return null;
                                    return catCourses.map(c => {
                                        const tags = Array.isArray(c.tags) ? c.tags : [];
                                        return (
                                            <div key={c.id} className="course-card-ext" onClick={() => navigate(`/courses/${c.slug}`)}>
                                                <div className="course-img-wrap">
                                                    {c.image_url && <img src={c.image_url} alt={c.title} />}
                                                    <span className={`course-level ${c.level_class}`}>{c.level}</span>
                                                    {c.badge && <span className="course-badge">{c.badge}</span>}
                                                </div>
                                                <div className="course-body-ext">
                                                    <div className="course-title-row">
                                                        <div className={`course-icon ${c.icon_class}`}><i className={c.icon}></i></div>
                                                        <h3>{c.title}</h3>
                                                    </div>
                                                    <p className="course-desc-ext">{c.description}</p>
                                                    <div className="course-tags">{tags.map(t => <span key={t} className="course-tag">{t}</span>)}</div>
                                                    <div className="course-meta-ext">
                                                        <span><i className="fas fa-clock"></i> {c.duration}</span>
                                                        <span><i className="fas fa-users"></i> {c.students_count}</span>
                                                        <div className="course-stars-ext">
                                                            {[1,2,3,4,5].map(n => <i key={n} className="fas fa-star"></i>)}
                                                            <span>{c.rating} ({c.reviews_count})</span>
                                                        </div>
                                                    </div>
                                                    <div className="course-footer-ext">
                                                        <div className="course-price-ext">
                                                            <strong>{c.price}</strong>
                                                            <small>Full program</small>
                                                        </div>
                                                        <Link to={`/courses/${c.slug}`} className="btn-enroll" onClick={e => e.stopPropagation()}>
                                                            Enroll <i className="fas fa-arrow-right"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="courses-cta">
                <div className="courses-cta-inner">
                    <h2>Not Sure Which Course Is <span>Right for You?</span></h2>
                    <p>Our team of expert advisors is ready to help you choose the perfect program that matches your goals, experience level, and schedule.</p>
                    <div className="cta-btns">
                        <Link to="/contact" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                            <i className="fas fa-envelope"></i> Get Free Counselling
                        </Link>
                        <a href="tel:+254748800500" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1rem', borderColor: 'rgba(255,255,255,.35)', color: '#fff' }}>
                            <i className="fas fa-phone-alt"></i> Call Us Now
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
