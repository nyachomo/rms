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

/* ── Role colour map ── */
const ROLE_COLORS = [
    { bg: '#eef2ff', color: '#4338ca', icon: '#6366f1' },
    { bg: '#fff1f2', color: '#be123c', icon: '#f43f5e' },
    { bg: '#fdf4ff', color: '#7e22ce', icon: '#a855f7' },
    { bg: '#fff7ed', color: '#c2410c', icon: '#f97316' },
    { bg: '#f0fdfa', color: '#0f766e', icon: '#14b8a6' },
    { bg: '#fef9c3', color: '#a16207', icon: '#eab308' },
];
const roleColor = id => ROLE_COLORS[(id - 1) % ROLE_COLORS.length];

/* ── Add / Edit Modal ── */
function RoleModal({ role, onSave, onClose, token }) {
    const isEdit = !!role?.id;
    const [form, setForm] = useState({
        name:        role?.name        || '',
        description: role?.description || '',
        status:      role?.status      || 'active',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/roles/${role.id}` : '/api/roles';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.role);
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
                    <h3><i className={`fas fa-${isEdit ? 'edit' : 'plus-circle'}`}></i> {isEdit ? 'Edit Role' : 'Add Role'}</h3>
                </div>
                <form onSubmit={submit} style={{ padding: '24px 28px 28px' }}>
                    <div className="profile-field">
                        <label>Role Name <span style={{ color:'#dc2626' }}>*</span></label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-user-shield"></i>
                            <input type="text" name="name" required placeholder="e.g. Administrator, Teacher, Coordinator…"
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
                                : <><i className="fas fa-save"></i> {isEdit ? 'Save Changes' : 'Add Role'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ role, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" style={{ maxWidth: 420, position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-trash-alt"></i> Delete Role</h3>
                </div>
                <div style={{ padding: '24px 28px' }}>
                    <p style={{ color:'#374151', marginBottom:8 }}>
                        Are you sure you want to delete <strong>{role.name}</strong>?
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

/* ── Permissions Modal ── */
/* Ordered master list — determines column order in the permissions table */
const ACTION_LABELS = {
    view: 'View', create: 'Create', update: 'Edit', delete: 'Delete',
    export: 'Export', import: 'Import', clear_all: 'Clear All',
    manage_permissions: 'Permissions', view_stats: 'View Stats',
};
const ACTION_ICONS = {
    view: 'fa-eye', create: 'fa-plus-circle', update: 'fa-edit', delete: 'fa-trash-alt',
    export: 'fa-file-export', import: 'fa-file-import', clear_all: 'fa-eraser',
    manage_permissions: 'fa-key', view_stats: 'fa-chart-bar',
};
const ACTION_COLORS = {
    view: '#2563eb', create: '#16a34a', update: '#d97706', delete: '#dc2626',
    export: '#7c3aed', import: '#0891b2', clear_all: '#be123c',
    manage_permissions: '#c2410c', view_stats: '#0f766e',
};

function PermissionsModal({ role, onClose, token }) {
    const [perms, setPerms]               = useState(null);   // { schools: { view: bool, ... }, ... }
    const [modules, setModules]           = useState({});      // { schools: 'Schools', ... }
    const [moduleActions, setModuleActions] = useState({});    // { schools: ['view','create',...], ... }
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [toast, setToast]               = useState(null);

    useEffect(() => {
        fetch(`/api/roles/${role.id}/permissions`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(d => { setPerms(d.permissions); setModules(d.modules); setModuleActions(d.module_actions ?? {}); })
            .catch(() => setToast({ message: 'Failed to load permissions.', type: 'error' }))
            .finally(() => setLoading(false));
    }, [role.id, token]);

    const toggle = (module, action) => {
        setPerms(prev => ({
            ...prev,
            [module]: { ...prev[module], [action]: !prev[module][action] },
        }));
    };

    const toggleRow = (module) => {
        const modActions = moduleActions[module] ?? [];
        const allOn = modActions.every(a => perms[module][a]);
        setPerms(prev => ({
            ...prev,
            [module]: { ...prev[module], ...Object.fromEntries(modActions.map(a => [a, !allOn])) },
        }));
    };

    const save = async () => {
        setSaving(true);
        try {
            const res  = await fetch(`/api/roles/${role.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ permissions: perms }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error();
            setToast({ message: data.message, type: 'success' });
        } catch {
            setToast({ message: 'Failed to save permissions.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()}
                style={{ maxWidth:920, width:'95vw', position:'relative', display:'flex', flexDirection:'column', maxHeight:'90vh', overflow:'hidden' }}>

                {/* ── Sticky header ── */}
                <div className="db-modal-header" style={{ borderBottom:'2px solid #eef2ff', flexShrink:0, position:'relative', paddingRight:52 }}>
                    <h3 style={{ color:'#4338ca' }}>
                        <i className="fas fa-key"></i> Permissions — <span style={{ color:'#111827' }}>{role.name}</span>
                    </h3>
                    <button onClick={onClose} style={{ position:'absolute', top:'50%', right:16, transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div style={{ overflowY:'auto', flex:1, padding:'20px 28px' }}>

                    {/* inline toast */}
                    {toast && (
                        <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:8, background: toast.type==='error'?'#fef2f2':'#f0fdf4', border:`1px solid ${toast.type==='error'?'#fca5a5':'#86efac'}`, display:'flex', alignItems:'center', gap:10, fontSize:'.85rem' }}>
                            <i className={`fas ${toast.type==='error'?'fa-exclamation-circle':'fa-check-circle'}`} style={{ color: toast.type==='error'?'#dc2626':'#16a34a', flexShrink:0 }}></i>
                            <span style={{ color: toast.type==='error'?'#991b1b':'#15803d', flex:1 }}>{toast.message}</span>
                            <button onClick={() => setToast(null)} style={{ background:'none', border:'none', cursor:'pointer', color: toast.type==='error'?'#dc2626':'#16a34a', padding:'0 2px', fontSize:'.85rem', lineHeight:1, flexShrink:0 }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'1.5rem' }}></i>
                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            {Object.entries(modules).map(([key, label]) => {
                                const modActs  = moduleActions[key] ?? [];
                                const allOn    = perms && modActs.length > 0 && modActs.every(a => perms[key]?.[a]);
                                const someOn   = perms && modActs.some(a => perms[key]?.[a]);

                                return (
                                    <div key={key} style={{ border:'1.5px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
                                        {/* Module header */}
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background: allOn ? '#eef2ff' : someOn ? '#fafafa' : '#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                <i className="fas fa-th-large" style={{ color: allOn ? '#4338ca' : '#9ca3af', fontSize:'.75rem' }}></i>
                                                <span style={{ fontWeight:700, fontSize:'.88rem', color: allOn ? '#4338ca' : '#374151' }}>{label}</span>
                                                {allOn && (
                                                    <span style={{ background:'#4338ca', color:'#fff', borderRadius:20, padding:'1px 8px', fontSize:'.68rem', fontWeight:600 }}>All on</span>
                                                )}
                                            </div>
                                            {/* Toggle-all button */}
                                            <button type="button" onClick={() => toggleRow(key)}
                                                style={{ fontSize:'.72rem', fontWeight:600, color: allOn ? '#4338ca' : '#6b7280', background:'none', border:`1px solid ${allOn?'#c7d2fe':'#e5e7eb'}`, borderRadius:6, padding:'3px 10px', cursor:'pointer', whiteSpace:'nowrap' }}>
                                                {allOn ? 'Deselect all' : 'Select all'}
                                            </button>
                                        </div>

                                        {/* Permissions */}
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'12px 16px', background:'#fff' }}>
                                            {modActs.map(action => {
                                                const checked = perms?.[key]?.[action] ?? false;
                                                return (
                                                    <label key={action} onClick={() => toggle(key, action)}
                                                        style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px', borderRadius:8, border:`1.5px solid ${checked ? ACTION_COLORS[action] : '#e5e7eb'}`, background: checked ? ACTION_COLORS[action] + '14' : '#fff', cursor:'pointer', userSelect:'none', transition:'all .15s' }}>
                                                        <span style={{
                                                            width:16, height:16, borderRadius:4, flexShrink:0,
                                                            border:`2px solid ${checked ? ACTION_COLORS[action] : '#d1d5db'}`,
                                                            background: checked ? ACTION_COLORS[action] : '#fff',
                                                            display:'flex', alignItems:'center', justifyContent:'center',
                                                            transition:'all .15s',
                                                        }}>
                                                            {checked && <i className="fas fa-check" style={{ color:'#fff', fontSize:'.5rem' }}></i>}
                                                        </span>
                                                        <i className={`fas ${ACTION_ICONS[action]}`} style={{ color: checked ? ACTION_COLORS[action] : '#9ca3af', fontSize:'.72rem' }}></i>
                                                        <span style={{ fontSize:'.8rem', fontWeight:600, color: checked ? ACTION_COLORS[action] : '#6b7280', whiteSpace:'nowrap' }}>
                                                            {ACTION_LABELS[action]}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Sticky footer ── */}
                {!loading && (
                    <div className="db-modal-actions" style={{ flexShrink:0, borderTop:'1px solid #e5e7eb', padding:'16px 28px', margin:0, borderRadius:'0 0 16px 16px', background:'#fff' }}>
                        <button className="db-btn-secondary" onClick={onClose}>Close</button>
                        <button className="profile-btn-save" onClick={save} disabled={saving}>
                            {saving
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> Save Permissions</>
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function Roles() {
    const { user, token, can } = useAuth();

    const [roles, setRoles]           = useState([]);
    const [meta, setMeta]             = useState({ total:0, current_page:1, last_page:1 });
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('');
    const [page, setPage]             = useState(1);
    const [fetching, setFetching]     = useState(false);

    const [toast, setToast]           = useState(null);
    const [addModal, setAddModal]     = useState(false);
    const [editRole, setEditRole]     = useState(null);
    const [deleteRole, setDeleteRole] = useState(null);
    const [deleteLoading, setDeleting]= useState(false);
    const [permsRole, setPermsRole]   = useState(null);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const fetchRoles = useCallback(async () => {
        setFetching(true);
        const params = new URLSearchParams({ page });
        if (search)       params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        try {
            const res  = await fetch(`/api/roles?${params}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setRoles(data.data || []);
            setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page });
        } catch {
            setToast({ message: 'Failed to load roles.', type: 'error' });
        } finally {
            setFetching(false);
        }
    }, [token, page, search, statusFilter]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const handleSearch = e => { setSearch(e.target.value); setPage(1); };
    const handleStatus = e => { setStatus(e.target.value); setPage(1); };

    const onSaved = r => {
        setAddModal(false);
        setEditRole(null);
        fetchRoles();
        setToast({ message: `Role "${r.name}" saved successfully!`, type: 'success' });
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/roles/${deleteRole.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            setDeleteRole(null);
            fetchRoles();
            setToast({ message: 'Role deleted successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete role.', type: 'error' });
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
                <DashboardNavbar page="Roles" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('roles', 'view') && <AccessDenied />}
                    {can('roles', 'view') && (
                    <>
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Roles</h1>
                            <p className="db-page-sub">Define and manage user roles within the system</p>
                        </div>
                        {can('roles', 'create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-plus"></i> Add Role
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('roles','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#6366f1,#4338ca)' }}>
                                <i className="fas fa-user-shield"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Roles</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{roles.filter(r => r.status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#6b7280,#9ca3af)' }}>
                                <i className="fas fa-archive"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{roles.filter(r => r.status === 'archived').length}</div>
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
                                    <th>Role Name</th>
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
                                ) : roles.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-user-shield" style={{ fontSize:'2.5rem', display:'block', marginBottom:12 }}></i>
                                        No roles found.
                                    </td></tr>
                                ) : roles.map((r, i) => {
                                    const c = roleColor(r.id);
                                    return (
                                        <tr key={r.id}>
                                            <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                                {(meta.current_page - 1) * 15 + i + 1}
                                            </td>
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:34, height:34, borderRadius:8, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                        <i className="fas fa-user-shield" style={{ color:c.icon, fontSize:'.85rem' }}></i>
                                                    </div>
                                                    <span className="db-student-name" style={{ color:c.color }}>{r.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color:'#6b7280', maxWidth:360 }}>
                                                {r.description
                                                    ? <span title={r.description}>{r.description.length > 80 ? r.description.slice(0, 80) + '…' : r.description}</span>
                                                    : <span style={{ color:'#d1d5db', fontStyle:'italic' }}>No description</span>
                                                }
                                            </td>
                                            <td>
                                                <span className={`db-status-badge ${r.status === 'active' ? 'db-status-active' : 'db-status-inactive'}`}>
                                                    <i className={`fas fa-${r.status === 'active' ? 'check-circle' : 'archive'}`}></i>
                                                    {r.status === 'active' ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                                {new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                            </td>
                                            <td>
                                                <div className="db-action-btns">
                                                    {can('roles', 'manage_permissions') && (
                                                        <button className="db-action-btn" title="Manage Permissions"
                                                            onClick={() => setPermsRole(r)}
                                                            style={{ color:'#4338ca', borderColor:'#c7d2fe', background:'#eef2ff' }}>
                                                            <i className="fas fa-key"></i>
                                                        </button>
                                                    )}
                                                    {can('roles', 'update') && (
                                                        <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditRole(r)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    )}
                                                    {can('roles', 'delete') && (
                                                        <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteRole(r)}>
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
                    )}{/* /can roles view */}
                </div>
            </div>

            {/* Modals */}
            {addModal    && <RoleModal token={token} onSave={onSaved} onClose={() => setAddModal(false)} />}
            {editRole    && <RoleModal role={editRole} token={token} onSave={onSaved} onClose={() => setEditRole(null)} />}
            {deleteRole  && <DeleteModal role={deleteRole} loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setDeleteRole(null)} />}
            {permsRole   && <PermissionsModal role={permsRole} token={token} onClose={() => setPermsRole(null)} />}
        </div>
    );
}
