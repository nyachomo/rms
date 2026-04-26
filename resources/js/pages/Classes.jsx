import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';
import RichTextEditor from '../components/RichTextEditor';

/* ── Toast ── */
function Toast({ message, type, onClose }) {
    if (!message) return null;
    const err = type === 'error';
    return (
        <div className="profile-toast" style={{ background: err ? '#fef2f2' : '#f0fdf4', borderColor: err ? '#fca5a5' : '#86efac' }}>
            <i className={`fas ${err ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ color: err ? '#dc2626' : '#16a34a' }}></i>
            <span style={{ color: err ? '#991b1b' : '#15803d' }}>{message}</span>
            <button onClick={onClose} className="profile-toast-close"><i className="fas fa-times"></i></button>
        </div>
    );
}

const CLASS_COLORS = [
    '#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316',
];
const classColor = id => CLASS_COLORS[(id - 1) % CLASS_COLORS.length];

/* ── Add / Edit Modal ── */
function ClassModal({ cls, onSave, onClose, token, schoolCategories = [], schoolLevels = [] }) {
    const isEdit = !!cls?.id;
    const [form, setForm] = useState({
        name:               cls?.name               || '',
        capacity:           cls?.capacity           || '',
        teacher:            cls?.teacher            || '',
        description:        cls?.description        || '',
        status:             cls?.status             || 'active',
        school_category_id: cls?.school_category_id || '',
        school_level_id:    cls?.school_level_id    || '',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/classes/${cls.id}` : '/api/classes';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...form, capacity: form.capacity || null }),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.class);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, position: 'relative', display:'flex', flexDirection:'column', maxHeight:'92vh' }}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="db-modal-header" style={{ flexShrink:0 }}>
                    <h3><i className={`fas fa-${isEdit ? 'edit' : 'plus-circle'}`}></i> {isEdit ? 'Edit Class' : 'Add New Class'}</h3>
                </div>

                <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
                    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

                        {/* Class Name */}
                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>Class Name <span style={{ color:'#dc2626' }}>*</span></label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-chalkboard"></i>
                                <input type="text" name="name" required
                                    placeholder="e.g. Grade 1, Form 2A, Class A…"
                                    value={form.name} onChange={handle} />
                            </div>
                            {errors.name && <span className="profile-error">{errors.name[0]}</span>}
                        </div>

                        {/* School Category */}
                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>School Category</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-tags"></i>
                                <select name="school_category_id" value={form.school_category_id} onChange={handle}
                                    style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.9rem', color:'#374151' }}>
                                    <option value="">— None —</option>
                                    {schoolCategories.map(sc => (
                                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.school_category_id && <span className="profile-error">{errors.school_category_id[0]}</span>}
                        </div>

                        {/* School Level */}
                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>School Level</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-layer-group"></i>
                                <select name="school_level_id" value={form.school_level_id} onChange={handle}
                                    style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.9rem', color:'#374151' }}>
                                    <option value="">— None —</option>
                                    {schoolLevels.map(sl => (
                                        <option key={sl.id} value={sl.id}>{sl.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.school_level_id && <span className="profile-error">{errors.school_level_id[0]}</span>}
                        </div>

                        {/* Capacity */}
                        <div className="profile-field">
                            <label>Class Capacity</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-users"></i>
                                <input type="number" name="capacity" min="1" max="9999"
                                    placeholder="Max students e.g. 40"
                                    value={form.capacity} onChange={handle} />
                            </div>
                            {errors.capacity && <span className="profile-error">{errors.capacity[0]}</span>}
                        </div>

                        {/* Status */}
                        <div className="profile-field">
                            <label>Status</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                <select name="status" value={form.status} onChange={handle}
                                    style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.9rem', color:'#374151' }}>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        {/* Class Teacher */}
                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>Class Teacher</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-chalkboard-teacher"></i>
                                <input type="text" name="teacher"
                                    placeholder="e.g. Mr. John Kamau"
                                    value={form.teacher} onChange={handle} />
                            </div>
                            {errors.teacher && <span className="profile-error">{errors.teacher[0]}</span>}
                        </div>

                        {/* Description */}
                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>Description <span style={{ color:'#9ca3af', fontSize:'.78rem' }}>(optional)</span></label>
                            <RichTextEditor value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} />
                            {errors.description && <span className="profile-error">{errors.description[0]}</span>}
                        </div>

                    </div>
                    </div>{/* end scrollable body */}

                    <div className="db-modal-actions" style={{ flexShrink:0, borderTop:'1px solid #f1f5f9', padding:'16px 28px', margin:0 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Update Class' : 'Add Class'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ cls, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className="db-modal-header" style={{ background:'#fef2f2', borderBottom:'1px solid #fecaca' }}>
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-exclamation-triangle"></i> Delete Class</h3>
                </div>
                <div style={{ padding:'24px 28px 28px' }}>
                    <p style={{ color:'#374151', marginBottom:8 }}>
                        Are you sure you want to delete <strong>{cls.name}</strong>?
                    </p>
                    <p style={{ color:'#6b7280', fontSize:'.85rem', marginBottom:24 }}>
                        Students assigned to this class will have their class cleared. This cannot be undone.
                    </p>
                    <div className="db-modal-actions">
                        <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="db-btn-danger" onClick={onConfirm} disabled={loading}>
                            {loading ? <><i className="fas fa-circle-notch fa-spin"></i> Deleting…</> : <><i className="fas fa-trash-alt"></i> Delete</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function Classes() {
    const { user, token, can } = useAuth();

    const [classes, setClasses] = useState([]);
    const [meta, setMeta]       = useState({ total: 0, last_page: 1 });
    const [search, setSearch]   = useState('');
    const [status, setStatus]   = useState('');
    const [page, setPage]       = useState(1);
    const [perPage, setPerPageVal] = useState(15);
    const [loading, setLoading] = useState(true);
    const [toast, setToast]     = useState(null);

    const [addModal, setAddModal]           = useState(false);
    const [editClass, setEditClass]         = useState(null);
    const [deleteClass, setDeleteClass]     = useState(null);
    const [deleting, setDeleting]           = useState(false);
    const [schoolCategories, setSchoolCats]   = useState([]);
    const [schoolLevels, setSchoolLevels]     = useState([]);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, per_page: perPage });
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        fetch(`/api/classes?${params}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(d => { setClasses(d.data || []); setMeta({ total: d.total || 0, last_page: d.last_page || 1 }); })
            .catch(() => setToast({ message: 'Failed to load classes.', type: 'error' }))
            .finally(() => setLoading(false));
    }, [token, page, perPage, search, status]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (!token) return;
        Promise.all([
            fetch('/api/school-categories?per_page=200', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then(r => r.json()),
            fetch('/api/school-levels?per_page=200',     { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then(r => r.json()),
        ]).then(([cats, levels]) => {
            setSchoolCats(cats.data ?? []);
            setSchoolLevels(levels.data ?? []);
        }).catch(() => {});
    }, [token]);

    const handleSave = saved => {
        setClasses(prev => {
            const idx = prev.findIndex(c => c.id === saved.id);
            return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
        });
        if (!editClass) setMeta(m => ({ ...m, total: m.total + 1 }));
        setAddModal(false);
        setEditClass(null);
        setToast({ message: editClass ? 'Class updated successfully.' : 'Class added successfully.', type: 'success' });
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/classes/${deleteClass.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            setClasses(prev => prev.filter(c => c.id !== deleteClass.id));
            setMeta(m => ({ ...m, total: m.total - 1 }));
            setDeleteClass(null);
            setToast({ message: 'Class deleted successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete class.', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    /* capacity usage bar */
    const capacityBar = (students, capacity) => {
        if (!capacity) return null;
        const pct   = Math.min(Math.round((students / capacity) * 100), 100);
        const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
        return (
            <div style={{ minWidth: 80 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'#6b7280', marginBottom:3 }}>
                    <span>{students}/{capacity}</span>
                    <span style={{ color }}>{pct}%</span>
                </div>
                <div style={{ height:5, borderRadius:10, background:'#e5e7eb', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:10, transition:'width .3s' }}></div>
                </div>
            </div>
        );
    };

    const from = meta.total === 0 ? 0 : (page - 1) * perPage + 1;
    const to   = Math.min(page * perPage, meta.total);

    /* Top bar: record count + per-page selector */
    const renderTableHeader = () => (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:10 }}>
            <div style={{ fontSize:'.82rem', color:'#9ca3af' }}>
                {meta.total === 0
                    ? 'No records found'
                    : <>Showing <strong style={{ color:'#374151' }}>{from}–{to}</strong> of <strong style={{ color:'#374151' }}>{meta.total}</strong> {meta.total === 1 ? 'class' : 'classes'}</>
                }
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'#9ca3af' }}>
                <span>Per page</span>
                <select
                    value={perPage}
                    onChange={e => { setPerPageVal(Number(e.target.value)); setPage(1); }}
                    style={{ border:'1.5px solid #e4e7f0', borderRadius:8, padding:'5px 10px', fontFamily:'Poppins,sans-serif', fontSize:'.82rem', color:'#374151', outline:'none', cursor:'pointer', background:'#fff' }}
                >
                    {[10, 15, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
        </div>
    );

    /* Bottom bar: page navigation buttons */
    const renderPageButtons = () => {
        if (meta.last_page <= 1) return null;

        const delta      = 2;
        const rangeStart = Math.max(2, page - delta);
        const rangeEnd   = Math.min(meta.last_page - 1, page + delta);
        const pages      = [];
        if (meta.last_page >= 1) pages.push(1);
        if (rangeStart > 2)      pages.push('…left');
        for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
        if (rangeEnd < meta.last_page - 1) pages.push('…right');
        if (meta.last_page > 1)  pages.push(meta.last_page);

        return (
            <div className="db-pagination" style={{ justifyContent:'center', gap:4, paddingTop:16 }}>
                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(1)} title="First page">
                    <i className="fas fa-angle-double-left"></i>
                </button>
                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} title="Previous">
                    <i className="fas fa-chevron-left"></i>
                </button>
                {pages.map(p =>
                    typeof p === 'string' ? (
                        <span key={p} className="db-page-btn" style={{ cursor:'default', opacity:.45, pointerEvents:'none' }}>…</span>
                    ) : (
                        <button key={p} className={`db-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    )
                )}
                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} title="Next">
                    <i className="fas fa-chevron-right"></i>
                </button>
                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)} title="Last page">
                    <i className="fas fa-angle-double-right"></i>
                </button>
            </div>
        );
    };

    const activeCount   = classes.filter(c => c.status === 'active').length;

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">

                <DashboardNavbar page="Classes" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('classes', 'view') && <AccessDenied />}
                    {can('classes', 'view') && (<>

                    {/* Top bar */}
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Classes</h1>
                            <p className="db-page-sub">Manage class groups, capacity and assigned teachers</p>
                        </div>
                        {can('classes', 'create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-plus"></i> Add Class
                            </button>
                        )}
                    </div>

                    {/* Stat cards */}
                    {can('classes','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
                                <i className="fas fa-chalkboard"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Classes</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#11998e,#38ef7d)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{activeCount}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#6b7280,#9ca3af)' }}>
                                <i className="fas fa-archive"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{classes.filter(c => c.status === 'archived').length}</div>
                                <div className="schools-stat-label">Archived (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search by class name or teacher…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select className="db-filter-select" value={status}
                            onChange={e => { setStatus(e.target.value); setPage(1); }}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Table header: record count + per-page */}
                    {!loading && renderTableHeader()}

                    {/* Table */}
                    {loading ? (
                        <div style={{ textAlign:'center', padding:'80px', color:'#9ca3af' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'2rem' }}></i>
                        </div>
                    ) : classes.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'80px 20px', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(8,31,78,.06)' }}>
                            <i className="fas fa-chalkboard" style={{ fontSize:'3rem', color:'#d1d5db', marginBottom:16, display:'block' }}></i>
                            <p style={{ color:'#6b7280', fontSize:'1rem', fontWeight:600, margin:0 }}>No classes found</p>
                            <p style={{ color:'#9ca3af', fontSize:'.85rem', marginTop:6 }}>
                                {search || status ? 'Try adjusting your filters.' : 'Click "Add Class" to create your first class.'}
                            </p>
                        </div>
                    ) : (
                        <div className="db-table-wrap">
                            <table className="db-table">
                                <thead>
                                    <tr>
                                        <th style={{ width:36 }}>#</th>
                                        <th>Class</th>
                                        <th>Category / Level</th>
                                        <th>Teacher / Capacity</th>
                                        <th>Students</th>
                                        <th>Status / Created</th>
                                        {(can('classes','update') || can('classes','delete')) && <th style={{ width:90 }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((cls, idx) => {
                                        const color    = classColor(cls.id);
                                        const students = cls.students_count ?? 0;
                                        return (
                                            <tr key={cls.id}>

                                                {/* # */}
                                                <td style={{ color:'#9ca3af', fontSize:'.8rem' }}>
                                                    {(page - 1) * perPage + idx + 1}
                                                </td>

                                                {/* Class name + description */}
                                                <td>
                                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                        <div style={{ width:38, height:38, borderRadius:10, background:color+'1a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                            <i className="fas fa-chalkboard" style={{ color, fontSize:'.95rem' }}></i>
                                                        </div>
                                                        <div style={{ minWidth:0 }}>
                                                            <div style={{ fontWeight:700, color:'#111827', fontSize:'.9rem', whiteSpace:'nowrap' }}>{cls.name}</div>
                                                            {cls.description && (
                                                                <div style={{ color:'#9ca3af', fontSize:'.73rem', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>
                                                                    {cls.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category + Level stacked */}
                                                <td>
                                                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                                        {cls.school_category ? (
                                                            <span title={cls.school_category.name} style={{ background:'#ede9fe', color:'#7c3aed', padding:'3px 9px', borderRadius:20, fontSize:'.72rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:4, maxWidth:150, overflow:'hidden' }}>
                                                                <i className="fas fa-tags" style={{ flexShrink:0 }}></i>
                                                                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cls.school_category.name}</span>
                                                            </span>
                                                        ) : (
                                                            <span style={{ color:'#d1d5db', fontSize:'.78rem' }}>No category</span>
                                                        )}
                                                        {cls.school_level ? (
                                                            <span title={cls.school_level.name} style={{ background:'#ecfdf5', color:'#059669', padding:'3px 9px', borderRadius:20, fontSize:'.72rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:4, maxWidth:150, overflow:'hidden' }}>
                                                                <i className="fas fa-layer-group" style={{ flexShrink:0 }}></i>
                                                                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cls.school_level.name}</span>
                                                            </span>
                                                        ) : (
                                                            <span style={{ color:'#d1d5db', fontSize:'.78rem' }}>No level</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Teacher + capacity bar stacked */}
                                                <td>
                                                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                                        {cls.teacher ? (
                                                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                                                <div style={{ width:24, height:24, borderRadius:'50%', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                                    <i className="fas fa-chalkboard-teacher" style={{ color:'#d97706', fontSize:'.65rem' }}></i>
                                                                </div>
                                                                <span style={{ color:'#374151', fontSize:'.82rem', fontWeight:500, whiteSpace:'nowrap' }}>{cls.teacher}</span>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color:'#d1d5db', fontSize:'.78rem' }}>Not assigned</span>
                                                        )}
                                                        {cls.capacity ? (
                                                            capacityBar(students, cls.capacity)
                                                        ) : (
                                                            <span style={{ color:'#9ca3af', fontSize:'.73rem' }}>No capacity set</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Students count */}
                                                <td>
                                                    <span style={{ background:'#f0fdf4', color:'#16a34a', padding:'4px 12px', borderRadius:20, fontSize:'.78rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:5 }}>
                                                        <i className="fas fa-user-graduate" style={{ fontSize:'.7rem' }}></i>
                                                        {students}
                                                    </span>
                                                </td>

                                                {/* Status + created date */}
                                                <td>
                                                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                                        <span className={`db-status-badge ${cls.status === 'active' ? 'db-status-active' : 'db-status-inactive'}`}>
                                                            <i className={`fas fa-${cls.status === 'active' ? 'check-circle' : 'archive'}`}></i>
                                                            {cls.status === 'active' ? 'Active' : 'Archived'}
                                                        </span>
                                                        <span style={{ color:'#9ca3af', fontSize:'.73rem' }}>
                                                            {new Date(cls.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                {(can('classes','update') || can('classes','delete')) && (
                                                    <td>
                                                        <div className="db-action-btns">
                                                            {can('classes','update') && (
                                                                <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditClass(cls)}>
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                            )}
                                                            {can('classes','delete') && (
                                                                <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteClass(cls)}>
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {renderPageButtons()}
                    </>)}
                </div>
            </div>

            {addModal    && <ClassModal onSave={handleSave} onClose={() => setAddModal(false)} token={token} schoolCategories={schoolCategories} schoolLevels={schoolLevels} />}
            {editClass   && <ClassModal cls={editClass} onSave={handleSave} onClose={() => setEditClass(null)} token={token} schoolCategories={schoolCategories} schoolLevels={schoolLevels} />}
            {deleteClass && <DeleteModal cls={deleteClass} onConfirm={handleDelete} onClose={() => setDeleteClass(null)} loading={deleting} />}
        </div>
    );
}
