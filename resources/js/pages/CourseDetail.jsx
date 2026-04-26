import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function CourseDetail() {
    const { courseId } = useParams();
    const [course, setCourse]       = useState(null);
    const [loading, setLoading]     = useState(true);
    const [notFound, setNotFound]   = useState(false);
    const [openSection, setOpenSection] = useState(0);

    useEffect(() => {
        setLoading(true); setNotFound(false);
        fetch(`/api/courses/${courseId}`)
            .then(r => { if (r.status === 404) { setNotFound(true); setLoading(false); return null; } return r.json(); })
            .then(data => { if (data) { setCourse(data); setLoading(false); } })
            .catch(() => { setNotFound(true); setLoading(false); });
    }, [courseId]);

    if (loading) {
        return (
            <div style={{ padding: '180px 20px 80px', textAlign: 'center' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#fe730c', marginBottom: '20px' }}></i>
                <p style={{ color: '#666' }}>Loading course…</p>
            </div>
        );
    }

    if (notFound || !course) {
        return (
            <div style={{ padding: '180px 20px 80px', textAlign: 'center' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#fe730c', marginBottom: '20px' }}></i>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', marginBottom: '12px' }}>Course Not Found</h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>The course you're looking for doesn't exist.</p>
                <Link to="/courses" className="btn btn-primary">Browse All Courses</Link>
            </div>
        );
    }

    const tags        = Array.isArray(course.tags) ? course.tags : [];
    const outcomes    = course.outcomes  || [];
    const curriculum  = course.curriculum || [];
    const instructors = course.instructors || [];

    return (
        <>
            {/* HERO */}
            <div className="course-detail-hero" style={{ marginTop: '128px', position: 'relative', height: '380px', overflow: 'hidden' }}>
                {course.image_url && <img src={course.image_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,31,78,0.88) 0%, rgba(8,31,78,0.60) 60%, rgba(8,31,78,0.35) 100%)' }}></div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                    <div className="container">
                        <div className="breadcrumb" style={{ marginBottom: '16px' }}>
                            <Link to="/" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Home</Link>
                            <i className="fas fa-chevron-right" style={{ color: 'rgba(255,255,255,.3)', fontSize: '.65rem', margin: '0 6px' }}></i>
                            <Link to="/courses" style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Courses</Link>
                            <i className="fas fa-chevron-right" style={{ color: 'rgba(255,255,255,.3)', fontSize: '.65rem', margin: '0 6px' }}></i>
                            <span style={{ color: 'var(--red)', fontWeight: 600 }}>{course.title}</span>
                        </div>
                        <span className={`course-level ${course.level_class}`} style={{ marginBottom: '12px', display: 'inline-block' }}>{course.level}</span>
                        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: 1.2 }}>{course.title}</h1>
                        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '1.1rem', fontFamily: 'Poppins, sans-serif' }}>{course.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="container" style={{ padding: '48px 24px 80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                    {/* LEFT */}
                    <div>
                        {/* Overview */}
                        {course.overview && (
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', fontSize: '1.4rem', marginBottom: '14px' }}>Course Overview</h2>
                                <div className="rte-render" dangerouslySetInnerHTML={{ __html: course.overview }} />
                            </section>
                        )}

                        {/* Learning Outcomes */}
                        {outcomes.length > 0 && (
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', fontSize: '1.4rem', marginBottom: '14px' }}>What You'll Learn</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                                    {outcomes.map((o, i) => (
                                        <div key={o.id ?? i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: '#f7f9fc', borderRadius: '10px', border: '1px solid #e8eaf0' }}>
                                            <i className="fas fa-check-circle" style={{ color: '#10b981', marginTop: '3px', flexShrink: 0 }}></i>
                                            <span style={{ fontSize: '.88rem', color: '#333', fontFamily: 'Poppins, sans-serif' }}>{o.outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Curriculum */}
                        {curriculum.length > 0 && (
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', fontSize: '1.4rem', marginBottom: '14px' }}>Curriculum</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {curriculum.map((m, i) => (
                                        <div key={m.id ?? i} style={{ border: '1px solid #e8eaf0', borderRadius: '12px', overflow: 'hidden' }}>
                                            <button
                                                onClick={() => setOpenSection(openSection === i ? -1 : i)}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: openSection === i ? '#081f4e' : '#f7f9fc', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '.8rem', fontWeight: 700, color: openSection === i ? 'rgba(255,255,255,.6)' : '#fe730c', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.week_label}</span>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: openSection === i ? '#fff' : '#081f4e', fontSize: '.97rem' }}>{m.title}</span>
                                                </div>
                                                <i className={`fas fa-chevron-${openSection === i ? 'up' : 'down'}`} style={{ color: openSection === i ? '#fff' : '#999', fontSize: '.8rem' }}></i>
                                            </button>
                                            {openSection === i && (
                                                <ul style={{ padding: '12px 20px 16px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' }}>
                                                    {(m.topics || []).map((t, j) => (
                                                        <li key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '.88rem', color: '#555' }}>
                                                            <i className="fas fa-play-circle" style={{ color: '#fe730c', fontSize: '.75rem', flexShrink: 0 }}></i>
                                                            {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Instructors */}
                        {instructors.length > 0 && (
                            <section>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', fontSize: '1.4rem', marginBottom: '14px' }}>Your Instructor{instructors.length > 1 ? 's' : ''}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {instructors.map((ins, i) => (
                                        <div key={ins.id ?? i} style={{ display: 'flex', gap: '18px', alignItems: 'center', padding: '20px', background: '#f7f9fc', borderRadius: '14px', border: '1px solid #e8eaf0' }}>
                                            {ins.image_url
                                                ? <img src={ins.image_url} alt={ins.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                : <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><i className="fas fa-user" style={{ color: '#999', fontSize: '1.5rem' }}></i></div>
                                            }
                                            <div>
                                                <h4 style={{ fontFamily: 'Poppins, sans-serif', color: '#081f4e', marginBottom: '3px' }}>{ins.name}</h4>
                                                <p style={{ color: '#fe730c', fontSize: '.85rem', fontWeight: 600, marginBottom: '6px', fontFamily: 'Poppins, sans-serif' }}>{ins.role}</p>
                                                <p style={{ color: '#666', fontSize: '.87rem', lineHeight: 1.5 }}>{ins.bio}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT: Enrollment Card */}
                    <div style={{ position: 'sticky', top: '148px' }}>
                        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 12px 50px rgba(8,31,78,.14)', border: '1px solid rgba(8,31,78,.06)', overflow: 'hidden' }}>
                            <div style={{ background: 'linear-gradient(135deg, #081f4e 0%, #1e3a8a 100%)', padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', fontWeight: 900, color: course.price === 'Contact Us' ? '#1ad1ff' : '#fe730c' }}>{course.price}</div>
                                {course.price !== 'Contact Us' && <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.82rem' }}>Full program fee</div>}
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    {[
                                        { icon: 'fas fa-clock', label: 'Duration', value: course.duration },
                                        { icon: 'fas fa-users', label: 'Students Enrolled', value: `${course.students_count}+` },
                                        { icon: 'fas fa-star', label: 'Rating', value: `${course.rating}/5 (${course.reviews_count} reviews)` },
                                        { icon: 'fas fa-certificate', label: 'Certificate', value: 'Included on completion' },
                                        { icon: 'fas fa-laptop', label: 'Format', value: 'Online & In-Person' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '.85rem', fontFamily: 'Poppins, sans-serif' }}>
                                                <i className={item.icon} style={{ color: '#fe730c', width: '16px', textAlign: 'center' }}></i>
                                                {item.label}
                                            </span>
                                            <span style={{ fontWeight: 600, color: '#081f4e', fontSize: '.85rem', fontFamily: 'Poppins, sans-serif', textAlign: 'right' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to={course.price === 'Contact Us' ? '/contact' : `/enroll/${course.slug}`} className="btn-enroll" style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1rem', borderRadius: '12px', marginBottom: '10px' }}>
                                    <i className="fas fa-graduation-cap"></i>
                                    {course.price === 'Contact Us' ? 'Request a Quote' : 'Enroll Now'}
                                </Link>
                                <a href="tel:+254748800500" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '1.5px solid #e8eaf0', borderRadius: '12px', color: '#081f4e', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '.88rem', fontWeight: 600, transition: 'all .25s' }}>
                                    <i className="fas fa-phone-alt" style={{ color: '#fe730c' }}></i> Call for more info
                                </a>
                                {tags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '18px' }}>
                                        {tags.map(t => (
                                            <span key={t} style={{ background: '#f3f4f6', color: '#555', fontSize: '.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', fontFamily: 'Poppins, sans-serif' }}>{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .container > div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                    .course-detail-hero { height: 260px !important; }
                }
            `}</style>
        </>
    );
}
