import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar   from '../components/DashboardSidebar';
import DashboardNavbar    from '../components/DashboardNavbar';
import RichTextEditor     from '../components/RichTextEditor';

const TYPE_ICON  = { text: 'fas fa-file-alt', video: 'fas fa-play-circle', mixed: 'fas fa-layer-group' };
const TYPE_COLOR = { text: '#2563eb', video: '#7c3aed', mixed: '#0d9488' };

const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.85rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box' };

/* ── Module Modal ── */
function ModuleModal({ mode, module, courseId, token, onSaved, onClose }) {
    const [form, setForm]     = useState(mode === 'edit'
        ? { title: module.title, description: module.description ?? '', status: module.status }
        : { title: '', description: '', status: 'active' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handle = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };

    const submit = async e => {
        e.preventDefault(); setSaving(true); setErrors({});
        const url    = mode === 'edit'
            ? `/api/admin/courses/${courseId}/modules/${module.id}`
            : `/api/admin/courses/${courseId}/modules`;
        const method = mode === 'edit' ? 'PUT' : 'POST';
        try {
            const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors ?? {}); return; }
            onSaved(data.module, mode);
        } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 520, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#081f4e,#0d2d6b)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(124,58,237,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontSize: '.95rem' }}>
                            <i className="fas fa-layer-group"></i>
                        </div>
                        <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '.97rem', fontWeight: 700 }}>
                            {mode === 'edit' ? 'Edit Module' : 'New Module'}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={submit} style={{ padding: '22px 24px' }}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Module Title *</label>
                        <input name="title" value={form.title} onChange={handle} required placeholder="e.g. HTML Fundamentals" style={inp} />
                        {errors.title && <span style={{ color: '#dc2626', fontSize: '.76rem' }}>{errors.title[0]}</span>}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Description</label>
                        <textarea name="description" value={form.description} onChange={handle} rows={2} placeholder="Short description" style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Status</label>
                        <select name="status" value={form.status} onChange={handle} style={inp}>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.86rem' }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.86rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> {mode === 'edit' ? 'Save' : 'Create Module'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Lesson Modal ── */
function LessonModal({ mode, lesson, courseId, module, token, onSaved, onClose }) {
    const EMPTY = { title: '', content: '', video_url: '', type: 'text', duration_minutes: 0, sort_order: 0, status: 'draft' };
    const [form, setForm]     = useState(mode === 'edit' ? { ...lesson } : { ...EMPTY });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handle = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); setErrors(ev => ({ ...ev, [name]: null })); };

    const submit = async e => {
        e.preventDefault(); setSaving(true); setErrors({});
        const base = `/api/admin/courses/${courseId}/modules/${module.id}/lessons`;
        const url  = mode === 'edit' ? `${base}/${lesson.id}` : base;
        const meth = mode === 'edit' ? 'PUT' : 'POST';
        try {
            const res  = await fetch(url, { method: meth, headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, duration_minutes: Number(form.duration_minutes), sort_order: Number(form.sort_order) }) });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors ?? {}); return; }
            onSaved(data.lesson, module.id, mode);
        } finally { setSaving(false); }
    };

    const tColor = TYPE_COLOR[form.type] ?? '#6b7280';

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 680, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '94vh' }}>
                <div style={{ background: 'linear-gradient(135deg,#081f4e,#0d2d6b)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tColor}33`, border: `2px solid ${tColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tColor, fontSize: '.9rem', flexShrink: 0 }}>
                            <i className={TYPE_ICON[form.type] ?? 'fas fa-book'}></i>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '.68rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{mode === 'edit' ? 'Edit Lesson' : 'New Lesson'} — {module.title}</p>
                            <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '.95rem', fontWeight: 700 }}>{mode === 'edit' ? lesson.title : 'Add Lesson'}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Lesson Title *</label>
                            <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Introduction to HTML" style={inp} />
                            {errors.title && <span style={{ color: '#dc2626', fontSize: '.76rem' }}>{errors.title[0]}</span>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                            {[
                                { label: 'Type',          name: 'type',             as: 'select', opts: [['text','Text'],['video','Video'],['mixed','Mixed']] },
                                { label: 'Status',        name: 'status',           as: 'select', opts: [['draft','Draft'],['published','Published']] },
                                { label: 'Duration (min)',name: 'duration_minutes', as: 'input',  type: 'number' },
                                { label: 'Sort Order',    name: 'sort_order',       as: 'input',  type: 'number' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label style={{ fontSize: '.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                                    {f.as === 'select'
                                        ? <select name={f.name} value={form[f.name]} onChange={handle} style={inp}>{f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                                        : <input name={f.name} type={f.type} value={form[f.name] ?? 0} onChange={handle} style={inp} />
                                    }
                                </div>
                            ))}
                        </div>
                        {(form.type === 'video' || form.type === 'mixed') && (
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}><i className="fab fa-youtube" style={{ color: '#dc2626', marginRight: 6 }}></i>Video URL (YouTube / Vimeo)</label>
                                <input name="video_url" value={form.video_url ?? ''} onChange={handle} placeholder="https://www.youtube.com/watch?v=..." style={inp} />
                                {errors.video_url && <span style={{ color: '#dc2626', fontSize: '.76rem' }}>{errors.video_url[0]}</span>}
                            </div>
                        )}
                        {(form.type === 'text' || form.type === 'mixed') && (
                            <div>
                                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                                    Lesson Content
                                </label>
                                <RichTextEditor
                                    value={form.content ?? ''}
                                    onChange={html => setForm(f => ({ ...f, content: html }))}
                                    placeholder="Write your lesson content here. You can paste images directly!"
                                    minHeight={240}
                                />
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
                        <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.86rem' }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#081f4e,#1a3a7a)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.86rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> {mode === 'edit' ? 'Save Changes' : 'Create Lesson'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Exam Modal ── */
function ExamModal({ lesson, token, onClose }) {
    const [passMark,   setPassMark]   = useState('');
    const [savedMark,  setSavedMark]  = useState('');   // tracks what's persisted
    const [questions,  setQuestions]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [savingPM,   setSavingPM]   = useState(false);
    const [pmSaved,    setPmSaved]    = useState(false);
    const [editingQ,   setEditingQ]   = useState(null);
    const [delQId,     setDelQId]     = useState(null);
    const [deleting,   setDeleting]   = useState(false);

    useEffect(() => {
        fetch(`/api/admin/lessons/${lesson.id}/exam`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                const pm = d.pass_mark ?? '';
                setPassMark(pm);
                setSavedMark(String(pm));
                setQuestions(d.questions ?? []);
            })
            .finally(() => setLoading(false));
    }, [lesson.id]);

    const savePassMark = async (value) => {
        const val = value !== undefined ? value : passMark;
        setSavingPM(true); setPmSaved(false);
        await fetch(`/api/admin/lessons/${lesson.id}/exam/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pass_mark: val === '' ? null : Number(val) }),
        });
        setSavedMark(String(val));
        setSavingPM(false); setPmSaved(true);
        setTimeout(() => setPmSaved(false), 2500);
    };

    // Auto-save when input loses focus and value changed
    const handlePassMarkBlur = () => {
        if (String(passMark) !== savedMark) savePassMark(passMark);
    };

    // Save pass mark on close if it changed
    const handleClose = async () => {
        if (String(passMark) !== savedMark) await savePassMark(passMark);
        onClose();
    };

    const onQuestionSaved = (q, isNew) => {
        setQuestions(prev => isNew ? [...prev, q] : prev.map(x => x.id === q.id ? q : x));
        setEditingQ(null);
    };

    const confirmDeleteQ = async () => {
        setDeleting(true);
        await fetch(`/api/admin/lessons/${lesson.id}/exam/questions/${delQId}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(prev => prev.filter(q => q.id !== delQId));
        setDelQId(null); setDeleting(false);
    };

    const examActive = passMark !== '' && Number(passMark) >= 1;
    const hasUnsaved = String(passMark) !== savedMark;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
            <div className="modal-box" style={{ maxWidth: 760, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '94vh' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#0f766e,#0d9488)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.95rem' }}>
                            <i className="fas fa-clipboard-list"></i>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '.68rem', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Exam Manager</p>
                            <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '.95rem', fontWeight: 700 }}>{lesson.title}</h3>
                        </div>
                    </div>
                    <button onClick={handleClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-times"></i></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i></div>
                    ) : (
                        <>
                            {/* Warning: questions exist but no pass mark */}
                            {questions.length > 0 && !examActive && (
                                <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <i className="fas fa-exclamation-triangle" style={{ color: '#ea580c', flexShrink: 0 }}></i>
                                    <span style={{ fontSize: '.82rem', color: '#7c2d12' }}>
                                        <strong>Exam not active.</strong> You have {questions.length} question{questions.length > 1 ? 's' : ''} but no pass mark is set. Enter a pass mark below to activate the exam for students.
                                    </span>
                                </div>
                            )}

                            {/* Pass Mark */}
                            <div style={{ background: examActive ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${examActive ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 12, padding: '16px 18px', marginBottom: 22, transition: 'all .2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <i className="fas fa-bullseye" style={{ color: examActive ? '#16a34a' : '#9ca3af' }}></i>
                                    <span style={{ fontWeight: 700, color: examActive ? '#166534' : '#374151', fontSize: '.88rem', fontFamily: 'Poppins,sans-serif' }}>Pass Mark</span>
                                    <span style={{ fontSize: '.75rem', color: '#6b7280', marginLeft: 4 }}>— minimum % students must score to pass (leave blank to disable exam)</span>
                                </div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <input
                                        type="number" min="1" max="100"
                                        value={passMark}
                                        onChange={e => { setPassMark(e.target.value); setPmSaved(false); }}
                                        onBlur={handlePassMarkBlur}
                                        placeholder="e.g. 70"
                                        style={{ ...inp, width: 120, borderColor: examActive ? '#86efac' : hasUnsaved ? '#fde68a' : '#e2e8f0', background: examActive ? '#fff' : hasUnsaved ? '#fffbeb' : '#fff' }}
                                    />
                                    <span style={{ fontSize: '.85rem', color: '#374151' }}>%</span>
                                    <button onClick={() => savePassMark(passMark)} disabled={savingPM}
                                        style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: pmSaved ? '#16a34a' : '#0f766e', color: '#fff', cursor: savingPM ? 'not-allowed' : 'pointer', opacity: savingPM ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.83rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .2s' }}>
                                        {savingPM ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : pmSaved ? <><i className="fas fa-check"></i> Saved!</> : <><i className="fas fa-save"></i> Save</>}
                                    </button>
                                    {examActive && !hasUnsaved && !savingPM && (
                                        <span style={{ fontSize: '.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <i className="fas fa-check-circle"></i> Exam active at {savedMark}%
                                        </span>
                                    )}
                                    {hasUnsaved && !savingPM && (
                                        <span style={{ fontSize: '.75rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <i className="fas fa-circle" style={{ fontSize: '.5rem' }}></i> Unsaved — click Save or click away
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Questions */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <i className="fas fa-question-circle" style={{ color: '#6366f1' }}></i>
                                    <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '.88rem', fontFamily: 'Poppins,sans-serif' }}>Questions</span>
                                    <span style={{ background: '#e0e7ff', color: '#4f46e5', borderRadius: 50, padding: '2px 9px', fontSize: '.72rem', fontWeight: 700 }}>{questions.length}</span>
                                </div>
                                {editingQ === null && (
                                    <button onClick={() => setEditingQ('new')}
                                        style={{ padding: '7px 15px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <i className="fas fa-plus"></i> Add Question
                                    </button>
                                )}
                            </div>

                            {/* Question form (inline) */}
                            {editingQ !== null && (
                                <QuestionForm
                                    question={editingQ === 'new' ? null : editingQ}
                                    lessonId={lesson.id}
                                    token={token}
                                    onSaved={onQuestionSaved}
                                    onCancel={() => setEditingQ(null)}
                                />
                            )}

                            {/* Questions list */}
                            {questions.length === 0 && editingQ === null ? (
                                <div style={{ background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: 12, padding: '32px 20px', textAlign: 'center', color: '#9ca3af' }}>
                                    <i className="fas fa-question" style={{ fontSize: '1.8rem', marginBottom: 8, display: 'block', opacity: .2 }}></i>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#6b7280', fontSize: '.87rem' }}>No questions yet — click "Add Question" to create the first one.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {questions.map((q, qi) => (
                                        <div key={q.id} style={{ background: '#f8fafc', border: '1.5px solid #e8edf5', borderRadius: 12, padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                                <span style={{ width: 24, height: 24, borderRadius: 7, background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{qi + 1}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="exam-q-render" dangerouslySetInnerHTML={{ __html: q.question }} style={{ margin: '0 0 8px', fontWeight: 600, color: '#1e1b4b', fontSize: '.87rem', lineHeight: 1.4 }} />
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {q.options?.map(opt => (
                                                            <span key={opt.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 50, fontSize: '.72rem', fontWeight: 600, background: opt.is_correct ? '#f0fdf4' : '#f1f5f9', color: opt.is_correct ? '#16a34a' : '#6b7280', border: `1.5px solid ${opt.is_correct ? '#bbf7d0' : '#e2e8f0'}` }}>
                                                                {opt.is_correct && <i className="fas fa-check" style={{ fontSize: '.6rem' }}></i>}
                                                                {opt.option_text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                                    <button onClick={() => setEditingQ(q)} title="Edit"
                                                        style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: '.73rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fas fa-pen"></i>
                                                    </button>
                                                    <button onClick={() => setDelQId(q.id)} title="Delete"
                                                        style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '.73rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Delete question confirm */}
                            {delQId && (
                                <div style={{ marginTop: 14, background: '#fff5f5', border: '1.5px solid #fee2e2', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <i className="fas fa-exclamation-triangle" style={{ color: '#dc2626' }}></i>
                                    <span style={{ flex: 1, fontSize: '.85rem', color: '#374151' }}>Delete this question?</span>
                                    <button onClick={() => setDelQId(null)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem' }}>Cancel</button>
                                    <button onClick={confirmDeleteQ} disabled={deleting} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        {deleting ? <><i className="fas fa-spinner fa-spin"></i></> : <><i className="fas fa-trash"></i> Delete</>}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.86rem' }}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ── Question Form (inline inside ExamModal) ── */
function QuestionForm({ question, lessonId, token, onSaved, onCancel }) {
    const isEdit = Boolean(question);
    const [text, setText] = useState(question?.question ?? '');
    const [options, setOptions] = useState(
        question?.options?.length
            ? question.options.map(o => ({ option_text: o.option_text, is_correct: o.is_correct }))
            : [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }]
    );
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState('');

    const setOption = (i, field, val) =>
        setOptions(prev => prev.map((o, idx) =>
            idx === i
                ? { ...o, [field]: field === 'is_correct' ? true : val }
                : field === 'is_correct' ? { ...o, is_correct: false } : o
        ));

    const addOption    = () => setOptions(prev => prev.length < 6 ? [...prev, { option_text: '', is_correct: false }] : prev);
    const removeOption = i  => setOptions(prev => prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev);

    const isEmptyHtml = html => html.replace(/<[^>]*>/g, '').trim() === '';

    const submit = async e => {
        e.preventDefault(); setError('');
        if (isEmptyHtml(text)) { setError('Question text cannot be empty.'); return; }
        if (!options.some(o => o.is_correct)) { setError('Mark one option as correct.'); return; }
        if (options.some(o => !o.option_text.trim())) { setError('All options must have text.'); return; }
        setSaving(true);
        const url  = isEdit
            ? `/api/admin/lessons/${lessonId}/exam/questions/${question.id}`
            : `/api/admin/lessons/${lessonId}/exam/questions`;
        const meth = isEdit ? 'PUT' : 'POST';
        try {
            const res  = await fetch(url, { method: meth, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ question: text, options }) });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Error saving question.'); return; }
            onSaved(data.question, !isEdit);
        } finally { setSaving(false); }
    };

    return (
        <form onSubmit={submit} style={{ background: '#f0f0ff', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#3730a3', fontSize: '.83rem', fontFamily: 'Poppins,sans-serif' }}>
                <i className="fas fa-pencil-alt" style={{ marginRight: 6 }}></i>{isEdit ? 'Edit Question' : 'New Question'}
            </p>
            <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Question *</label>
                <RichTextEditor
                    value={text}
                    onChange={setText}
                    placeholder="Type your question here. You can paste images directly!"
                    minHeight={80}
                />
            </div>
            <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Answer Options <span style={{ color: '#9ca3af', fontWeight: 400 }}>(select the correct one)</span></label>
                {options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                        <input type="radio" name="correct" checked={opt.is_correct} onChange={() => setOption(i, 'is_correct', true)}
                            style={{ accentColor: '#16a34a', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} title="Mark as correct" />
                        <input value={opt.option_text} onChange={e => setOption(i, 'option_text', e.target.value)}
                            placeholder={`Option ${i + 1}`} required
                            style={{ ...inp, flex: 1, borderColor: opt.is_correct ? '#86efac' : '#e2e8f0', background: opt.is_correct ? '#f0fdf4' : '#fff' }} />
                        {options.length > 2 && (
                            <button type="button" onClick={() => removeOption(i)} style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                ))}
                {options.length < 6 && (
                    <button type="button" onClick={addOption} style={{ marginTop: 4, background: 'none', border: '1.5px dashed #c7d2fe', borderRadius: 8, color: '#6366f1', cursor: 'pointer', fontSize: '.78rem', fontFamily: 'Poppins,sans-serif', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className="fas fa-plus"></i> Add Option
                    </button>
                )}
            </div>
            {error && <p style={{ color: '#dc2626', fontSize: '.78rem', margin: '0 0 8px' }}><i className="fas fa-exclamation-circle" style={{ marginRight: 4 }}></i>{error}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> {isEdit ? 'Update' : 'Add Question'}</>}
                </button>
            </div>
        </form>
    );
}

/* ═══════════════════════════════ MAIN PAGE */
export default function AdminCourseLessons() {
    const { courseId } = useParams();
    const { token }    = useAuth();

    const [course,  setCourse]  = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    const [modal,    setModal]    = useState(null);
    const [delTarget, setDel]     = useState(null);
    const [deleting,  setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [cRes, mRes] = await Promise.all([
                fetch(`/api/admin/courses?per_page=500`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/admin/courses/${courseId}/modules`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const cData = await cRes.json();
            const mData = await mRes.json();
            const found = (cData.data ?? []).find(c => String(c.id) === String(courseId));
            setCourse(found ?? null);
            setModules(mData);
            const exp = {};
            mData.forEach(m => { exp[m.id] = true; });
            setExpanded(exp);
        } finally { setLoading(false); }
    }, [token, courseId]);

    useEffect(() => { load(); }, [load]);

    const totalLessons   = modules.reduce((s, m) => s + (m.lessons?.length ?? 0), 0);
    const totalPublished = modules.reduce((s, m) => s + (m.lessons?.filter(l => l.status === 'published').length ?? 0), 0);
    const totalMins      = modules.reduce((s, m) => s + (m.lessons?.reduce((ss, l) => ss + (l.duration_minutes || 0), 0) ?? 0), 0);
    const totalExams     = modules.reduce((s, m) => s + (m.lessons?.filter(l => l.pass_mark != null).length ?? 0), 0);

    const onModuleSaved = (mod, mode) => {
        if (mode === 'edit') setModules(prev => prev.map(m => m.id === mod.id ? { ...m, ...mod } : m));
        else { setModules(prev => [...prev, { ...mod, lessons: [] }]); setExpanded(e => ({ ...e, [mod.id]: true })); }
        setModal(null);
    };

    const onLessonSaved = (lesson, moduleId, mode) => {
        setModules(prev => prev.map(m => {
            if (m.id !== moduleId) return m;
            const lessons = mode === 'edit'
                ? m.lessons.map(l => l.id === lesson.id ? lesson : l)
                : [...(m.lessons ?? []), lesson].sort((a, b) => a.sort_order - b.sort_order);
            return { ...m, lessons };
        }));
        setModal(null);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        const { kind, item, moduleId } = delTarget;
        let url;
        if (kind === 'module') url = `/api/admin/courses/${courseId}/modules/${item.id}`;
        else url = `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${item.id}`;
        await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (kind === 'module') setModules(prev => prev.filter(m => m.id !== item.id));
        else setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== item.id) } : m));
        setDel(null); setDeleting(false);
    };

    // After exam modal closes, re-fetch to get updated pass_mark on lessons
    const onExamClose = () => {
        setModal(null);
        load();
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">
                <DashboardNavbar page="Course Modules & Lessons" />
                <div className="db-content">

                    {/* Header banner */}
                    <div style={{ background: 'linear-gradient(135deg,#081f4e,#0d2d6b 60%,#1e1b4b)', borderRadius: 18, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: 40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,.12)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <Link to="/dashboard/courses" style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)', textDecoration: 'none', flexShrink: 0 }}>
                                    <i className="fas fa-arrow-left"></i>
                                </Link>
                                <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', flexShrink: 0 }}>
                                    <i className="fas fa-layer-group"></i>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '.7rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Module & Lesson Manager</p>
                                    <h1 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '1.15rem', fontWeight: 800 }}>{course?.title ?? 'Loading…'}</h1>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
                                {[
                                    { icon: 'fa-layer-group',    val: modules.length,  label: 'Modules',   bg: 'rgba(124,58,237,.2)',  col: '#c4b5fd' },
                                    { icon: 'fa-book',           val: totalLessons,    label: 'Lessons',   bg: 'rgba(255,255,255,.1)', col: '#fff' },
                                    { icon: 'fa-check-circle',   val: totalPublished,  label: 'Published', bg: 'rgba(16,185,129,.2)',  col: '#6ee7b7' },
                                    { icon: 'fa-clipboard-list', val: totalExams,      label: 'With Exam', bg: 'rgba(20,184,166,.2)',  col: '#5eead4' },
                                    { icon: 'fa-clock',          val: `${totalMins}m`, label: 'Duration',  bg: 'rgba(254,115,12,.18)', col: '#fdba74' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: s.bg, borderRadius: 50, padding: '5px 13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <i className={`fas ${s.icon}`} style={{ color: s.col, fontSize: '.72rem' }}></i>
                                        <span style={{ color: s.col, fontWeight: 700, fontSize: '.8rem' }}>{s.val}</span>
                                        <span style={{ color: `${s.col}88`, fontSize: '.72rem' }}>{s.label}</span>
                                    </div>
                                ))}
                                <button onClick={() => setModal({ type: 'addModule' })}
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 14px rgba(124,58,237,.4)' }}>
                                    <i className="fas fa-plus"></i> Add Module
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: 12, display: 'block', color: '#7c3aed' }}></i>
                            Loading modules…
                        </div>
                    ) : modules.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px dashed #e2e8f0', padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                            <i className="fas fa-layer-group" style={{ fontSize: '2.5rem', marginBottom: 14, display: 'block', opacity: .25 }}></i>
                            <p style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', margin: '0 0 6px' }}>No modules yet</p>
                            <p style={{ fontSize: '.87rem', margin: '0 0 20px' }}>Create the first module to organise this course's lessons.</p>
                            <button onClick={() => setModal({ type: 'addModule' })} style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.87rem', cursor: 'pointer' }}>
                                <i className="fas fa-plus" style={{ marginRight: 8 }}></i>Add First Module
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {modules.map((mod, mi) => {
                                const isOpen = expanded[mod.id] !== false;
                                return (
                                    <div key={mod.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 10px rgba(8,31,78,.05)' }}>

                                        {/* Module header */}
                                        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, background: '#f8f9fc', borderBottom: isOpen ? '1.5px solid #e8edf5' : 'none', cursor: 'pointer' }}
                                            onClick={() => setExpanded(e => ({ ...e, [mod.id]: !isOpen }))}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.8rem', fontWeight: 800, flexShrink: 0 }}>{mi + 1}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.95rem', color: '#081f4e' }}>{mod.title}</span>
                                                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: 50, background: mod.status === 'active' ? '#f0fdf4' : '#fafafa', color: mod.status === 'active' ? '#16a34a' : '#9ca3af', border: `1.5px solid ${mod.status === 'active' ? '#bbf7d0' : '#e2e8f0'}` }}>{mod.status}</span>
                                                </div>
                                                {mod.description && <p style={{ margin: '2px 0 0', fontSize: '.78rem', color: '#6b7280' }}>{mod.description}</p>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                <span style={{ fontSize: '.78rem', color: '#6b7280', background: '#f1f5f9', borderRadius: 50, padding: '3px 10px' }}>
                                                    <i className="fas fa-book" style={{ marginRight: 5, fontSize: '.7rem' }}></i>{mod.lessons?.length ?? 0} lessons
                                                </span>
                                                <button onClick={e => { e.stopPropagation(); setModal({ type: 'addLesson', module: mod }); }}
                                                    style={{ padding: '6px 13px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#fe730c,#f97316)', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <i className="fas fa-plus"></i> Add Lesson
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); setModal({ type: 'editModule', module: mod }); }} title="Edit module"
                                                    style={{ width: 30, height: 30, borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); setDel({ kind: 'module', item: mod }); }} title="Delete module"
                                                    style={{ width: 30, height: 30, borderRadius: 7, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#9ca3af', fontSize: '.75rem' }}></i>
                                            </div>
                                        </div>

                                        {/* Lessons table */}
                                        {isOpen && (
                                            <>
                                                {!mod.lessons?.length ? (
                                                    <div style={{ padding: '24px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '.87rem' }}>
                                                        <i className="fas fa-book-open" style={{ marginRight: 8, opacity: .4 }}></i>
                                                        No lessons yet —
                                                        <button onClick={() => setModal({ type: 'addLesson', module: mod })}
                                                            style={{ background: 'none', border: 'none', color: '#fe730c', fontFamily: 'Poppins,sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '.87rem', marginLeft: 4 }}>
                                                            add the first one
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 110px 80px 70px 80px 90px 130px', padding: '9px 20px', background: 'linear-gradient(90deg,#f8f9fc,#f1f5f9)', gap: 8, borderBottom: '1px solid #e8edf5' }}>
                                                            {['#', 'Lesson Title', 'Type', 'Duration', 'Sort', 'Status', 'Exam', 'Actions'].map(h => (
                                                                <span key={h} style={{ fontSize: '.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</span>
                                                            ))}
                                                        </div>
                                                        {mod.lessons.map((lesson, li) => {
                                                            const tc = TYPE_COLOR[lesson.type] ?? '#6b7280';
                                                            const hasExam = lesson.pass_mark != null;
                                                            return (
                                                                <div key={lesson.id}
                                                                    style={{ display: 'grid', gridTemplateColumns: '40px 1fr 110px 80px 70px 80px 90px 130px', padding: '12px 20px', gap: 8, alignItems: 'center', borderBottom: li < mod.lessons.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background .15s' }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                                                                    <span style={{ width: 26, height: 26, borderRadius: 7, background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: '#6b7280' }}>{li + 1}</span>
                                                                    <div>
                                                                        <p style={{ margin: 0, fontWeight: 600, color: '#081f4e', fontSize: '.87rem', fontFamily: 'Poppins,sans-serif' }}>{lesson.title}</p>
                                                                        {lesson.video_url && <span style={{ fontSize: '.7rem', color: '#9ca3af' }}><i className="fab fa-youtube" style={{ color: '#dc2626', marginRight: 4 }}></i>Has video</span>}
                                                                    </div>
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${tc}15`, color: tc, borderRadius: 50, padding: '3px 9px', fontSize: '.73rem', fontWeight: 700 }}>
                                                                        <i className={TYPE_ICON[lesson.type]}></i> {lesson.type}
                                                                    </span>
                                                                    <span style={{ fontSize: '.82rem', color: '#6b7280' }}>{lesson.duration_minutes}m</span>
                                                                    <span style={{ fontSize: '.82rem', color: '#9ca3af' }}>#{lesson.sort_order}</span>
                                                                    <span style={{ fontSize: '.73rem', fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: lesson.status === 'published' ? '#f0fdf4' : '#fafafa', color: lesson.status === 'published' ? '#16a34a' : '#9ca3af', border: `1.5px solid ${lesson.status === 'published' ? '#bbf7d0' : '#e2e8f0'}` }}>
                                                                        <i className={`fas fa-${lesson.status === 'published' ? 'eye' : 'eye-slash'}`} style={{ marginRight: 4, fontSize: '.65rem' }}></i>{lesson.status}
                                                                    </span>
                                                                    {/* Exam badge */}
                                                                    <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: hasExam ? '#f0fdfa' : '#fafafa', color: hasExam ? '#0f766e' : '#d1d5db', border: `1.5px solid ${hasExam ? '#99f6e4' : '#e2e8f0'}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                        <i className={`fas ${hasExam ? 'fa-clipboard-check' : 'fa-clipboard'}`}></i>
                                                                        {hasExam ? `${lesson.pass_mark}%` : 'None'}
                                                                    </span>
                                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                                        <button onClick={() => setModal({ type: 'exam', lesson })} title="Manage Exam"
                                                                            style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${hasExam ? '#99f6e4' : '#e2e8f0'}`, background: hasExam ? '#f0fdfa' : '#f8fafc', color: hasExam ? '#0f766e' : '#374151', cursor: 'pointer', fontSize: '.73rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <i className="fas fa-clipboard-list"></i>
                                                                        </button>
                                                                        <button onClick={() => setModal({ type: 'editLesson', module: mod, lesson })} title="Edit"
                                                                            style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: '.73rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <i className="fas fa-pen"></i>
                                                                        </button>
                                                                        <button onClick={() => setDel({ kind: 'lesson', item: lesson, moduleId: mod.id })} title="Delete"
                                                                            style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '.73rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {modal?.type === 'addModule'  && <ModuleModal mode="add" courseId={courseId} token={token} onSaved={onModuleSaved} onClose={() => setModal(null)} />}
            {modal?.type === 'editModule' && <ModuleModal mode="edit" module={modal.module} courseId={courseId} token={token} onSaved={onModuleSaved} onClose={() => setModal(null)} />}
            {modal?.type === 'addLesson'  && <LessonModal mode="add"  module={modal.module} courseId={courseId} token={token} onSaved={onLessonSaved} onClose={() => setModal(null)} />}
            {modal?.type === 'editLesson' && <LessonModal mode="edit" module={modal.module} lesson={modal.lesson} courseId={courseId} token={token} onSaved={onLessonSaved} onClose={() => setModal(null)} />}
            {modal?.type === 'exam'       && <ExamModal lesson={modal.lesson} token={token} onClose={onExamClose} />}

            {delTarget && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDel(null)}>
                    <div className="modal-box" style={{ maxWidth: 400, borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.95rem' }}><i className="fas fa-trash"></i></div>
                            <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '.95rem', fontWeight: 700 }}>Delete {delTarget.kind === 'module' ? 'Module' : 'Lesson'}</h3>
                        </div>
                        <div style={{ padding: '20px 22px' }}>
                            <p style={{ color: '#374151', fontSize: '.9rem', marginBottom: 6 }}>Delete <strong>"{delTarget.item.title}"</strong>?</p>
                            {delTarget.kind === 'module' && <p style={{ color: '#dc2626', fontSize: '.83rem', marginBottom: 18 }}><i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>This will also delete all lessons inside this module.</p>}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button onClick={() => setDel(null)} style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.85rem' }}>Cancel</button>
                                <button onClick={confirmDelete} disabled={deleting} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                                    {deleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash"></i> Delete</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
