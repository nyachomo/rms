import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LearningSidebar from '../components/LearningSidebar';
import LearningNavbar from '../components/LearningNavbar';

export default function Learning() {
    const { user, token, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!token) { navigate('/login'); return; }

        fetch('/api/learning/my-courses', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(d => setCourses(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token, authLoading]);

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const totalCompleted = courses.reduce((s, c) => s + c.completed_lessons, 0);
    const totalLessons   = courses.reduce((s, c) => s + c.total_lessons, 0);
    const avgProgress    = courses.length
        ? Math.round(courses.reduce((s, c) => s + c.progress_percent, 0) / courses.length)
        : 0;

    if (authLoading) return (
        <div style={{ minHeight: '100vh', background: '#081f4e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#fe730c' }}></i>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins,sans-serif', background: '#f0f2f8', overflow: 'hidden' }}>

            <LearningSidebar user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(s => !s)} />

            {/* Right column: navbar + scrollable content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <LearningNavbar page="My Courses" sidebarCollapsed={sidebarCollapsed} onSidebarToggle={() => setSidebarCollapsed(s => !s)} />

                <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ maxWidth: 1020, margin: '0 auto', padding: '32px 28px 48px' }}>

                    {/* Welcome banner */}
                    <div style={{
                        background: 'linear-gradient(135deg,#081f4e,#0d2d6b 60%,#1e1b4b)',
                        borderRadius: 18, padding: '30px 36px', marginBottom: 28,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(254,115,12,.08)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', bottom: -20, right: -10, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,.5)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>Welcome back</p>
                            <h1 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>
                                👋 {user?.name?.split(' ')[0]}, ready to learn?
                            </h1>
                            <p style={{ margin: '0 0 22px', color: 'rgba(255,255,255,.5)', fontSize: '.87rem' }}>
                                Continue where you left off or start a new course below.
                            </p>
                            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                {[
                                    { icon: 'fa-book-open',    val: courses.length,    label: 'Enrolled Courses',   bg: 'rgba(255,255,255,.12)', col: '#fff' },
                                    { icon: 'fa-check-circle', val: totalCompleted,    label: 'Lessons Completed',  bg: 'rgba(16,185,129,.2)',  col: '#6ee7b7' },
                                    { icon: 'fa-chart-line',   val: `${avgProgress}%`, label: 'Avg. Progress',      bg: 'rgba(254,115,12,.2)',  col: '#fdba74' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <i className={`fas ${s.icon}`} style={{ color: s.col, fontSize: '1.1rem' }}></i>
                                        <div>
                                            <div style={{ color: s.col, fontWeight: 800, fontSize: '1.15rem', lineHeight: 1 }}>{s.val}</div>
                                            <div style={{ color: `${s.col}88`, fontSize: '.72rem', marginTop: 2 }}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section heading */}
                    <h2 style={{ margin: '0 0 18px', color: '#081f4e', fontSize: '1.1rem', fontWeight: 700 }}>
                        <i className="fas fa-book-open" style={{ color: '#fe730c', marginRight: 10 }}></i>My Courses
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: 12, display: 'block', color: '#fe730c' }}></i>
                            Loading your courses…
                        </div>
                    ) : courses.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px dashed #e2e8f0', padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                            <i className="fas fa-book" style={{ fontSize: '2.5rem', marginBottom: 16, display: 'block', opacity: .3 }}></i>
                            <p style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', margin: '0 0 6px' }}>No courses yet</p>
                            <p style={{ fontSize: '.87rem', margin: '0 0 20px' }}>Your approved enrollments will appear here.</p>
                            <Link to="/courses" style={{ background: 'linear-gradient(135deg,#081f4e,#1a3a7a)', color: '#fff', borderRadius: 10, padding: '10px 22px', textDecoration: 'none', fontWeight: 700, fontSize: '.87rem' }}>
                                <i className="fas fa-search" style={{ marginRight: 8 }}></i>Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                            {courses.map(item => {
                                const c = item.course;
                                const pct = item.progress_percent;
                                const status = pct === 0 ? 'Not Started' : pct === 100 ? 'Completed' : 'In Progress';
                                const statusColor = pct === 0 ? '#6b7280' : pct === 100 ? '#16a34a' : '#fe730c';
                                return (
                                    <div key={item.enrollment_id}
                                        style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(8,31,78,.06)', transition: 'all .2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(8,31,78,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(8,31,78,.06)'; e.currentTarget.style.transform = 'none'; }}>

                                        <div style={{ height: 140, background: 'linear-gradient(135deg,#081f4e,#0d2d6b)', position: 'relative', overflow: 'hidden' }}>
                                            {c.image_url
                                                ? <img src={c.image_url} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8 }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'rgba(255,255,255,.2)' }}>
                                                    <i className={c.icon || 'fas fa-book-open'}></i>
                                                  </div>
                                            }
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(8,31,78,.7))' }}></div>
                                            <span style={{ position: 'absolute', bottom: 10, left: 14, fontSize: '.72rem', fontWeight: 700, background: statusColor, color: '#fff', borderRadius: 50, padding: '3px 10px' }}>{status}</span>
                                        </div>

                                        <div style={{ padding: '16px 18px 18px' }}>
                                            <h3 style={{ margin: '0 0 4px', fontSize: '.95rem', fontWeight: 700, color: '#081f4e' }}>{c.title}</h3>
                                            <p style={{ margin: '0 0 14px', fontSize: '.78rem', color: '#6b7280' }}>
                                                <i className="fas fa-clock" style={{ marginRight: 5 }}></i>{c.duration || 'Flexible'}
                                                <span style={{ margin: '0 8px', color: '#e2e8f0' }}>|</span>
                                                <i className="fas fa-layer-group" style={{ marginRight: 5 }}></i>{item.total_lessons} lessons
                                            </p>

                                            <div style={{ marginBottom: 14 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                                    <span style={{ fontSize: '.75rem', color: '#6b7280', fontWeight: 500 }}>{item.completed_lessons} of {item.total_lessons} lessons</span>
                                                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: statusColor }}>{pct}%</span>
                                                </div>
                                                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 50, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : 'linear-gradient(90deg,#fe730c,#f97316)', borderRadius: 50, transition: 'width .5s ease' }}></div>
                                                </div>
                                            </div>

                                            <Link to={`/learn/${c.slug}`} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                background: pct === 100 ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#081f4e,#1a3a7a)',
                                                color: '#fff', borderRadius: 10, padding: '10px',
                                                textDecoration: 'none', fontWeight: 700, fontSize: '.87rem', transition: 'opacity .2s',
                                            }}>
                                                <i className={`fas fa-${pct === 0 ? 'play' : pct === 100 ? 'check-double' : 'play-circle'}`}></i>
                                                {pct === 0 ? 'Start Learning' : pct === 100 ? 'Review Course' : 'Continue Learning'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                </div>{/* end scroll area */}
            </div>{/* end right column */}
        </div>
    );
}
