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

/* ── Level colour map ── */
const LEVEL_COLORS = [
    { bg: '#eff6ff', color: '#2563eb', icon: '#2563eb' },
    { bg: '#f0fdf4', color: '#16a34a', icon: '#16a34a' },
    { bg: '#fef3c7', color: '#b45309', icon: '#f59e0b' },
    { bg: '#fdf2f8', color: '#9333ea', icon: '#9333ea' },
    { bg: '#fff1f2', color: '#e11d48', icon: '#e11d48' },
    { bg: '#ecfdf5', color: '#0d9488', icon: '#0d9488' },
];
const levelColor = id => LEVEL_COLORS[(id - 1) % LEVEL_COLORS.length];

/* ── Add / Edit Modal ── */
function LevelModal({ level, onSave, onClose, token }) {
    const isEdit = !!level?.id;
    const [form, setForm] = useState({
        name:        level?.name        || '',
        description: level?.description || '',
        status:      level?.status      || 'active',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/school-levels/${level.id}` : '/api/school-levels';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.level);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, position: 'relative' }}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3><i className={`fas fa-${isEdit ? 'edit' : 'plus-circle'}`}></i> {isEdit ? 'Edit School Level' : 'Add School Level'}</h3>
                </div>
                <form onSubmit={submit} style={{ padding: '24px 28px 28px' }}>
                    <div className="profile-field">
                        <label>Level Name <span style={{ color:'#dc2626' }}>*</span></label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-layer-group"></i>
                            <input type="text" name="name" required placeholder="e.g. Primary, Secondary, University…"
                                   value={form.name} onChange={handle} />
                        </div>
                        {errors.name && <span className="profile-error">{errors.name[0]}</span>}
                    </div>

                    <div className="profile-field">
                        <label>Description</label>
                        <RichTextEditor value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} />
                        {errors.description && <span className="profile-error">{errors.description[0]}</span>}
                    </div>

                    {isEdit && (
                        <div className="profile-field">
                            <label>Status</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                <select name="status" value={form.status} onChange={handle}>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                        </div>
                    )}

                    <div className="db-modal-actions" style={{ marginTop: 8 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Save Changes' : 'Add Level'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ level, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" style={{ maxWidth: 420, position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-trash-alt"></i> Delete School Level</h3>
                </div>
                <div style={{ padding: '24px 28px' }}>
                    <p style={{ color:'#374151', marginBottom:8 }}>
                        Are you sure you want to delete <strong>{level.name}</strong>?
                    </p>
                    <p style={{ color:'#9ca3af', fontSize:'.9rem' }}>This action cannot be undone.</p>
                </div>
                <div className="db-modal-actions">
                    <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="db-btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? <><i className="fas fa-circle-notch fa-spin"></i> Deleting…</> : <><i className="fas fa-trash-alt"></i> Delete</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function SchoolLevels() {
    const { user, token, logout, can } = useAuth();

    const [levels, setLevels]         = useState([]);
    const [meta, setMeta]             = useState({ total:0, current_page:1, last_page:1 });
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('');
    const [page, setPage]             = useState(1);
    const [fetching, setFetching]     = useState(false);

    const [toast, setToast]           = useState(null);
    const [addModal, setAddModal]     = useState(false);
    const [editLevel, setEditLevel]   = useState(null);
    const [deleteLevel, setDeleteLvl] = useState(null);
    const [deleteLoading, setDeleting]= useState(false);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const fetchLevels = useCallback(async () => {
        setFetching(true);
        const params = new URLSearchParams({ page });
        if (search)       params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        try {
            const res  = await fetch(`/api/school-levels?${params}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setLevels(data.data || []);
            setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page });
        } catch {
            setToast({ message: 'Failed to load school levels.', type: 'error' });
        } finally {
            setFetching(false);
        }
    }, [token, page, search, statusFilter]);

    useEffect(() => { fetchLevels(); }, [fetchLevels]);

    const handleSearch = e => { setSearch(e.target.value); setPage(1); };
    const handleStatus = e => { setStatus(e.target.value); setPage(1); };

    const onSaved = lvl => {
        setAddModal(false);
        setEditLevel(null);
        fetchLevels();
        setToast({ message: `Level "${lvl.name}" saved successfully!`, type: 'success' });
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/school-levels/${deleteLevel.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            setDeleteLvl(null);
            fetchLevels();
            setToast({ message: 'School level deleted successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete school level.', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    /* ── Pagination ── */
    const renderPagination = () => {
        if (meta.last_page <= 1) return null;
        const delta = 2;
        const start = Math.max(2, page - delta);
        const end   = Math.min(meta.last_page - 1, page + delta);
        const pages = [1];
        if (start > 2) pages.push('…l');
        for (let p = start; p <= end; p++) pages.push(p);
        if (end < meta.last_page - 1) pages.push('…r');
        if (meta.last_page > 1) pages.push(meta.last_page);
        return (
            <div className="db-pagination">
                <button className="db-page-btn" disabled={page===1} onClick={() => setPage(1)}><i className="fas fa-angle-double-left"></i></button>
                <button className="db-page-btn" disabled={page===1} onClick={() => setPage(p => p-1)}><i className="fas fa-chevron-left"></i></button>
                {pages.map((p, i) =>
                    typeof p === 'string'
                        ? <span key={p+i} className="db-page-btn" style={{ cursor:'default', opacity:.5 }}>…</span>
                        : <button key={p} className={`db-page-btn ${p===page?'active':''}`} onClick={() => setPage(p)}>{p}</button>
                )}
                <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(p => p+1)}><i className="fas fa-chevron-right"></i></button>
                <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(meta.last_page)}><i className="fas fa-angle-double-right"></i></button>
                <span style={{ fontSize:'.8rem', color:'#9ca3af', marginLeft:8, whiteSpace:'nowrap' }}>
                    Page {page} of {meta.last_page} &nbsp;·&nbsp; {meta.total} records
                </span>
            </div>
        );
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />

            <div className="db-main">
                <DashboardNavbar page="School Levels" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('school_levels', 'view') && <AccessDenied />}
                    {can('school_levels', 'view') && (
                    <>
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">School Levels</h1>
                            <p className="db-page-sub">Define education levels such as Primary, Secondary, University…</p>
                        </div>
                        {can('school_levels', 'create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-plus"></i> Add Level
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('school_levels','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                                <i className="fas fa-layer-group"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Levels</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{levels.filter(l => l.status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#6b7280,#9ca3af)' }}>
                                <i className="fas fa-archive"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{levels.filter(l => l.status === 'archived').length}</div>
                                <div className="schools-stat-label">Archived (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search by name or description…"
                                   value={search} onChange={handleSearch} />
                        </div>
                        <select className="db-filter-select" value={statusFilter} onChange={handleStatus}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="db-table-wrap">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Level Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetching ? (
                                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'1.5rem' }}></i>
                                    </td></tr>
                                ) : levels.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-layer-group" style={{ fontSize:'2.5rem', display:'block', marginBottom:12 }}></i>
                                        No school levels found.
                                    </td></tr>
                                ) : levels.map((lvl, i) => {
                                    const c = levelColor(lvl.id);
                                    return (
                                        <tr key={lvl.id}>
                                            <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                                {(meta.current_page - 1) * 15 + i + 1}
                                            </td>
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:34, height:34, borderRadius:8, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                        <i className="fas fa-layer-group" style={{ color:c.icon, fontSize:'.85rem' }}></i>
                                                    </div>
                                                    <span className="db-student-name" style={{ color:c.color }}>{lvl.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color:'#6b7280', maxWidth:340 }}>
                                                {lvl.description
                                                    ? <span title={lvl.description}>{lvl.description.length > 80 ? lvl.description.slice(0, 80) + '…' : lvl.description}</span>
                                                    : <span style={{ color:'#d1d5db', fontStyle:'italic' }}>No description</span>
                                                }
                                            </td>
                                            <td>
                                                <span className={`db-status-badge ${lvl.status === 'active' ? 'db-status-active' : 'db-status-inactive'}`}>
                                                    <i className={`fas fa-${lvl.status === 'active' ? 'check-circle' : 'archive'}`}></i>
                                                    {lvl.status === 'active' ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                                {new Date(lvl.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                            </td>
                                            <td>
                                                <div className="db-action-btns">
                                                    {can('school_levels', 'update') && (
                                                        <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditLevel(lvl)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    )}
                                                    {can('school_levels', 'delete') && (
                                                        <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteLvl(lvl)}>
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {renderPagination()}
                    </>
                    )}{/* /can school_levels view */}
                </div>
            </div>

            {/* Modals */}
            {addModal    && <LevelModal token={token} onSave={onSaved} onClose={() => setAddModal(false)} />}
            {editLevel   && <LevelModal level={editLevel} token={token} onSave={onSaved} onClose={() => setEditLevel(null)} />}
            {deleteLevel && <DeleteModal level={deleteLevel} loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setDeleteLvl(null)} />}
        </div>
    );
}
