import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import RichTextEditor from '../components/RichTextEditor';

/* ─── Category config ─── */
const CAT = {
    foundational: { label: 'Foundational',      color: '#10b981', bg: 'rgba(16,185,129,.12)',  icon: 'fas fa-seedling' },
    proficiency:  { label: 'Proficiency',        color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  icon: 'fas fa-chart-line' },
    mastery:      { label: 'Mastery',            color: '#8b5cf6', bg: 'rgba(139,92,246,.12)',  icon: 'fas fa-trophy' },
    corporate:    { label: 'Corporate Training', color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  icon: 'fas fa-building' },
};

/* ─── Icon-colour → gradient map ─── */
const ICON_GRAD = {
    orange: 'linear-gradient(135deg,#fe730c,#ff9a3c)',
    teal:   'linear-gradient(135deg,#0d9488,#14b8a6)',
    purple: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    green:  'linear-gradient(135deg,#059669,#34d399)',
    red:    'linear-gradient(135deg,#dc2626,#f87171)',
    navy:   'linear-gradient(135deg,#081f4e,#1e3a8a)',
    blue:   'linear-gradient(135deg,#2563eb,#60a5fa)',
};

const LEVEL_OPTIONS = [
    { value: 'Beginner',     cls: 'level-beginner' },
    { value: 'Intermediate', cls: 'level-intermediate' },
    { value: 'Advanced',     cls: 'level-advanced' },
];

/* CATEGORIES is now fetched from the DB — see useCourseCategories() below */

/* ══════════════ COURSE MODAL ══════════════ */
function CourseModal({ course, onSave, onClose, token, categories = [] }) {
    const isEdit = !!course?.id;
    const defaultCat = categories[0]?.slug ?? 'foundational';
    const empty = {
        slug: '', category: defaultCat, title: '', subtitle: '', description: '',
        icon: 'fas fa-book', icon_class: 'orange', level: 'Beginner', level_class: 'level-beginner',
        duration: '', students_count: 0, rating: 4.5, reviews_count: 0, price: '',
        tags: '', image_url: '', overview: '', badge: '', sort_order: 0, status: 'active',
    };
    const [form, setForm] = useState(isEdit
        ? { ...course, tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || '') }
        : empty);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const genSlug = () => {
        if (form.slug || !form.title) return;
        set('slug', form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    };

    const handleSave = async () => {
        setSaving(true); setErr({});
        const payload = {
            ...form,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            students_count: parseInt(form.students_count) || 0,
            reviews_count: parseInt(form.reviews_count) || 0,
            rating: parseFloat(form.rating) || 0,
            sort_order: parseInt(form.sort_order) || 0,
        };
        const url = isEdit ? `/api/admin/courses/${course.id}` : '/api/admin/courses';
        try {
            const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
            const json = await r.json();
            if (!r.ok) { setErr(json.errors || {}); setSaving(false); return; }
            onSave(json.course);
        } catch { setSaving(false); }
    };

    const F = ({ label, field, type = 'text', placeholder = '', span = 1 }) => (
        <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>{label}</label>
            <div className="profile-input-wrap">
                <input type={type} value={form[field] ?? ''} onChange={e => set(field, e.target.value)} placeholder={placeholder} />
            </div>
            {err[field] && <span style={{ color: '#ef4444', fontSize: '.7rem' }}>{err[field][0]}</span>}
        </div>
    );

    const Sel = ({ label, field, children, span = 1 }) => (
        <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>{label}</label>
            <div className="profile-input-wrap">
                <select value={form[field]} onChange={e => set(field, e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Poppins, sans-serif', fontSize: '.88rem', color: '#081f4e' }}>{children}</select>
            </div>
        </div>
    );

    const TA = ({ label, field, span = 2 }) => (
        <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>{label}</label>
            <RichTextEditor value={form[field] ?? ''} onChange={v => set(field, v)} />
        </div>
    );

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 740, maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header" style={{ background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', borderRadius: '14px 14px 0 0', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-book-open" style={{ color: '#fff', fontSize: '.9rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}>{isEdit ? 'Edit Course' : 'Add New Course'}</h3>
                            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.75rem', margin: 0, fontFamily: 'Poppins, sans-serif' }}>Fill in the course details below</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', flexShrink: 0, transition: 'all .18s' }} onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.25)'; e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; }} onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.12)'; e.currentTarget.style.borderColor='rgba(255,255,255,.25)'; }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Identity */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Title *</label>
                        <div className="profile-input-wrap">
                            <input value={form.title} onChange={e => set('title', e.target.value)} onBlur={genSlug} placeholder="e.g. Web Development" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Slug (URL key) *</label>
                        <div className="profile-input-wrap">
                            <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="e.g. web-development" />
                        </div>
                        {err.slug && <span style={{ color: '#ef4444', fontSize: '.7rem' }}>{err.slug[0]}</span>}
                    </div>
                    <F label="Subtitle" field="subtitle" placeholder="Short tagline" />
                    <Sel label="Category *" field="category">
                        {categories.length === 0
                            ? <option value="">Loading categories…</option>
                            : categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)
                        }
                    </Sel>
                    <Sel label="Level" field="level">
                        {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
                    </Sel>
                    <F label="Duration" field="duration" placeholder="e.g. 8 Weeks" />
                    <F label="Price" field="price" placeholder="e.g. KES 25,000 or Contact Us" />
                    <F label="Badge" field="badge" placeholder="e.g. Popular, Bestseller" />
                    <F label="Icon (Font Awesome class)" field="icon" placeholder="fas fa-code" />
                    <F label="Icon colour" field="icon_class" placeholder="orange / teal / purple / green / red / navy" />
                    <F label="Students enrolled" field="students_count" type="number" />
                    <F label="Rating (0–5)" field="rating" type="number" />
                    <F label="Reviews count" field="reviews_count" type="number" />
                    <F label="Sort order" field="sort_order" type="number" />
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Tags (comma-separated)</label>
                        <div className="profile-input-wrap">
                            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="React, Node.js, Laravel" />
                        </div>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Image URL</label>
                        <div className="profile-input-wrap">
                            <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                    {form.image_url && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <img src={form.image_url} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, border: '2px solid #e8eaf0' }} onError={e => e.target.style.display = 'none'} />
                        </div>
                    )}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Short description (course card)</label>
                        <RichTextEditor value={form.description || ''} onChange={v => set('description', v)} placeholder="Brief description shown on the course card…" minHeight={80} />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Full overview (course detail page)</label>
                        <RichTextEditor value={form.overview || ''} onChange={v => set('overview', v)} placeholder="Detailed overview shown on the course detail page…" minHeight={140} />
                    </div>
                    <Sel label="Status" field="status">
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                    </Sel>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #f0f2f5', padding: '16px 24px' }}>
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> {isEdit ? 'Update Course' : 'Create Course'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════ OUTCOME MODAL ══════════════ */
function OutcomeModal({ outcome, courseId, onSave, onClose, token }) {
    const isEdit = !!outcome?.id;
    const [text, setText] = useState(outcome?.outcome || '');
    const [order, setOrder] = useState(outcome?.sort_order ?? 0);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!text.trim()) return;
        setSaving(true);
        const url = isEdit ? `/api/admin/courses/${courseId}/outcomes/${outcome.id}` : `/api/admin/courses/${courseId}/outcomes`;
        const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ outcome: text, sort_order: parseInt(order) || 0 }) });
        const json = await r.json();
        if (r.ok) onSave(json.outcome);
        setSaving(false);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 500 }}>
                <div className="modal-header"><h3>{isEdit ? 'Edit Outcome' : 'Add Outcome'}</h3><button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button></div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Learning outcome *</label>
                        <RichTextEditor value={text} onChange={setText} minHeight={80} placeholder="e.g. Build responsive websites with HTML, CSS, and JavaScript" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Sort order</label>
                        <div className="profile-input-wrap"><input type="number" value={order} onChange={e => setOrder(e.target.value)} /></div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" onClick={handleSave} disabled={saving || !text.trim()}>
                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════ CURRICULUM MODAL ══════════════ */
function CurriculumModal({ item, courseId, onSave, onClose, token }) {
    const isEdit = !!item?.id;
    const [weekLabel, setWeekLabel] = useState(item?.week_label || '');
    const [title, setTitle] = useState(item?.title || '');
    const [topicsText, setTopicsText] = useState(Array.isArray(item?.topics) ? item.topics.join('\n') : '');
    const [order, setOrder] = useState(item?.sort_order ?? 0);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!weekLabel.trim() || !title.trim()) return;
        setSaving(true);
        const topics = topicsText.split('\n').map(t => t.trim()).filter(Boolean);
        const url = isEdit ? `/api/admin/courses/${courseId}/curriculum/${item.id}` : `/api/admin/courses/${courseId}/curriculum`;
        const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ week_label: weekLabel, title, topics, sort_order: parseInt(order) || 0 }) });
        const json = await r.json();
        if (r.ok) onSave(json.item);
        setSaving(false);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 540 }}>
                <div className="modal-header"><h3>{isEdit ? 'Edit Section' : 'Add Curriculum Section'}</h3><button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button></div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Week / Module label *</label>
                            <div className="profile-input-wrap"><input value={weekLabel} onChange={e => setWeekLabel(e.target.value)} placeholder="Week 1–2" /></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Order</label>
                            <div className="profile-input-wrap"><input type="number" value={order} onChange={e => setOrder(e.target.value)} /></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Section title *</label>
                        <div className="profile-input-wrap"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Fundamentals" /></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Topics — one per line</label>
                        <div className="profile-input-wrap profile-textarea-wrap">
                            <textarea rows={5} value={topicsText} onChange={e => setTopicsText(e.target.value)} placeholder={'HTML5 semantic markup\nCSS3, Flexbox & Grid\nJavaScript ES6+'} style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" onClick={handleSave} disabled={saving || !weekLabel.trim() || !title.trim()}>
                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════ INSTRUCTOR MODAL ══════════════ */
function InstructorModal({ instructor, courseId, onSave, onClose, token }) {
    const isEdit = !!instructor?.id;
    const [form, setForm] = useState({ name: instructor?.name || '', role: instructor?.role || '', bio: instructor?.bio || '', image_url: instructor?.image_url || '', sort_order: instructor?.sort_order ?? 0 });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        const url = isEdit ? `/api/admin/courses/${courseId}/instructors/${instructor.id}` : `/api/admin/courses/${courseId}/instructors`;
        const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, sort_order: parseInt(form.sort_order) || 0 }) });
        const json = await r.json();
        if (r.ok) onSave(json.instructor);
        setSaving(false);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 500 }}>
                <div className="modal-header"><h3>{isEdit ? 'Edit Instructor' : 'Add Instructor'}</h3><button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button></div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Name *</label>
                            <div className="profile-input-wrap"><input value={form.name} onChange={e => set('name', e.target.value)} /></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Role / Title</label>
                            <div className="profile-input-wrap"><input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Senior UX Designer" /></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Bio</label>
                        <RichTextEditor value={form.bio || ''} onChange={v => set('bio', v)} minHeight={80} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Poppins, sans-serif' }}>Photo URL</label>
                        <div className="profile-input-wrap"><input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." /></div>
                    </div>
                    {form.image_url && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#f7f9fc', borderRadius: 10, border: '1px solid #e8eaf0' }}>
                            <img src={form.image_url} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8eaf0' }} onError={e => e.target.style.display = 'none'} />
                            <div>
                                <div style={{ fontWeight: 700, color: '#081f4e', fontSize: '.88rem', fontFamily: 'Poppins, sans-serif' }}>{form.name || 'Preview'}</div>
                                <div style={{ color: '#fe730c', fontSize: '.75rem', fontWeight: 600 }}>{form.role}</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" onClick={handleSave} disabled={saving || !form.name.trim()}>
                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════ COURSE DETAIL PANEL (slide-up drawer) ══════════════ */
function CourseDetailPanel({ course, token, onClose }) {
    const [tab, setTab]               = useState('outcomes');
    const [outcomes, setOutcomes]     = useState([]);
    const [curriculum, setCurriculum] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [outModal, setOutModal]     = useState(false);
    const [editOut, setEditOut]       = useState(null);
    const [curModal, setCurModal]     = useState(false);
    const [editCur, setEditCur]       = useState(null);
    const [insModal, setInsModal]     = useState(false);
    const [editIns, setEditIns]       = useState(null);

    useEffect(() => {
        if (!course) return;
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/courses/${course.id}/outcomes`,    { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`/api/admin/courses/${course.id}/curriculum`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`/api/admin/courses/${course.id}/instructors`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([o, c, i]) => { setOutcomes(o); setCurriculum(c); setInstructors(i); setLoading(false); });
    }, [course?.id]);

    const del = async (type, id) => {
        if (!confirm('Delete this item?')) return;
        await fetch(`/api/admin/courses/${course.id}/${type}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (type === 'outcomes')    setOutcomes(p => p.filter(x => x.id !== id));
        if (type === 'curriculum')  setCurriculum(p => p.filter(x => x.id !== id));
        if (type === 'instructors') setInstructors(p => p.filter(x => x.id !== id));
    };

    const tabs = [
        { key: 'outcomes',     label: 'Outcomes',    count: outcomes.length,    icon: 'fas fa-check-circle', color: '#10b981' },
        { key: 'curriculum',   label: 'Curriculum',  count: curriculum.length,  icon: 'fas fa-list-alt',     color: '#3b82f6' },
        { key: 'instructors',  label: 'Instructors', count: instructors.length, icon: 'fas fa-chalkboard-teacher', color: '#8b5cf6' },
    ];

    const catInfo = CAT[course.category] || CAT.foundational;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(8,31,78,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 860, borderRadius: '20px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(8,31,78,.25)', animation: 'zoomIn .25s cubic-bezier(.34,1.56,.64,1)' }}>
                {/* Modal header */}
                <div style={{ padding: '0 24px', background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', borderRadius: '20px 20px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: ICON_GRAD[course.icon_class] || ICON_GRAD.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={course.icon || 'fas fa-book'} style={{ color: '#fff', fontSize: '1rem' }}></i>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{course.title}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                    <span style={{ background: catInfo.bg, color: catInfo.color, border: `1px solid ${catInfo.color}40`, padding: '1px 8px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700 }}>{catInfo.label}</span>
                                    <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.72rem' }}>{course.slug}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', color: '#fff', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-times"></i></button>
                    </div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, paddingBottom: 0 }}>
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '9px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '.78rem', fontWeight: 700, borderRadius: '10px 10px 0 0', background: tab === t.key ? '#fff' : 'transparent', color: tab === t.key ? '#081f4e' : 'rgba(255,255,255,.65)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <i className={t.icon} style={{ fontSize: '.72rem', color: tab === t.key ? t.color : 'inherit' }}></i>
                                {t.label}
                                <span style={{ background: tab === t.key ? t.color : 'rgba(255,255,255,.2)', color: tab === t.key ? '#fff' : 'rgba(255,255,255,.7)', padding: '1px 7px', borderRadius: 20, fontSize: '.65rem', fontWeight: 800 }}>{t.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: 10 }}></i><p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.88rem' }}>Loading content…</p></div>
                    ) : (
                        <>
                            {/* OUTCOMES */}
                            {tab === 'outcomes' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <p style={{ color: '#666', fontSize: '.82rem', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Learning outcomes students will achieve after this course.</p>
                                        <button className="btn-add-new" onClick={() => { setEditOut(null); setOutModal(true); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-plus"></i> Add Outcome</button>
                                    </div>
                                    {outcomes.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb' }}><i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: 8 }}></i><p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.85rem' }}>No outcomes yet.</p></div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 8 }}>
                                            {outcomes.map((o, i) => (
                                                <div key={o.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#f7fdf9', borderRadius: 12, border: '1px solid #d1fae5' }}>
                                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                                                    <span style={{ flex: 1, fontSize: '.84rem', color: '#374151', fontFamily: 'Poppins, sans-serif', lineHeight: 1.5 }}>{o.outcome}</span>
                                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                                        <button onClick={() => { setEditOut(o); setOutModal(true); }} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-edit"></i></button>
                                                        <button onClick={() => del('outcomes', o.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-trash"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CURRICULUM */}
                            {tab === 'curriculum' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <p style={{ color: '#666', fontSize: '.82rem', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Week-by-week or module-by-module course structure.</p>
                                        <button className="btn-add-new" onClick={() => { setEditCur(null); setCurModal(true); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-plus"></i> Add Section</button>
                                    </div>
                                    {curriculum.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb' }}><i className="fas fa-list-alt" style={{ fontSize: '2rem', marginBottom: 8 }}></i><p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.85rem' }}>No curriculum sections yet.</p></div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {curriculum.map((c, i) => (
                                                <div key={c.id} style={{ border: '1px solid #e8eaf0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(8,31,78,.04)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'linear-gradient(135deg,#f7f9fc,#eef2f7)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#fe730c,#ff9a3c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800 }}>{i + 1}</div>
                                                            <div>
                                                                <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#fe730c', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>{c.week_label}</span>
                                                                <div style={{ fontWeight: 700, color: '#081f4e', fontSize: '.9rem', fontFamily: 'Poppins, sans-serif' }}>{c.title}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700 }}>{(c.topics || []).length} topics</span>
                                                            <button onClick={() => { setEditCur(c); setCurModal(true); }} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-edit"></i></button>
                                                            <button onClick={() => del('curriculum', c.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-trash"></i></button>
                                                        </div>
                                                    </div>
                                                    {(c.topics || []).length > 0 && (
                                                        <div style={{ padding: '10px 18px 14px', background: '#fff', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {(c.topics || []).map((t, j) => (
                                                                <span key={j} style={{ background: '#f3f4f6', color: '#555', fontSize: '.73rem', padding: '3px 10px', borderRadius: 20, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                    <i className="fas fa-play-circle" style={{ color: '#fe730c', fontSize: '.6rem' }}></i> {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* INSTRUCTORS */}
                            {tab === 'instructors' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <p style={{ color: '#666', fontSize: '.82rem', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Instructors who teach this course.</p>
                                        <button className="btn-add-new" onClick={() => { setEditIns(null); setInsModal(true); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-plus"></i> Add Instructor</button>
                                    </div>
                                    {instructors.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#bbb' }}><i className="fas fa-chalkboard-teacher" style={{ fontSize: '2rem', marginBottom: 8 }}></i><p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.85rem' }}>No instructors yet.</p></div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                                            {instructors.map(ins => (
                                                <div key={ins.id} style={{ display: 'flex', gap: 14, padding: '16px', background: '#f7f9fc', borderRadius: 14, border: '1px solid #e8eaf0', boxShadow: '0 2px 8px rgba(8,31,78,.04)' }}>
                                                    {ins.image_url
                                                        ? <img src={ins.image_url} alt={ins.name} style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e8eaf0' }} />
                                                        : <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'linear-gradient(135deg,#081f4e,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: '1.2rem' }}><i className="fas fa-user"></i></div>
                                                    }
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 800, color: '#081f4e', fontSize: '.88rem', fontFamily: 'Poppins, sans-serif' }}>{ins.name}</div>
                                                        <div style={{ color: '#fe730c', fontSize: '.75rem', fontWeight: 700, marginTop: 2 }}>{ins.role}</div>
                                                        <div style={{ color: '#666', fontSize: '.75rem', lineHeight: 1.5, marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ins.bio}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                                        <button onClick={() => { setEditIns(ins); setInsModal(true); }} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-edit"></i></button>
                                                        <button onClick={() => del('instructors', ins.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-trash"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {outModal && <OutcomeModal    outcome={editOut} courseId={course.id} token={token} onClose={() => setOutModal(false)}  onSave={o => { setOutcomes(p => editOut ? p.map(x => x.id === o.id ? o : x) : [...p, o]); setOutModal(false); }} />}
            {curModal && <CurriculumModal item={editCur}    courseId={course.id} token={token} onClose={() => setCurModal(false)}  onSave={i => { setCurriculum(p => editCur ? p.map(x => x.id === i.id ? i : x) : [...p, i]); setCurModal(false); }} />}
            {insModal && <InstructorModal instructor={editIns} courseId={course.id} token={token} onClose={() => setInsModal(false)} onSave={i => { setInstructors(p => editIns ? p.map(x => x.id === i.id ? i : x) : [...p, i]); setInsModal(false); }} />}
        </div>
    );
}

/* ══════════════ DELETE CONFIRM ══════════════ */
function DeleteModal({ course, onConfirm, onClose }) {
    const [deleting, setDeleting] = useState(false);
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 440 }}>
                <div className="modal-header"><h3 style={{ color: '#ef4444' }}><i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>Delete Course</h3><button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button></div>
                <div className="modal-body">
                    <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6 }}>Are you sure you want to delete <strong style={{ color: '#081f4e' }}>{course.title}</strong>? All outcomes, curriculum sections, and instructors for this course will also be deleted permanently.</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }} disabled={deleting} onClick={async () => { setDeleting(true); await onConfirm(); }}>
                        {deleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash"></i> Yes, Delete</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════ MAIN PAGE ══════════════════════════════════ */
export default function AdminCourses() {
    const { user, token } = useAuth();
    const [courses, setCourses]           = useState([]);
    const [meta, setMeta]                 = useState(null);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [catFilter, setCatFilter]       = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]                 = useState(1);
    const [perPage, setPerPage]           = useState(10);
    const [courseModal, setCourseModal]   = useState(false);

    // Dynamic categories from DB
    const [dbCategories, setDbCategories] = useState([]);
    useEffect(() => {
        fetch('/api/course-categories?status=active&per_page=100', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => setDbCategories(d.data ?? []))
            .catch(() => {});
    }, [token]);
    const [editCourse, setEditCourse]     = useState(null);
    const [delCourse, setDelCourse]       = useState(null);
    const [detailCourse, setDetailCourse] = useState(null);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const load = async (p = page) => {
        setLoading(true);
        const params = new URLSearchParams({ page: p, per_page: perPage });
        if (search)       params.set('search', search);
        if (catFilter)    params.set('category', catFilter);
        if (statusFilter) params.set('status', statusFilter);
        const r = await fetch(`/api/admin/courses?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await r.json();
        setCourses(json.data || []);
        setMeta(json);
        setLoading(false);
    };

    useEffect(() => { load(1); setPage(1); }, [search, catFilter, statusFilter, perPage]);
    useEffect(() => { load(page); }, [page]);

    const handleDelete = async () => {
        await fetch(`/api/admin/courses/${delCourse.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setDelCourse(null);
        load(page);
    };

    const total     = meta?.total ?? 0;
    const active    = courses.filter(c => c.status === 'active').length;
    const archived  = courses.filter(c => c.status === 'archived').length;
    const totalStudents = courses.reduce((s, c) => s + (c.students_count || 0), 0);

    /* star renderer */
    const Stars = ({ rating }) => {
        const r = parseFloat(rating) || 0;
        return (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                    <i key={n} className={n <= Math.round(r) ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: '.6rem', color: n <= Math.round(r) ? '#f59e0b' : '#d1d5db' }}></i>
                ))}
                <span style={{ marginLeft: 4, color: '#555', fontSize: '.72rem', fontWeight: 600 }}>{r}</span>
            </span>
        );
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">
                <DashboardNavbar page="Courses" />

                <div className="db-content">
                    {/* ── Stat Cards ── */}
                    <div className="db-stats-row">
                        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)' }}>
                            <div className="db-stat-icon" style={{ background: 'rgba(255,255,255,.18)' }}><i className="fas fa-book-open"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Total Courses</span>
                                <span className="db-stat-value">{total}</span>
                            </div>
                        </div>
                        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)' }}>
                            <div className="db-stat-icon" style={{ background: 'rgba(255,255,255,.18)' }}><i className="fas fa-check-circle"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Active</span>
                                <span className="db-stat-value">{active}</span>
                            </div>
                        </div>
                        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)' }}>
                            <div className="db-stat-icon" style={{ background: 'rgba(255,255,255,.18)' }}><i className="fas fa-archive"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Archived</span>
                                <span className="db-stat-value">{archived}</span>
                            </div>
                        </div>
                        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)' }}>
                            <div className="db-stat-icon" style={{ background: 'rgba(255,255,255,.18)' }}><i className="fas fa-users"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Total Students</span>
                                <span className="db-stat-value">{totalStudents.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Category quick-filters (from DB) ── */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        {[{ slug: '', name: 'All', icon: 'fas fa-th-large', color: '#081f4e' },
                          ...dbCategories.map(c => ({ slug: c.slug, name: c.name, icon: c.icon || 'fas fa-tag', color: CAT[c.slug]?.color ?? '#6b7280' }))
                        ].map(f => (
                            <button key={f.slug} onClick={() => setCatFilter(f.slug)}
                                style={{ padding: '7px 16px', borderRadius: 20, border: catFilter === f.slug ? `2px solid ${f.color}` : '1.5px solid #e8eaf0', background: catFilter === f.slug ? f.color + '15' : '#fff', color: catFilter === f.slug ? f.color : '#555', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s' }}>
                                <i className={f.icon} style={{ fontSize: '.7rem' }}></i> {f.name}
                            </button>
                        ))}
                    </div>

                    {/* ── Controls ── */}
                    <div className="db-controls">
                        <div className="db-search-wrap" style={{ flex: 1 }}>
                            <i className="fas fa-search db-search-icon"></i>
                            <input className="db-search" placeholder="Search by title, slug, or category…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="db-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                        <button className="btn-add-new" onClick={() => { setEditCourse(null); setCourseModal(true); }}>
                            <i className="fas fa-plus"></i> Add Course
                        </button>
                    </div>

                    {/* ── Count + per-page ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: '.78rem', color: '#888', fontFamily: 'Poppins, sans-serif' }}>
                            {meta ? <><strong style={{ color: '#081f4e' }}>{meta.from ?? 0}–{meta.to ?? 0}</strong> of <strong style={{ color: '#081f4e' }}>{meta.total ?? 0}</strong> courses</> : ''}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: '#888', fontFamily: 'Poppins, sans-serif' }}>
                            Show
                            <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} style={{ padding: '3px 8px', borderRadius: 6, border: '1.5px solid #e8eaf0', fontFamily: 'Poppins, sans-serif', fontSize: '.78rem', color: '#374151' }}>
                                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            per page
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="db-table-wrap" style={{ boxShadow: '0 4px 24px rgba(8,31,78,.07)', borderRadius: 16, border: '1px solid #e8eaf0' }}>
                        <table className="db-table" style={{ minWidth: 'unset', width: '100%' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg,#f7f9fc,#eef2f7)' }}>
                                    <th style={{ width: 36 }}>#</th>
                                    <th style={{ minWidth: 200 }}>Course</th>
                                    <th style={{ minWidth: 130 }}>Category / Level</th>
                                    <th style={{ minWidth: 110 }}>Duration / Price</th>
                                    <th style={{ minWidth: 100 }}>Rating / Students</th>
                                    <th style={{ minWidth: 90 }}>Status</th>
                                    <th style={{ minWidth: 100 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: 8, display: 'block' }}></i>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.85rem' }}>Loading courses…</span>
                                    </td></tr>
                                ) : courses.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '50px 0', color: '#bbb' }}>
                                        <i className="fas fa-book-open" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block', opacity: .4 }}></i>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '.88rem' }}>No courses found.</span>
                                    </td></tr>
                                ) : courses.map((c, i) => {
                                    const dbCat = dbCategories.find(d => d.slug === c.category);
                                    const cat   = CAT[c.category] || { label: dbCat?.name ?? c.category, color: '#6b7280', bg: 'rgba(107,114,128,.12)', icon: dbCat?.icon || 'fas fa-tag' };
                                    const grad = ICON_GRAD[c.icon_class] || ICON_GRAD.navy;
                                    return (
                                        <tr key={c.id} style={{ transition: 'background .15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f9faff'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                                            <td style={{ color: '#bbb', fontSize: '.75rem', fontWeight: 600 }}>{(meta?.from ?? 1) + i}</td>

                                            {/* Course */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(0,0,0,.14)' }}>
                                                        <i className={c.icon || 'fas fa-book'} style={{ color: '#fff', fontSize: '.82rem' }}></i>
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 700, color: '#081f4e', fontSize: '.85rem', fontFamily: 'Poppins, sans-serif' }}>{c.title}</div>
                                                        <div style={{ fontSize: '.68rem', color: '#aaa', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                                            <i className="fas fa-link" style={{ fontSize: '.58rem' }}></i>
                                                            <span>{c.slug}</span>
                                                            {c.badge && <span style={{ background: '#fff7ed', color: '#fe730c', border: '1px solid #fed7aa', padding: '1px 6px', borderRadius: 20, fontSize: '.62rem', fontWeight: 700 }}>{c.badge}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category / Level */}
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                                    <span style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30`, padding: '3px 8px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                                                        <i className={cat.icon} style={{ fontSize: '.6rem' }}></i> {cat.label}
                                                    </span>
                                                    <span className={c.level_class || ''} style={{ fontSize: '.68rem', width: 'fit-content' }}>{c.level || '—'}</span>
                                                </div>
                                            </td>

                                            {/* Duration / Price */}
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#555', fontSize: '.78rem' }}>
                                                        <i className="fas fa-clock" style={{ color: '#fe730c', fontSize: '.62rem' }}></i> {c.duration || '—'}
                                                    </span>
                                                    <span style={{ fontWeight: 700, color: c.price === 'Contact Us' ? '#3b82f6' : '#081f4e', fontSize: '.78rem' }}>{c.price || '—'}</span>
                                                </div>
                                            </td>

                                            {/* Rating / Students */}
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <Stars rating={c.rating} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: '.72rem' }}>
                                                        <i className="fas fa-users" style={{ color: '#3b82f6', fontSize: '.6rem' }}></i>
                                                        {(c.students_count || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                {c.status === 'active'
                                                    ? <span style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '4px 9px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="fas fa-check-circle" style={{ fontSize: '.58rem' }}></i> Active</span>
                                                    : <span style={{ background: '#f8f4ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '4px 9px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="fas fa-archive" style={{ fontSize: '.58rem' }}></i> Archived</span>
                                                }
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <Link title="Manage lessons" to={`/dashboard/courses/${c.id}/lessons`} style={{ background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', fontSize: '.72rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}><i className="fas fa-book-open"></i></Link>
                                                    <button title="Manage content" onClick={() => setDetailCourse(c)} style={{ background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-list-alt"></i></button>
                                                    <button title="Edit" onClick={() => { setEditCourse(c); setCourseModal(true); }} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-edit"></i></button>
                                                    <button title="Delete" onClick={() => setDelCourse(c)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', fontSize: '.72rem' }}><i className="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {meta && meta.last_page > 1 && (
                        <div className="db-pagination">
                            <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                            <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).filter(n => Math.abs(n - page) <= 2).map(n => (
                                <button key={n} className={`db-page-btn${n === page ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                            ))}
                            <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>›</button>
                            <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)}>»</button>
                        </div>
                    )}
                </div>
            </div>

            {courseModal && <CourseModal course={editCourse} token={token} categories={dbCategories} onClose={() => setCourseModal(false)} onSave={() => { setCourseModal(false); load(page); }} />}
            {delCourse   && <DeleteModal course={delCourse} onClose={() => setDelCourse(null)} onConfirm={handleDelete} />}
            {detailCourse && <CourseDetailPanel course={detailCourse} token={token} onClose={() => setDetailCourse(null)} onCourseUpdated={() => load(page)} />}
        </div>
    );
}
