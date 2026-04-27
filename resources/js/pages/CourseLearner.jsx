import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LearningSidebar from '../components/LearningSidebar';
import LearningNavbar  from '../components/LearningNavbar';

function getEmbedUrl(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
    return url;
}

const TYPE_COLOR = { text: '#3b82f6', video: '#a855f7', mixed: '#14b8a6' };
const TYPE_ICON  = { text: 'fas fa-file-alt', video: 'fas fa-play-circle', mixed: 'fas fa-layer-group' };
const TYPE_LABEL = { text: 'Reading', video: 'Video', mixed: 'Mixed' };

/* ── Exam Modal ── */
function ExamModal({ lesson, token, onPassed, onClose }) {
    const [examData,   setExamData]   = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [answers,    setAnswers]    = useState({});       // questionId → optionId
    const [submitting, setSubmitting] = useState(false);
    const [result,     setResult]     = useState(null);     // after submission

    useEffect(() => {
        fetch(`/api/learning/lessons/${lesson.id}/exam`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => { setExamData(d); })
            .finally(() => setLoading(false));
    }, [lesson.id]);

    const submit = async () => {
        setSubmitting(true);
        try {
            const res  = await fetch(`/api/learning/lessons/${lesson.id}/exam/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ answers }),
            });
            const data = await res.json();
            setResult(data);
            if (data.passed) onPassed();
        } finally { setSubmitting(false); }
    };

    const allAnswered = examData?.questions?.length > 0 &&
        examData.questions.every(q => answers[q.id] != null);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,31,78,.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget && !result) onClose(); }}>
            <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.35)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#081f4e,#1a3a7a)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(254,115,12,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fe730c', fontSize: '.95rem' }}>
                            <i className="fas fa-clipboard-list"></i>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '.65rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Lesson Exam</p>
                            <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '.95rem', fontWeight: 700 }}>{lesson.title}</h3>
                        </div>
                    </div>
                    {!result && (
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.8rem', marginBottom: 10, display: 'block', color: '#fe730c' }}></i>
                            Loading exam…
                        </div>
                    ) : result ? (
                        /* ── Results view ── */
                        <div>
                            {/* Score card */}
                            <div style={{ textAlign: 'center', padding: '24px 16px', background: result.passed ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fff5f5,#fee2e2)', borderRadius: 14, border: `2px solid ${result.passed ? '#86efac' : '#fca5a5'}`, marginBottom: 22 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 8 }}>{result.passed ? '🎉' : '😔'}</div>
                                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: result.passed ? '#16a34a' : '#dc2626', fontFamily: 'Poppins,sans-serif', lineHeight: 1 }}>{result.score}%</div>
                                <div style={{ fontSize: '.85rem', color: result.passed ? '#15803d' : '#b91c1c', fontWeight: 600, marginTop: 6 }}>
                                    {result.passed ? 'You passed! Lesson marked complete.' : `Not passed. Pass mark is ${result.pass_mark}%.`}
                                </div>
                                <div style={{ fontSize: '.78rem', color: '#6b7280', marginTop: 4 }}>
                                    {result.correct}/{result.total} correct · Attempt #{result.attempts_count}
                                </div>
                            </div>

                            {/* Per-question breakdown */}
                            <p style={{ fontWeight: 700, color: '#374151', fontSize: '.83rem', marginBottom: 10 }}>Answer Review</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {result.results.map((r, i) => (
                                    <div key={r.question_id} style={{ background: r.is_correct ? '#f0fdf4' : '#fff5f5', border: `1.5px solid ${r.is_correct ? '#bbf7d0' : '#fca5a5'}`, borderRadius: 10, padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                                            <i className={`fas fa-${r.is_correct ? 'check-circle' : 'times-circle'}`} style={{ color: r.is_correct ? '#16a34a' : '#dc2626', marginTop: 2, flexShrink: 0 }}></i>
                                            <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#374151' }}>Q{i + 1}. {r.question}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 22 }}>
                                            {r.options?.map(opt => {
                                                const isSelected = opt.id === r.selected_option_id;
                                                const isCorrect  = opt.id === r.correct_option_id;
                                                let bg = '#f1f5f9', color = '#6b7280', border = '#e2e8f0';
                                                if (isCorrect) { bg = '#dcfce7'; color = '#16a34a'; border = '#86efac'; }
                                                else if (isSelected && !isCorrect) { bg = '#fee2e2'; color = '#dc2626'; border = '#fca5a5'; }
                                                return (
                                                    <span key={opt.id} style={{ padding: '3px 10px', borderRadius: 50, fontSize: '.72rem', fontWeight: 600, background: bg, color, border: `1.5px solid ${border}` }}>
                                                        {isCorrect && <i className="fas fa-check" style={{ marginRight: 4, fontSize: '.6rem' }}></i>}
                                                        {isSelected && !isCorrect && <i className="fas fa-times" style={{ marginRight: 4, fontSize: '.6rem' }}></i>}
                                                        {opt.option_text}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ── Questions view ── */
                        <div>
                            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
                                <i className="fas fa-info-circle" style={{ color: '#d97706' }}></i>
                                <span style={{ fontSize: '.8rem', color: '#92400e' }}>
                                    Pass mark is <strong>{examData?.pass_mark}%</strong>. Answer all questions, then click Submit.
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {examData?.questions?.map((q, qi) => (
                                    <div key={q.id} style={{ background: '#f8fafc', border: `1.5px solid ${answers[q.id] ? '#c7d2fe' : '#e2e8f0'}`, borderRadius: 12, padding: '14px 16px', transition: 'border-color .2s' }}>
                                        <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#1e1b4b', fontSize: '.87rem', lineHeight: 1.5 }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: '#e0e7ff', color: '#4f46e5', fontSize: '.7rem', fontWeight: 800, marginRight: 8, verticalAlign: 'middle', flexShrink: 0 }}>{qi + 1}</span>
                                            {q.question}
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {q.options?.map(opt => {
                                                const selected = answers[q.id] === opt.id;
                                                return (
                                                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 9, border: `1.5px solid ${selected ? '#818cf8' : '#e2e8f0'}`, background: selected ? '#eef2ff' : '#fff', cursor: 'pointer', transition: 'all .15s' }}>
                                                        <input type="radio" name={`q_${q.id}`} checked={selected}
                                                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                                                            style={{ accentColor: '#6366f1', width: 16, height: 16, flexShrink: 0 }} />
                                                        <span style={{ fontSize: '.85rem', color: selected ? '#3730a3' : '#374151', fontWeight: selected ? 600 : 400 }}>{opt.option_text}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', gap: 10, justifyContent: result ? 'center' : 'flex-end', flexShrink: 0 }}>
                    {result ? (
                        result.passed ? (
                            <button onClick={onClose}
                                style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fas fa-arrow-right"></i> Continue to Next Lesson
                            </button>
                        ) : (
                            <button onClick={() => { setResult(null); setAnswers({}); }}
                                style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#fe730c,#f97316)', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fas fa-redo"></i> Try Again
                            </button>
                        )
                    ) : (
                        <>
                            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.86rem' }}>Cancel</button>
                            <button onClick={submit} disabled={submitting || !allAnswered}
                                style={{ padding: '9px 24px', borderRadius: 9, border: 'none', background: allAnswered ? 'linear-gradient(135deg,#fe730c,#f97316)' : '#e2e8f0', color: allAnswered ? '#fff' : '#9ca3af', cursor: submitting || !allAnswered ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.86rem', display: 'flex', alignItems: 'center', gap: 7, boxShadow: allAnswered ? '0 4px 14px rgba(254,115,12,.3)' : 'none' }}>
                                {submitting ? <><i className="fas fa-spinner fa-spin"></i> Submitting…</> : <><i className="fas fa-paper-plane"></i> Submit Exam</>}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function CourseLearner() {
    const { courseSlug } = useParams();
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [data, setData]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [activeId, setActiveId]     = useState(null);
    const [completing, setCompleting] = useState(false);
    const [lessonPanelOpen, setLessonPanel]     = useState(true);
    const [expandedMods, setExpandedMods]       = useState({});
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [examOpen, setExamOpen]     = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetch(`/api/learning/courses/${courseSlug}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(async r => {
                if (!r.ok) { const d = await r.json(); throw new Error(d.message ?? 'Access denied'); }
                return r.json();
            })
            .then(d => {
                setData(d);
                const allL = d.modules?.flatMap(m => m.lessons) ?? [];
                const first = allL.find(l => !l.completed) ?? allL[0];
                if (first) setActiveId(first.id);
                const exp = {};
                if (first) {
                    const activeMod = d.modules?.find(m => m.lessons.some(l => l.id === first.id));
                    if (activeMod) exp[activeMod.id] = true;
                }
                setExpandedMods(exp);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token, courseSlug]);

    const allLessons     = data?.modules?.flatMap(m => m.lessons) ?? [];
    const lesson         = allLessons.find(l => l.id === activeId);
    const completedCount = allLessons.filter(l => l.completed).length;
    const totalCount     = allLessons.length;
    const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const currentIndex   = allLessons.findIndex(l => l.id === activeId);
    const prevLesson     = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson     = currentIndex < totalCount - 1 ? allLessons[currentIndex + 1] : null;

    // Update lesson completion state inside modules (fixes state sync)
    const updateLessonInData = (lessonId, updates) => {
        setData(prev => ({
            ...prev,
            modules: prev.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l),
            })),
        }));
    };

    // Called when student passes exam — lesson was auto-marked complete by backend
    const handleExamPassed = () => {
        updateLessonInData(lesson.id, { completed: true, exam_passed: true });
    };

    const toggleComplete = async (andNext = false) => {
        if (!lesson) return;
        // For lessons with exams that aren't passed yet, open the exam instead
        if (lesson.has_exam && !lesson.exam_passed && !lesson.completed) {
            setExamOpen(true);
            return;
        }
        setCompleting(true);
        const method = lesson.completed ? 'DELETE' : 'POST';
        try {
            await fetch(`/api/learning/lessons/${lesson.id}/complete`, {
                method, headers: { Authorization: `Bearer ${token}` },
            });
            updateLessonInData(lesson.id, { completed: !lesson.completed });
            if (andNext && nextLesson) goTo(nextLesson.id);
        } finally { setCompleting(false); }
    };

    const goTo = id => {
        setActiveId(id);
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const toggleSidebar = () => setSidebarCollapsed(s => !s);
    const courseTitle = data?.course?.title ?? 'Course';

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins,sans-serif', background: '#f0f2f8', overflow: 'hidden' }}>
            <LearningSidebar user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <LearningNavbar page={courseTitle} sidebarCollapsed={sidebarCollapsed} onSidebarToggle={toggleSidebar} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#fe730c' }}></i>
                    <p style={{ color: '#9ca3af', fontFamily: 'Poppins,sans-serif', fontSize: '.9rem' }}>Loading course…</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins,sans-serif', background: '#f0f2f8', overflow: 'hidden' }}>
            <LearningSidebar user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <LearningNavbar page="Access Denied" sidebarCollapsed={sidebarCollapsed} onSidebarToggle={toggleSidebar} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 24, textAlign: 'center' }}>
                    <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(254,115,12,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-lock" style={{ fontSize: '2rem', color: '#fe730c' }}></i>
                    </div>
                    <h2 style={{ color: '#081f4e', fontFamily: 'Poppins,sans-serif', margin: 0, fontSize: '1.3rem' }}>{error}</h2>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '.9rem' }}>You need an approved enrollment to access this course.</p>
                    <Link to="/learn" style={{ background: 'linear-gradient(135deg,#fe730c,#f97316)', color: '#fff', borderRadius: 10, padding: '11px 24px', textDecoration: 'none', fontFamily: 'Poppins,sans-serif', fontWeight: 700, marginTop: 8 }}>
                        <i className="fas fa-arrow-left" style={{ marginRight: 8 }}></i>My Courses
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins,sans-serif', background: '#f0f2f8', overflow: 'hidden' }}>

            <LearningSidebar user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                <LearningNavbar page={courseTitle} sidebarCollapsed={sidebarCollapsed} onSidebarToggle={toggleSidebar} />

                {/* Sub-header */}
                <div style={{ background: '#081f4e', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)' }}>{completedCount}/{totalCount} lessons</div>
                        <div style={{ flex: 1, maxWidth: 160, height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 50, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#fe730c,#f97316)', borderRadius: 50, transition: 'width .6s ease' }}></div>
                        </div>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: progressPct === 100 ? '#6ee7b7' : '#fdba74' }}>{progressPct}%</div>
                    </div>
                    <button onClick={() => setLessonPanel(s => !s)} title={lessonPanelOpen ? 'Hide lesson list' : 'Show lesson list'}
                        style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', background: lessonPanelOpen ? 'rgba(254,115,12,.2)' : 'rgba(255,255,255,.08)', border: `1px solid ${lessonPanelOpen ? 'rgba(254,115,12,.4)' : 'rgba(255,255,255,.12)'}`, color: lessonPanelOpen ? '#fe730c' : 'rgba(255,255,255,.6)' }}>
                        <i className="fas fa-list"></i>
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* Lesson list panel */}
                    <div style={{ width: lessonPanelOpen ? 300 : 0, flexShrink: 0, background: '#0d1b3e', display: 'flex', flexDirection: 'column', transition: 'width .25s ease', overflow: 'hidden', borderRight: '2px solid #0f2d5e', boxShadow: '4px 0 16px rgba(0,0,0,.22)' }}>
                        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,.07)', flexShrink: 0 }}>
                            <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Course Content</div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 50, overflow: 'hidden', marginBottom: 6 }}>
                                <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#fe730c,#f97316)', borderRadius: 50, transition: 'width .6s ease' }}></div>
                            </div>
                            <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>
                                <span style={{ color: '#fdba74', fontWeight: 700 }}>{completedCount}</span> of {totalCount} completed
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
                            {data?.modules?.map((mod, mi) => {
                                const modOpen      = expandedMods[mod.id] === true;
                                const modCompleted = mod.lessons.filter(l => l.completed).length;
                                const modTotal     = mod.lessons.length;
                                const hasActive    = mod.lessons.some(l => l.id === activeId);
                                return (
                                    <div key={mod.id} style={{ marginBottom: 6 }}>
                                        <button onClick={() => setExpandedMods(e => ({ ...e, [mod.id]: !modOpen }))}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, border: `1px solid ${hasActive ? 'rgba(254,115,12,.25)' : 'rgba(255,255,255,.08)'}`, cursor: 'pointer', textAlign: 'left', background: hasActive ? 'rgba(254,115,12,.08)' : 'rgba(255,255,255,.04)', fontFamily: 'Poppins,sans-serif' }}>
                                            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,rgba(124,58,237,.5),rgba(124,58,237,.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', fontSize: '.72rem', fontWeight: 800, flexShrink: 0 }}>{mi + 1}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '.8rem', fontWeight: 700, color: hasActive ? '#fe730c' : 'rgba(255,255,255,.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</div>
                                                <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)' }}>{modCompleted}/{modTotal} lessons</div>
                                            </div>
                                            <i className={`fas fa-chevron-${modOpen ? 'up' : 'down'}`} style={{ color: 'rgba(255,255,255,.3)', fontSize: '.6rem', flexShrink: 0 }}></i>
                                        </button>

                                        {modOpen && mod.lessons.map((l, li) => {
                                            const isActive = l.id === activeId;
                                            const tColor   = TYPE_COLOR[l.type] ?? '#6b7280';
                                            // Exam status indicators
                                            const showExamBadge = l.has_exam && !l.completed;
                                            const examPassed    = l.exam_passed;
                                            return (
                                                <button key={l.id} onClick={() => goTo(l.id)} style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                                                    padding: '9px 12px 9px 20px', borderRadius: 9,
                                                    cursor: 'pointer', textAlign: 'left', marginTop: 2,
                                                    transition: 'all .15s', fontFamily: 'Poppins,sans-serif',
                                                    background: isActive ? 'linear-gradient(135deg,rgba(254,115,12,.22),rgba(254,115,12,.1))' : l.completed ? 'rgba(22,163,74,.07)' : 'rgba(255,255,255,.02)',
                                                    border: isActive ? '1px solid rgba(254,115,12,.35)' : l.completed ? '1px solid rgba(22,163,74,.12)' : '1px solid transparent',
                                                }}>
                                                    <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 700, background: l.completed ? 'rgba(22,163,74,.2)' : isActive ? 'rgba(254,115,12,.25)' : 'rgba(255,255,255,.05)', color: l.completed ? '#4ade80' : isActive ? '#fe730c' : 'rgba(255,255,255,.35)' }}>
                                                        {l.completed ? <i className="fas fa-check" style={{ fontSize: '.6rem' }}></i> : <span>{li + 1}</span>}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '.8rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#fe730c' : l.completed ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1 }}>{l.title}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <i className={TYPE_ICON[l.type]} style={{ color: tColor, fontSize: '.56rem', opacity: .8 }}></i>
                                                            <span style={{ fontSize: '.63rem', color: 'rgba(255,255,255,.28)' }}>{TYPE_LABEL[l.type]}{l.duration_minutes > 0 && ` · ${l.duration_minutes}m`}</span>
                                                            {showExamBadge && (
                                                                <span style={{ marginLeft: 2, fontSize: '.55rem', color: examPassed ? '#4ade80' : '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <i className={`fas fa-${examPassed ? 'check-circle' : 'clipboard-list'}`}></i>
                                                                    {examPassed ? 'Passed' : 'Exam'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {l.completed && !isActive && <i className="fas fa-check-circle" style={{ color: '#4ade80', fontSize: '.68rem', flexShrink: 0, opacity: .7 }}></i>}
                                                    {!l.completed && l.has_exam && !isActive && <i className="fas fa-clipboard-list" style={{ color: 'rgba(251,191,36,.6)', fontSize: '.65rem', flexShrink: 0 }}></i>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main content */}
                    <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', background: '#f4f6fb' }}>
                        {lesson ? (
                            <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 28px 40px' }}>

                                {/* Lesson meta */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>Lesson {currentIndex + 1} of {totalCount}</span>
                                    <span style={{ color: '#e2e8f0' }}>·</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${TYPE_COLOR[lesson.type]}18`, color: TYPE_COLOR[lesson.type], fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                                        <i className={TYPE_ICON[lesson.type]}></i> {TYPE_LABEL[lesson.type]}
                                    </span>
                                    {lesson.duration_minutes > 0 && (
                                        <><span style={{ color: '#e2e8f0' }}>·</span>
                                        <span style={{ fontSize: '.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}><i className="fas fa-clock"></i> {lesson.duration_minutes} min</span></>
                                    )}
                                    {/* Exam indicator in meta row */}
                                    {lesson.has_exam && (
                                        <><span style={{ color: '#e2e8f0' }}>·</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: lesson.exam_passed ? '#f0fdf4' : '#fffbeb', color: lesson.exam_passed ? '#16a34a' : '#d97706', fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50, border: `1px solid ${lesson.exam_passed ? '#bbf7d0' : '#fde68a'}` }}>
                                            <i className={`fas fa-${lesson.exam_passed ? 'check-circle' : 'clipboard-list'}`}></i>
                                            {lesson.exam_passed ? `Exam Passed` : `Exam Required · ${lesson.pass_mark}% to pass`}
                                        </span></>
                                    )}
                                    {lesson.completed && (
                                        <span style={{ marginLeft: 'auto', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 50, padding: '3px 12px', fontSize: '.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <i className="fas fa-check-circle"></i> Completed
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 style={{ margin: '0 0 22px', fontFamily: 'Poppins,sans-serif', fontSize: '1.45rem', fontWeight: 800, color: '#081f4e', lineHeight: 1.25 }}>{lesson.title}</h1>

                                {/* Video */}
                                {(lesson.type === 'video' || lesson.type === 'mixed') && lesson.video_url && (
                                    <div style={{ marginBottom: 26, borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(8,31,78,.15)', background: '#000', aspectRatio: '16/9' }}>
                                        <iframe src={getEmbedUrl(lesson.video_url)} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={lesson.title} />
                                    </div>
                                )}

                                {/* Text content */}
                                {(lesson.type === 'text' || lesson.type === 'mixed') && lesson.content && (
                                    <div style={{ background: '#fff', borderRadius: 14, padding: '26px 30px', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(8,31,78,.05)', marginBottom: 26 }}>
                                        <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} style={{ fontSize: '.96rem', lineHeight: 1.85, color: '#374151' }} />
                                    </div>
                                )}

                                {!lesson.content && !lesson.video_url && (
                                    <div style={{ background: '#fff', borderRadius: 14, padding: '50px 30px', border: '1.5px dashed #e2e8f0', textAlign: 'center', color: '#9ca3af', marginBottom: 26 }}>
                                        <i className="fas fa-book-open" style={{ fontSize: '2.5rem', marginBottom: 12, display: 'block', opacity: .2 }}></i>
                                        <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 4px', fontSize: '1rem' }}>Lesson content coming soon</p>
                                        <p style={{ fontSize: '.87rem', margin: 0 }}>Check back later or continue to the next lesson.</p>
                                    </div>
                                )}

                                {/* Exam reminder banner (if exam not yet passed) */}
                                {lesson.has_exam && !lesson.exam_passed && !lesson.completed && (
                                    <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1.5px solid #fde68a', borderRadius: 14, padding: '18px 22px', marginBottom: 26, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,119,6,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="fas fa-clipboard-list" style={{ color: '#d97706', fontSize: '1.1rem' }}></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#92400e', fontFamily: 'Poppins,sans-serif', fontSize: '.88rem' }}>Lesson Exam Required</p>
                                            <p style={{ margin: 0, fontSize: '.8rem', color: '#78350f' }}>You must score at least <strong>{lesson.pass_mark}%</strong> to complete this lesson and unlock the next one.</p>
                                        </div>
                                        <button onClick={() => setExamOpen(true)}
                                            style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.84rem', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 12px rgba(217,119,6,.3)', flexShrink: 0 }}>
                                            <i className="fas fa-play-circle"></i> Take Exam
                                        </button>
                                    </div>
                                )}

                                {/* Action bar */}
                                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(8,31,78,.05)' }}>
                                    <button onClick={() => prevLesson && goTo(prevLesson.id)} disabled={!prevLesson}
                                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: prevLesson ? '#374151' : '#d1d5db', cursor: prevLesson ? 'pointer' : 'not-allowed', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.84rem', transition: 'all .2s' }}>
                                        <i className="fas fa-arrow-left"></i> Previous
                                    </button>

                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        {!lesson.completed ? (
                                            lesson.has_exam && !lesson.exam_passed ? (
                                                /* Exam required — show Take Exam button */
                                                <button onClick={() => setExamOpen(true)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.84rem', boxShadow: '0 4px 14px rgba(217,119,6,.3)' }}>
                                                    <i className="fas fa-clipboard-list"></i> Take Exam to Complete
                                                </button>
                                            ) : (
                                                /* No exam or exam already passed */
                                                <>
                                                    <button onClick={() => toggleComplete(false)} disabled={completing}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: completing ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.84rem', opacity: completing ? .6 : 1 }}>
                                                        {completing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check" style={{ color: '#16a34a' }}></i>}
                                                        Mark Complete
                                                    </button>
                                                    {nextLesson && (
                                                        <button onClick={() => toggleComplete(true)} disabled={completing}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#fe730c,#f97316)', color: '#fff', cursor: completing ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.84rem', opacity: completing ? .6 : 1, boxShadow: '0 4px 14px rgba(254,115,12,.35)' }}>
                                                            {completing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                                                            Complete &amp; Next
                                                        </button>
                                                    )}
                                                </>
                                            )
                                        ) : (
                                            <button onClick={() => toggleComplete(false)} disabled={completing}
                                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: completing ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.84rem', opacity: completing ? .6 : 1 }}>
                                                {completing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                                                Completed — Undo
                                            </button>
                                        )}
                                    </div>

                                    <button onClick={() => nextLesson && goTo(nextLesson.id)} disabled={!nextLesson}
                                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, border: 'none', background: nextLesson ? 'linear-gradient(135deg,#081f4e,#1a3a7a)' : '#f1f5f9', color: nextLesson ? '#fff' : '#d1d5db', cursor: nextLesson ? 'pointer' : 'not-allowed', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.84rem' }}>
                                        Next <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, minHeight: 400 }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8edf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-book-open" style={{ fontSize: '1.5rem', color: '#cbd5e1' }}></i>
                                </div>
                                <p style={{ fontWeight: 700, color: '#374151', margin: 0, fontFamily: 'Poppins,sans-serif' }}>Select a lesson to begin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Exam modal */}
            {examOpen && lesson && (
                <ExamModal
                    lesson={lesson}
                    token={token}
                    onPassed={handleExamPassed}
                    onClose={() => setExamOpen(false)}
                />
            )}
        </div>
    );
}
