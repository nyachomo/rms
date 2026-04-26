import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar  from '../components/DashboardNavbar';

const API = '/api/course-categories';

const COLORS = [
    { value: 'teal',   label: 'Teal',   hex: '#0d9488' },
    { value: 'orange', label: 'Orange', hex: '#fe730c' },
    { value: 'purple', label: 'Purple', hex: '#7c3aed' },
    { value: 'navy',   label: 'Navy',   hex: '#081f4e' },
    { value: 'green',  label: 'Green',  hex: '#16a34a' },
    { value: 'red',    label: 'Red',    hex: '#dc2626' },
    { value: 'blue',   label: 'Blue',   hex: '#2563eb' },
    { value: 'amber',  label: 'Amber',  hex: '#d97706' },
];
const hex = v => COLORS.find(c => c.value === v)?.hex ?? '#6b7280';

const EMPTY = { name: '', description: '', icon: '', color: 'orange', sort_order: 0, status: 'active' };

/* ── helpers ─────────────────────────────────── */
function Field({ label, error, children }) {
    return (
        <div className="profile-input-wrap" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
            {children}
            {error && <span style={{ color: '#dc2626', fontSize: '.76rem', marginTop: 3, display: 'block' }}>{error}</span>}
        </div>
    );
}

/* ── Category form modal ──────────────────────── */
function CategoryModal({ mode, category, token, onSaved, onClose }) {
    const [form, setForm]     = useState(mode === 'edit' ? { ...category } : { ...EMPTY });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handle = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrors(ev => ({ ...ev, [name]: null }));
    };

    const submit = async e => {
        e.preventDefault();
        setSaving(true); setErrors({});
        try {
            const url    = mode === 'edit' ? `${API}/${category.id}` : API;
            const method = mode === 'edit' ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) }),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors ?? {}); return; }
            onSaved(data.category, mode);
        } finally { setSaving(false); }
    };

    const accent = hex(form.color);

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 560, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
                {/* Header — fixed */}
                <div style={{ background: `linear-gradient(135deg,#081f4e,#0d2d6b)`, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${accent},${accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#fff', boxShadow: `0 6px 16px ${accent}44`, flexShrink: 0 }}>
                            <i className={form.icon || 'fas fa-tag'}></i>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '.72rem', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                                {mode === 'edit' ? 'Editing Category' : 'New Category'}
                            </p>
                            <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: 700 }}>
                                {mode === 'edit' ? category.name : 'Add Course Category'}
                            </h3>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '22px 26px', overflowY: 'auto', flex: 1 }}>
                        <Field label="Category Name *" error={errors.name?.[0]}>
                            <input name="name" value={form.name} onChange={handle} placeholder="e.g. Foundational" required style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.87rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                        </Field>

                        <Field label="Description" error={errors.description?.[0]}>
                            <textarea name="description" value={form.description ?? ''} onChange={handle} rows={3}
                                placeholder="Brief description of this category…"
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.87rem', fontFamily: 'Poppins,sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                        </Field>

                        {/* Icon + Color */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                                    Icon <span style={{ color: '#9ca3af', fontWeight: 400 }}>(FA class)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input name="icon" value={form.icon ?? ''} onChange={handle} placeholder="fas fa-graduation-cap"
                                        style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.87rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                                    {form.icon && (
                                        <i className={form.icon} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: accent, fontSize: '1rem', pointerEvents: 'none' }}></i>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Accent Color</label>
                                <select name="color" value={form.color ?? 'orange'} onChange={handle}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.87rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box' }}>
                                    {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Sort + Status */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                            <Field label="Sort Order">
                                <input name="sort_order" type="number" min="0" value={form.sort_order ?? 0} onChange={handle}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.87rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                            </Field>
                            <Field label="Status">
                                <select name="status" value={form.status} onChange={handle}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.87rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box' }}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </Field>
                        </div>

                        {/* Color swatch strip */}
                        <div>
                            <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Quick Color Pick</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {COLORS.map(c => (
                                    <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, color: c.value }))}
                                        title={c.label}
                                        style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${form.color === c.value ? c.hex : 'transparent'}`, background: c.hex, cursor: 'pointer', outline: form.color === c.value ? `2px solid ${c.hex}55` : 'none', outlineOffset: 2, transition: 'all .15s', flexShrink: 0 }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer — always visible */}
                    <div style={{ padding: '16px 26px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
                        <button type="button" onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.87rem' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,#081f4e,#1a3a7a)`, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.87rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> {mode === 'edit' ? 'Save Changes' : 'Create Category'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete modal ─────────────────────────────── */
function DeleteModal({ category, token, onDeleted, onClose }) {
    const [deleting, setDeleting] = useState(false);

    const confirm = async () => {
        setDeleting(true);
        await fetch(`${API}/${category.id}`, { method: 'DELETE', headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
        onDeleted(category.id);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 420, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', flexShrink: 0 }}>
                        <i className="fas fa-trash"></i>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '.72rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Confirm Delete</p>
                        <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '1rem', fontWeight: 700 }}>Delete Category</h3>
                    </div>
                </div>
                <div style={{ padding: '24px' }}>
                    <p style={{ color: '#374151', fontSize: '.9rem', marginBottom: 6 }}>
                        You're about to delete <strong style={{ color: '#081f4e' }}>"{category.name}"</strong>.
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '.84rem', marginBottom: 24, background: '#fef9f0', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px' }}>
                        <i className="fas fa-exclamation-triangle" style={{ color: '#d97706', marginRight: 7 }}></i>
                        Courses linked to this category will be unlinked but not deleted.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: '.87rem' }}>
                            Cancel
                        </button>
                        <button onClick={confirm} disabled={deleting}
                            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? .7 : 1, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.87rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {deleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash"></i> Delete</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Category card ────────────────────────────── */
function CategoryCard({ cat, canUpdate, canDelete, onEdit, onDelete }) {
    const accent = hex(cat.color);
    return (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(8,31,78,.06)', transition: 'box-shadow .2s, transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(8,31,78,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(8,31,78,.06)'; e.currentTarget.style.transform = 'none'; }}>
            {/* Color bar */}
            <div style={{ height: 5, background: `linear-gradient(90deg,${accent},${accent}66)` }}></div>

            <div style={{ padding: '20px 22px 18px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: `${accent}15`, border: `2px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: accent, flexShrink: 0 }}>
                            <i className={cat.icon || 'fas fa-tag'}></i>
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontFamily: 'Poppins,sans-serif', fontSize: '.97rem', fontWeight: 700, color: '#081f4e', lineHeight: 1.3 }}>{cat.name}</h4>
                            <span style={{ fontSize: '.7rem', color: '#9ca3af', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px', fontFamily: 'monospace' }}>{cat.slug}</span>
                        </div>
                    </div>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 50, flexShrink: 0,
                        background: cat.status === 'active' ? '#f0fdf4' : '#f9fafb',
                        color:      cat.status === 'active' ? '#16a34a' : '#9ca3af',
                        border:     `1.5px solid ${cat.status === 'active' ? '#bbf7d0' : '#e2e8f0'}` }}>
                        <i className={`fas fa-${cat.status === 'active' ? 'check-circle' : 'pause-circle'}`} style={{ marginRight: 4 }}></i>
                        {cat.status}
                    </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '.84rem', color: '#6b7280', lineHeight: 1.65, margin: '0 0 16px', minHeight: 42, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cat.description || <span style={{ fontStyle: 'italic', color: '#c4cdd6' }}>No description added.</span>}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                        <span style={{ fontSize: '.76rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}15`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: '.75rem' }}>
                                <i className="fas fa-book-open"></i>
                            </span>
                            {cat.courses_count ?? 0} course{cat.courses_count !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: '.76rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <i className="fas fa-sort-amount-up" style={{ fontSize: '.68rem' }}></i>
                            #{cat.sort_order}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                        {canUpdate && (
                            <button onClick={() => onEdit(cat)} title="Edit"
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#081f4e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#081f4e'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                <i className="fas fa-pen"></i>
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => onDelete(cat)} title="Delete"
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#dc2626'; }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function AdminCourseCategories() {
    const { token, can } = useAuth();

    const [categories, setCategories] = useState([]);
    const [meta, setMeta]             = useState({});
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('');
    const [page, setPage]             = useState(1);
    const [modal, setModal]           = useState(null); // { type: 'add'|'edit'|'delete', category? }

    const load = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page, per_page: 20 });
        if (search)       params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        try {
            const res  = await fetch(`${API}?${params}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
            const data = await res.json();
            setCategories(data.data ?? []);
            setMeta(data);
        } finally { setLoading(false); }
    }, [token, page, search, statusFilter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [search, statusFilter]);

    const onSaved = (cat, mode) => {
        if (mode === 'edit') setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
        else load();
        setModal(null);
    };
    const onDeleted = id => { setCategories(prev => prev.filter(c => c.id !== id)); setModal(null); };

    const total    = meta.total ?? 0;
    const active   = categories.filter(c => c.status === 'active').length;
    const inactive = categories.filter(c => c.status === 'inactive').length;
    const totalCourses = categories.reduce((s, c) => s + (c.courses_count ?? 0), 0);

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">
                <DashboardNavbar page="Course Categories" />
                <div className="db-content">

                    {/* ── Hero banner ── */}
                    <div style={{ background: 'linear-gradient(135deg,#081f4e 0%,#0d2d6b 55%,#1e1b4b 100%)', borderRadius: 18, padding: '30px 34px', marginBottom: 26, position: 'relative', overflow: 'hidden' }}>
                        {/* decorative blobs */}
                        <div style={{ position: 'absolute', top: -40, right: 60,  width: 220, height: 220, borderRadius: '50%', background: 'rgba(254,115,12,.08)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', bottom: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }}></div>

                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                <div style={{ width: 58, height: 58, borderRadius: 16, background: 'linear-gradient(135deg,#fe730c,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', boxShadow: '0 10px 24px rgba(254,115,12,.4)', flexShrink: 0 }}>
                                    <i className="fas fa-tags"></i>
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>Course Categories</h1>
                                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.45)', fontSize: '.83rem' }}>Organise courses into logical learning tracks</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[
                                        { icon: 'fa-layer-group',  val: total,        label: 'Total',         bg: 'rgba(255,255,255,.12)', color: '#fff' },
                                        { icon: 'fa-check-circle', val: active,       label: 'Active',        bg: 'rgba(16,185,129,.2)',   color: '#6ee7b7' },
                                        { icon: 'fa-book-open',    val: totalCourses, label: 'Courses Linked',bg: 'rgba(254,115,12,.2)',   color: '#fdba74' },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: s.bg, borderRadius: 50, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '.78rem' }}></i>
                                            <span style={{ color: s.color, fontWeight: 700, fontSize: '.82rem' }}>{s.val}</span>
                                            <span style={{ color: `${s.color}99`, fontSize: '.75rem' }}>{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                                {can('course_categories', 'create') && (
                                    <button onClick={() => setModal({ type: 'add' })}
                                        style={{ background: 'linear-gradient(135deg,#fe730c,#f97316)', color: '#fff', border: 'none', borderRadius: 11, padding: '11px 22px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.87rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 6px 18px rgba(254,115,12,.45)', whiteSpace: 'nowrap' }}>
                                        <i className="fas fa-plus"></i> Add Category
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Stat cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                        {[
                            { label: 'Total Categories', value: total,        icon: 'fas fa-tags',          color: '#081f4e', bg: '#eef1fb' },
                            { label: 'Active',           value: active,       icon: 'fas fa-check-circle',  color: '#16a34a', bg: '#f0fdf4' },
                            { label: 'Inactive',         value: inactive,     icon: 'fas fa-pause-circle',  color: '#9ca3af', bg: '#f9fafb' },
                            { label: 'Courses Linked',   value: totalCourses, icon: 'fas fa-book-open',     color: '#fe730c', bg: '#fff7ed' },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1.5px solid #e8edf5', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(8,31,78,.04)' }}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1.1rem', flexShrink: 0 }}>
                                    <i className={s.icon}></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#081f4e', fontFamily: 'Poppins,sans-serif', lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: '.75rem', color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filters bar ── */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e8edf5', padding: '14px 18px', marginBottom: 22, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1 1 240px' }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '.8rem', pointerEvents: 'none' }}></i>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories…"
                                style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '.86rem', fontFamily: 'Poppins,sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                                onFocus={e => e.target.style.borderColor = '#081f4e'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                        </div>
                        {/* Status pills */}
                        <div style={{ display: 'flex', gap: 7 }}>
                            {[['', 'All Status'], ['active', 'Active'], ['inactive', 'Inactive']].map(([v, l]) => (
                                <button key={v} onClick={() => setStatus(v)}
                                    style={{ padding: '8px 16px', borderRadius: 50, border: '1.5px solid', fontSize: '.81rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', transition: 'all .15s',
                                        borderColor: statusFilter === v ? '#081f4e' : '#e2e8f0',
                                        background:  statusFilter === v ? '#081f4e' : '#fff',
                                        color:       statusFilter === v ? '#fff'    : '#6b7280' }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '.78rem', color: '#9ca3af' }}>
                            {loading ? 'Loading…' : `${categories.length} result${categories.length !== 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* ── Cards grid ── */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '70px 0', color: '#9ca3af' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: 14, display: 'block', color: '#fe730c' }}></i>
                            <p style={{ margin: 0, fontWeight: 500 }}>Loading categories…</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '70px 0', color: '#9ca3af', background: '#fff', borderRadius: 16, border: '1.5px dashed #e2e8f0' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '1.8rem', color: '#d1d5db' }}>
                                <i className="fas fa-tags"></i>
                            </div>
                            <p style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', margin: '0 0 6px' }}>No categories found</p>
                            <p style={{ fontSize: '.87rem', margin: '0 0 20px' }}>
                                {search || statusFilter ? 'Try clearing your filters.' : 'Get started by adding your first course category.'}
                            </p>
                            {!search && !statusFilter && can('course_categories', 'create') && (
                                <button onClick={() => setModal({ type: 'add' })}
                                    style={{ background: 'linear-gradient(135deg,#081f4e,#1a3a7a)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.87rem', cursor: 'pointer' }}>
                                    <i className="fas fa-plus" style={{ marginRight: 8 }}></i>Add First Category
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 18, marginBottom: 28 }}>
                            {categories.map(cat => (
                                <CategoryCard
                                    key={cat.id}
                                    cat={cat}
                                    canUpdate={can('course_categories', 'update')}
                                    canDelete={can('course_categories', 'delete')}
                                    onEdit={c  => setModal({ type: 'edit',   category: c })}
                                    onDelete={c => setModal({ type: 'delete', category: c })}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {(meta.last_page ?? 1) > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.84rem',
                                        borderColor: page === p ? '#081f4e' : '#e2e8f0',
                                        background:  page === p ? '#081f4e' : '#fff',
                                        color:       page === p ? '#fff'    : '#6b7280' }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            </div>

            {modal?.type === 'add'    && <CategoryModal mode="add"  token={token} onSaved={onSaved} onClose={() => setModal(null)} />}
            {modal?.type === 'edit'   && <CategoryModal mode="edit" token={token} category={modal.category} onSaved={onSaved} onClose={() => setModal(null)} />}
            {modal?.type === 'delete' && <DeleteModal   token={token} category={modal.category} onDeleted={onDeleted} onClose={() => setModal(null)} />}
        </div>
    );
}
