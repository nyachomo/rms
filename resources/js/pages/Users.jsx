import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';

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

/* ── Avatar initials ── */
const AVATAR_COLORS = [
    ['#eff6ff','#2563eb'],['#f0fdf4','#16a34a'],['#fdf4ff','#7e22ce'],
    ['#fff7ed','#c2410c'],['#f0fdfa','#0f766e'],['#fef9c3','#a16207'],
];
const avatarColor = id => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

/* ── User Modal (Add / Edit) ── */
function UserModal({ userData, onSave, onClose, token, roles }) {
    const isEdit = !!userData?.id;
    const [form, setForm] = useState({
        name:                  userData?.name     || '',
        email:                 userData?.email    || '',
        role_id:               userData?.role_id  || '',
        status:                userData?.status   || 'active',
        password:              '',
        password_confirmation: '',
    });
    const [errors, setErrors]     = useState({});
    const [loading, setLoading]   = useState(false);
    const [showPwd, setShowPwd]   = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/users/${userData.id}` : '/api/users';
            const method = isEdit ? 'PUT' : 'POST';
            const payload = { ...form, role_id: form.role_id || null };
            // On edit, omit password fields if left blank
            if (isEdit && !payload.password) {
                delete payload.password;
                delete payload.password_confirmation;
            }
            const res  = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.user);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, position: 'relative' }}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3><i className={`fas fa-${isEdit ? 'user-edit' : 'user-plus'}`}></i> {isEdit ? 'Edit User' : 'Add User'}</h3>
                </div>
                <form onSubmit={submit} style={{ padding: '24px 28px 28px' }}>

                    {/* Name & Email */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                        <div className="profile-field" style={{ marginBottom:0 }}>
                            <label>Full Name <span style={{ color:'#dc2626' }}>*</span></label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-user"></i>
                                <input type="text" name="name" required placeholder="e.g. Jane Doe"
                                       value={form.name} onChange={handle} />
                            </div>
                            {errors.name && <span className="profile-error">{errors.name[0]}</span>}
                        </div>
                        <div className="profile-field" style={{ marginBottom:0 }}>
                            <label>Email Address <span style={{ color:'#dc2626' }}>*</span></label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-envelope"></i>
                                <input type="email" name="email" required placeholder="jane@example.com"
                                       value={form.email} onChange={handle} />
                            </div>
                            {errors.email && <span className="profile-error">{errors.email[0]}</span>}
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
                        <div className="profile-field" style={{ marginBottom:0 }}>
                            <label>Role</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-user-shield"></i>
                                <select name="role_id" value={form.role_id} onChange={handle}>
                                    <option value="">— No Role —</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                            {errors.role_id && <span className="profile-error">{errors.role_id[0]}</span>}
                        </div>
                        {isEdit && (
                            <div className="profile-field" style={{ marginBottom:0 }}>
                                <label>Status</label>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-toggle-on"></i>
                                    <select name="status" value={form.status} onChange={handle}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <i className="fas fa-chevron-down select-arrow"></i>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Password section */}
                    <div style={{ margin:'20px 0 6px', padding:'14px 16px', background:'#f9fafb', borderRadius:10, border:'1px solid #e5e7eb' }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.82rem', color:'#374151', margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}>
                            <i className="fas fa-lock" style={{ color:'#fe730c' }}></i>
                            {isEdit ? 'Change Password' : 'Set Password'}
                            {isEdit && <span style={{ fontWeight:400, color:'#9ca3af', fontSize:'.78rem' }}>(leave blank to keep current)</span>}
                        </p>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                            <div className="profile-field" style={{ marginBottom:0 }}>
                                <label>{isEdit ? 'New Password' : 'Password'} {!isEdit && <span style={{ color:'#dc2626' }}>*</span>}</label>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-key"></i>
                                    <input type={showPwd ? 'text' : 'password'} name="password"
                                           required={!isEdit} placeholder="Min. 8 characters"
                                           value={form.password} onChange={handle} />
                                    <button type="button" onClick={() => setShowPwd(s => !s)}
                                        style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'0 8px', fontSize:'.85rem' }}>
                                        <i className={`fas fa-eye${showPwd ? '-slash' : ''}`}></i>
                                    </button>
                                </div>
                                {errors.password && <span className="profile-error">{errors.password[0]}</span>}
                            </div>
                            <div className="profile-field" style={{ marginBottom:0 }}>
                                <label>Confirm Password {!isEdit && <span style={{ color:'#dc2626' }}>*</span>}</label>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-key"></i>
                                    <input type={showPwd ? 'text' : 'password'} name="password_confirmation"
                                           required={!isEdit} placeholder="Repeat password"
                                           value={form.password_confirmation} onChange={handle} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="db-modal-actions" style={{ marginTop:16 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Save Changes' : 'Create User'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ userData, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" style={{ maxWidth:420, position:'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-trash-alt"></i> Delete User</h3>
                </div>
                <div style={{ padding:'24px 28px' }}>
                    <p style={{ color:'#374151', marginBottom:8 }}>
                        Are you sure you want to delete <strong>{userData.name}</strong>?
                    </p>
                    <p style={{ color:'#9ca3af', fontSize:'.9rem' }}>Their account and all access tokens will be permanently removed.</p>
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
export default function Users() {
    const { user, token, logout, can } = useAuth();

    const [users, setUsers]           = useState([]);
    const [meta, setMeta]             = useState({ total:0, current_page:1, last_page:1 });
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [roles, setRoles]           = useState([]);
    const [page, setPage]             = useState(1);
    const [fetching, setFetching]     = useState(false);

    const [toast, setToast]             = useState(null);
    const [addModal, setAddModal]       = useState(false);
    const [editUser, setEditUser]       = useState(null);
    const [deleteUser, setDeleteUser]   = useState(null);
    const [deleteLoading, setDeleting]  = useState(false);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';

    /* Load roles once */
    useEffect(() => {
        fetch('/api/roles?status=active&per_page=200', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(d => setRoles(d.data || []))
            .catch(() => {});
    }, [token]);

    const fetchUsers = useCallback(async () => {
        setFetching(true);
        const params = new URLSearchParams({ page });
        if (search)       params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        if (roleFilter)   params.set('role_id', roleFilter);
        try {
            const res  = await fetch(`/api/users?${params}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setUsers(data.data || []);
            setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page });
        } catch {
            setToast({ message: 'Failed to load users.', type: 'error' });
        } finally {
            setFetching(false);
        }
    }, [token, page, search, statusFilter, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSearch = e => { setSearch(e.target.value);   setPage(1); };
    const handleStatus = e => { setStatus(e.target.value);   setPage(1); };
    const handleRole   = e => { setRoleFilter(e.target.value); setPage(1); };

    const onSaved = u => {
        setAddModal(false);
        setEditUser(null);
        fetchUsers();
        setToast({ message: `User "${u.name}" saved successfully!`, type: 'success' });
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res  = await fetch(`/api/users/${deleteUser.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            if (!res.ok) { setToast({ message: data.message || 'Failed to delete user.', type: 'error' }); return; }
            setDeleteUser(null);
            fetchUsers();
            setToast({ message: 'User deleted successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete user.', type: 'error' });
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
                <DashboardNavbar page="Users" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('users', 'view') && <AccessDenied />}
                    {can('users', 'view') && (
                    <>
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Users</h1>
                            <p className="db-page-sub">Manage system users and their assigned roles</p>
                        </div>
                        {can('users', 'create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-user-plus"></i> Add User
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('users','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
                                <i className="fas fa-users-cog"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Users</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{users.filter(u => u.status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#f43f5e,#be123c)' }}>
                                <i className="fas fa-user-times"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{users.filter(u => u.status === 'inactive').length}</div>
                                <div className="schools-stat-label">Inactive (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search by name or email…"
                                   value={search} onChange={handleSearch} />
                        </div>
                        <select className="db-filter-select" value={statusFilter} onChange={handleStatus}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select className="db-filter-select" value={roleFilter} onChange={handleRole}>
                            <option value="">All Roles</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="db-table-wrap">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetching ? (
                                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'1.5rem' }}></i>
                                    </td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-users" style={{ fontSize:'2.5rem', display:'block', marginBottom:12 }}></i>
                                        No users found.
                                    </td></tr>
                                ) : users.map((u, i) => {
                                    const [bg, color] = avatarColor(u.id);
                                    const isSelf = u.id === user?.id;
                                    return (
                                        <tr key={u.id}>
                                            <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                                {(meta.current_page - 1) * 15 + i + 1}
                                            </td>
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:36, height:36, borderRadius:'50%', background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.78rem', flexShrink:0 }}>
                                                        {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                                                    </div>
                                                    <div>
                                                        <div className="db-student-name">{u.name}</div>
                                                        {isSelf && <div style={{ fontSize:'.72rem', color:'#fe730c', fontWeight:600 }}>You</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color:'#6b7280', fontSize:'.88rem' }}>{u.email}</td>
                                            <td>
                                                {u.role
                                                    ? <span className="db-track-pill" style={{ background:'#eef2ff', color:'#4338ca' }}>
                                                        <i className="fas fa-user-shield" style={{ marginRight:5 }}></i>
                                                        {u.role.name}
                                                      </span>
                                                    : <span style={{ color:'#d1d5db', fontSize:'.82rem', fontStyle:'italic' }}>No role</span>
                                                }
                                            </td>
                                            <td>
                                                <span className={`db-status-badge ${u.status === 'active' ? 'db-status-active' : 'db-status-inactive'}`}>
                                                    <i className={`fas fa-${u.status === 'active' ? 'check-circle' : 'times-circle'}`}></i>
                                                    {u.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                                {new Date(u.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                            </td>
                                            <td>
                                                <div className="db-action-btns">
                                                    {can('users', 'update') && (
                                                        <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditUser(u)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    )}
                                                    {can('users', 'delete') && (
                                                        <button className="db-action-btn db-action-delete" title="Delete"
                                                            disabled={isSelf}
                                                            style={{ opacity: isSelf ? .35 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                                                            onClick={() => !isSelf && setDeleteUser(u)}>
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
                    )}{/* /can users view */}
                </div>
            </div>

            {/* Modals */}
            {addModal   && <UserModal token={token} roles={roles} onSave={onSaved} onClose={() => setAddModal(false)} />}
            {editUser   && <UserModal userData={editUser} token={token} roles={roles} onSave={onSaved} onClose={() => setEditUser(null)} />}
            {deleteUser && <DeleteModal userData={deleteUser} loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setDeleteUser(null)} />}
        </div>
    );
}
