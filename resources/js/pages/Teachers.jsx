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

const GENDER_COLORS = {
    male:   { bg:'#eff6ff', color:'#2563eb' },
    female: { bg:'#fdf2f8', color:'#9333ea' },
    other:  { bg:'#f0fdf4', color:'#16a34a' },
};

/* ── Reset Password Modal ── */
function ResetPasswordModal({ teacher, onClose, onDone, token }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone]       = useState(false);

    const handleReset = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teachers/${teacher.id}/reset-password`, {
                method: 'POST',
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            if (res.ok) { setDone(true); onDone('Password reset to default (12345678).'); }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
                <div className="db-modal-header" style={{ background:'#fffbeb', borderBottom:'1px solid #fde68a' }}>
                    <h3 style={{ color:'#92400e' }}><i className="fas fa-key"></i> Reset Password</h3>
                </div>
                <div style={{ padding:'24px 28px 28px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, background:'#f8fafc', borderRadius:10, padding:'12px 14px', marginBottom:20 }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background: teacher.gender==='female'?'#fdf2f8':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <i className="fas fa-chalkboard-teacher" style={{ color: teacher.gender==='female'?'#9333ea':'#2563eb', fontSize:'.85rem' }}></i>
                        </div>
                        <div>
                            <div style={{ fontWeight:600, color:'#111827', fontSize:'.9rem' }}>{teacher.name}</div>
                            <div style={{ color:'#9ca3af', fontSize:'.75rem' }}>{teacher.email}</div>
                        </div>
                    </div>
                    {done ? (
                        <div style={{ textAlign:'center', padding:'10px 0 6px' }}>
                            <div style={{ width:52, height:52, borderRadius:'50%', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                                <i className="fas fa-check-circle" style={{ color:'#16a34a', fontSize:'1.6rem' }}></i>
                            </div>
                            <p style={{ fontWeight:600, color:'#15803d', margin:'0 0 4px' }}>Password reset successfully</p>
                            <p style={{ color:'#9ca3af', fontSize:'.82rem', margin:0 }}>
                                New password: <span style={{ fontFamily:'monospace', fontWeight:700, color:'#4338ca' }}>12345678</span>
                            </p>
                            <button className="db-btn-secondary" style={{ marginTop:20 }} onClick={onClose}>Close</button>
                        </div>
                    ) : (<>
                        <p style={{ color:'#374151', fontSize:'.88rem', marginBottom:6 }}>
                            This will reset <strong>{teacher.name}</strong>'s login password to the default:
                        </p>
                        <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:8, padding:'10px 14px', textAlign:'center', fontSize:'1.1rem', fontFamily:'monospace', fontWeight:700, color:'#4338ca', letterSpacing:2, marginBottom:20 }}>
                            12345678
                        </div>
                        <p style={{ color:'#9ca3af', fontSize:'.78rem', marginBottom:24 }}>The teacher should change this after logging in.</p>
                        <div className="db-modal-actions">
                            <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                            <button onClick={handleReset} disabled={loading}
                                style={{ background:'#fe730c', color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontFamily:'Poppins,sans-serif', fontSize:'.88rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:7, opacity: loading ? .7 : 1 }}>
                                {loading ? <><i className="fas fa-circle-notch fa-spin"></i> Resetting…</> : <><i className="fas fa-redo-alt"></i> Reset Password</>}
                            </button>
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    );
}

/* ── Add / Edit Modal ── */
function TeacherModal({ teacher, schools, roles, onSave, onClose, token }) {
    const isEdit = !!teacher?.id;

    const [form, setForm] = useState({
        name:      teacher?.name      || '',
        school_id: teacher?.school_id || '',
        gender:    teacher?.gender    || '',
        phone:     teacher?.phone     || '',
        address:   teacher?.address   || '',
        status:        teacher?.status        || 'active',
        role_id:       teacher?.user?.role_id || '',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/teachers/${teacher.id}` : '/api/teachers';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    school_id:     form.school_id     || null,
                    gender:        form.gender        || null,
                    date_of_birth: form.date_of_birth || null,
                    role_id:       form.role_id       || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.teacher);
        } finally {
            setLoading(false);
        }
    };

    const sel = (name, children) => (
        <select name={name} value={form[name]} onChange={handle}
            style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.88rem', color:'#374151' }}>
            {children}
        </select>
    );

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()}
                style={{ maxWidth:640, position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
                <button onClick={onClose} style={{ position:'sticky', top:14, float:'right', marginRight:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3><i className={`fas fa-${isEdit ? 'user-edit' : 'user-plus'}`}></i> {isEdit ? 'Edit Teacher' : 'Add Teacher'}</h3>
                </div>

                <form onSubmit={submit} style={{ padding:'24px 28px 28px' }}>

                    {/* Auto-generate notice */}
                    {!isEdit && (
                        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'flex-start', gap:10 }}>
                            <i className="fas fa-info-circle" style={{ color:'#3b82f6', marginTop:2, flexShrink:0 }}></i>
                            <p style={{ margin:0, fontSize:'.8rem', color:'#1e40af', lineHeight:1.5 }}>
                                A <strong>staff number</strong> (TCHxxxx) will be auto-generated. Login email will be <strong>tchxxxx@tti.co.ke</strong> with default password <strong>12345678</strong>.
                            </p>
                        </div>
                    )}

                    {/* Edit info banner */}
                    {isEdit && teacher?.employee_number && (
                        <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', gap:20, flexWrap:'wrap' }}>
                            <div style={{ fontSize:'.78rem', color:'#64748b' }}>
                                <span style={{ fontWeight:700, color:'#374151' }}>Staff No: </span>
                                <span style={{ fontFamily:'monospace', fontWeight:600, color:'#4338ca' }}>{teacher.employee_number}</span>
                            </div>
                            <div style={{ fontSize:'.78rem', color:'#64748b' }}>
                                <span style={{ fontWeight:700, color:'#374151' }}>Login Email: </span>
                                <span style={{ fontFamily:'monospace', color:'#374151' }}>{teacher.email}</span>
                            </div>
                        </div>
                    )}

                    {/* Personal Details */}
                    <p style={{ fontSize:'.75rem', fontWeight:700, color:'#9ca3af', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:12 }}>Personal Details</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>Full Name <span style={{ color:'#dc2626' }}>*</span></label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-user"></i>
                                <input type="text" name="name" required placeholder="Teacher's full name" value={form.name} onChange={handle} />
                            </div>
                            {errors.name && <span className="profile-error">{errors.name[0]}</span>}
                        </div>

                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>School</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-school"></i>
                                {sel('school_id', [
                                    <option key="" value="">— Select School —</option>,
                                    ...schools.map(s => <option key={s.id} value={s.id}>{s.school_name}</option>)
                                ])}
                            </div>
                            {errors.school_id && <span className="profile-error">{errors.school_id[0]}</span>}
                        </div>

                        <div className="profile-field">
                            <label>Gender</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-venus-mars"></i>
                                {sel('gender', [
                                    <option key="" value="">— Select —</option>,
                                    <option key="male" value="male">Male</option>,
                                    <option key="female" value="female">Female</option>,
                                    <option key="other" value="other">Other</option>,
                                ])}
                            </div>
                        </div>

                        <div className="profile-field">
                            <label>Phone</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-phone"></i>
                                <input type="text" name="phone" placeholder="+254 700 000 000" value={form.phone} onChange={handle} />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label>Status</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                {sel('status', [
                                    <option key="active" value="active">Active</option>,
                                    <option key="inactive" value="inactive">Inactive</option>,
                                ])}
                            </div>
                        </div>

                        <div className="profile-field" style={{ gridColumn:'1/-1' }}>
                            <label>Address</label>
                            <div className="profile-input-wrap profile-textarea-wrap">
                                <i className="fas fa-map-marker-alt"></i>
                                <textarea name="address" rows={2} placeholder="Physical address…" value={form.address} onChange={handle} />
                            </div>
                        </div>
                    </div>

                    {/* System Access */}
                    <div style={{ borderTop:'1.5px dashed #e5e7eb', margin:'20px 0 16px' }}></div>
                    <p style={{ fontSize:'.75rem', fontWeight:700, color:'#9ca3af', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:12 }}>System Access</p>
                    <div className="profile-field">
                        <label>Assign Role</label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-user-shield"></i>
                            {sel('role_id', [
                                <option key="" value="">— No role —</option>,
                                ...roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                            ])}
                        </div>
                        {errors.role_id && <span className="profile-error">{errors.role_id[0]}</span>}
                    </div>

                    <div className="db-modal-actions" style={{ marginTop:24 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Update Teacher' : 'Add Teacher'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ teacher, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:440 }}>
                <div className="db-modal-header" style={{ background:'#fef2f2', borderBottom:'1px solid #fecaca' }}>
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-exclamation-triangle"></i> Delete Teacher</h3>
                </div>
                <div style={{ padding:'24px 28px 28px' }}>
                    <p style={{ color:'#374151', marginBottom:8 }}>
                        Are you sure you want to delete <strong>{teacher.name}</strong>?
                    </p>
                    {teacher.user_id && (
                        <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:'.83rem', color:'#92400e' }}>
                            <i className="fas fa-exclamation-circle" style={{ marginRight:6 }}></i>
                            This teacher has a login account which will also be <strong>permanently deleted</strong>.
                        </div>
                    )}
                    <p style={{ color:'#6b7280', fontSize:'.85rem', marginBottom:24 }}>This action cannot be undone.</p>
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
export default function Teachers() {
    const { user, token, can } = useAuth();

    const [teachers, setTeachers]         = useState([]);
    const [schools, setSchools]           = useState([]);
    const [roles, setRoles]               = useState([]);
    const [meta, setMeta]                 = useState({ total:0, last_page:1 });
    const [search, setSearch]             = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]                 = useState(1);
    const [perPage, setPerPageVal]        = useState(15);
    const [loading, setLoading]           = useState(true);
    const [toast, setToast]               = useState(null);

    const [addModal, setAddModal]           = useState(false);
    const [editTeacher, setEditTeacher]     = useState(null);
    const [resetTeacher, setResetTeacher]   = useState(null);
    const [deleteTeacher, setDeleteTeacher] = useState(null);
    const [deleting, setDeleting]           = useState(false);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    useEffect(() => {
        const h = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
        fetch('/api/schools?per_page=500', { headers: h })
            .then(r => r.json()).then(d => setSchools(d.data || [])).catch(() => {});
        fetch('/api/roles?per_page=200', { headers: h })
            .then(r => r.json()).then(d => setRoles(d.data || [])).catch(() => {});
    }, [token]);

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, per_page: perPage });
        if (search)       params.set('search', search);
        if (schoolFilter) params.set('school_id', schoolFilter);
        if (genderFilter) params.set('gender', genderFilter);
        if (statusFilter) params.set('status', statusFilter);
        fetch(`/api/teachers?${params}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
            .then(r => r.json())
            .then(d => { setTeachers(d.data || []); setMeta({ total: d.total || 0, last_page: d.last_page || 1 }); })
            .catch(() => setToast({ message: 'Failed to load teachers.', type: 'error' }))
            .finally(() => setLoading(false));
    }, [token, page, perPage, search, schoolFilter, genderFilter, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleSave = saved => {
        setTeachers(prev => {
            const idx = prev.findIndex(t => t.id === saved.id);
            return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev];
        });
        if (!editTeacher) setMeta(m => ({ ...m, total: m.total + 1 }));
        setAddModal(false);
        setEditTeacher(null);
        setToast({ message: editTeacher ? 'Teacher updated.' : 'Teacher added.', type: 'success' });
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/teachers/${deleteTeacher.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            setTeachers(prev => prev.filter(t => t.id !== deleteTeacher.id));
            setMeta(m => ({ ...m, total: m.total - 1 }));
            setDeleteTeacher(null);
            setToast({ message: 'Teacher deleted.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete.', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const from = meta.total === 0 ? 0 : (page - 1) * perPage + 1;
    const to   = Math.min(page * perPage, meta.total);

    const renderTableHeader = () => (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:10 }}>
            <div style={{ fontSize:'.82rem', color:'#9ca3af' }}>
                {meta.total === 0 ? 'No records found'
                    : <>Showing <strong style={{ color:'#374151' }}>{from}–{to}</strong> of <strong style={{ color:'#374151' }}>{meta.total}</strong> {meta.total === 1 ? 'teacher' : 'teachers'}</>
                }
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.82rem', color:'#9ca3af' }}>
                <span>Per page</span>
                <select value={perPage} onChange={e => { setPerPageVal(Number(e.target.value)); setPage(1); }}
                    style={{ border:'1.5px solid #e4e7f0', borderRadius:8, padding:'5px 10px', fontFamily:'Poppins,sans-serif', fontSize:'.82rem', color:'#374151', outline:'none', cursor:'pointer', background:'#fff' }}>
                    {[10,15,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
        </div>
    );

    const renderPageButtons = () => {
        if (meta.last_page <= 1) return null;
        const delta = 2;
        const rs    = Math.max(2, page - delta);
        const re    = Math.min(meta.last_page - 1, page + delta);
        const pages = [];
        if (meta.last_page >= 1) pages.push(1);
        if (rs > 2)   pages.push('…left');
        for (let p = rs; p <= re; p++) pages.push(p);
        if (re < meta.last_page - 1) pages.push('…right');
        if (meta.last_page > 1) pages.push(meta.last_page);
        return (
            <div className="db-pagination" style={{ justifyContent:'center', gap:4, paddingTop:16 }}>
                <button className="db-page-btn" disabled={page===1} onClick={() => setPage(1)}><i className="fas fa-angle-double-left"></i></button>
                <button className="db-page-btn" disabled={page===1} onClick={() => setPage(p => p-1)}><i className="fas fa-chevron-left"></i></button>
                {pages.map(p => typeof p === 'string'
                    ? <span key={p} className="db-page-btn" style={{ cursor:'default', opacity:.45, pointerEvents:'none' }}>…</span>
                    : <button key={p} className={`db-page-btn${p===page?' active':''}`} onClick={() => setPage(p)}>{p}</button>
                )}
                <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(p => p+1)}><i className="fas fa-chevron-right"></i></button>
                <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(meta.last_page)}><i className="fas fa-angle-double-right"></i></button>
            </div>
        );
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">

                <DashboardNavbar page="Teachers" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('teachers','view') && <AccessDenied />}
                    {can('teachers','view') && (<>

                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Teachers</h1>
                            <p className="db-page-sub">Manage teaching staff and their system login access</p>
                        </div>
                        {can('teachers','create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-user-plus"></i> Add Teacher
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('teachers','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                                <i className="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Teachers</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#11998e,#38ef7d)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{teachers.filter(t => t.status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#f093fb,#f5576c)' }}>
                                <i className="fas fa-key"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{teachers.filter(t => t.user_id).length}</div>
                                <div className="schools-stat-label">Have Login (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search name, staff no., email, subject…"
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <select className="db-filter-select" value={schoolFilter} onChange={e => { setSchoolFilter(e.target.value); setPage(1); }}>
                            <option value="">All Schools</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.school_name}</option>)}
                        </select>
                        <select className="db-filter-select" value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(1); }}>
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <select className="db-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Table */}
                    {!loading && renderTableHeader()}

                    {loading ? (
                        <div style={{ textAlign:'center', padding:'80px', color:'#9ca3af' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'2rem' }}></i>
                        </div>
                    ) : teachers.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'80px 20px', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(8,31,78,.06)' }}>
                            <i className="fas fa-chalkboard-teacher" style={{ fontSize:'3rem', color:'#d1d5db', marginBottom:16, display:'block' }}></i>
                            <p style={{ color:'#6b7280', fontSize:'1rem', fontWeight:600, margin:0 }}>No teachers found</p>
                            <p style={{ color:'#9ca3af', fontSize:'.85rem', marginTop:6 }}>
                                {search||schoolFilter||genderFilter||statusFilter ? 'Try adjusting your filters.' : 'Click "Add Teacher" to add the first teacher.'}
                            </p>
                        </div>
                    ) : (
                        <div className="db-table-wrap" style={{ overflowX:'auto' }}>
                            <table className="db-table" style={{ minWidth:760 }}>
                                <thead>
                                    <tr>
                                        <th style={{ width:36 }}>#</th>
                                        <th>Teacher</th>
                                        <th>School</th>
                                        <th>Contact</th>
                                        <th>Login</th>
                                        <th>Status</th>
                                        {(can('teachers','update')||can('teachers','delete')) && <th style={{ width:100 }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map((t, idx) => (
                                        <tr key={t.id}>
                                            <td style={{ color:'#9ca3af', fontSize:'.8rem' }}>
                                                {(page-1)*perPage+idx+1}
                                            </td>

                                            {/* Teacher: avatar + name + staff no + gender + email */}
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:36, height:36, borderRadius:'50%', background: t.gender==='female'?'#fdf2f8':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                        <i className="fas fa-chalkboard-teacher" style={{ color: t.gender==='female'?'#9333ea':'#2563eb', fontSize:'.82rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight:600, color:'#111827', fontSize:'.88rem', whiteSpace:'nowrap' }}>{t.name}</div>
                                                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2, flexWrap:'wrap' }}>
                                                            {t.employee_number && (
                                                                <span style={{ background:'#f3f4f6', color:'#6b7280', borderRadius:4, padding:'1px 6px', fontSize:'.7rem', fontWeight:600, fontFamily:'monospace' }}>
                                                                    {t.employee_number}
                                                                </span>
                                                            )}
                                                            {t.gender && (
                                                                <span style={{ ...GENDER_COLORS[t.gender], borderRadius:4, padding:'1px 6px', fontSize:'.7rem', fontWeight:600, textTransform:'capitalize' }}>
                                                                    {t.gender}
                                                                </span>
                                                            )}
                                                            {t.email && <span style={{ color:'#9ca3af', fontSize:'.71rem' }}>{t.email}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* School */}
                                            <td>
                                                {t.school
                                                    ? <span style={{ background:'#fff7ed', color:'#c2410c', padding:'3px 10px', borderRadius:4, fontSize:'.74rem', fontWeight:600, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4 }}>
                                                        <i className="fas fa-school" style={{ fontSize:'.68rem' }}></i>{t.school.school_name}
                                                      </span>
                                                    : <span style={{ color:'#d1d5db' }}>—</span>
                                                }
                                            </td>

                                            {/* Phone */}
                                            <td style={{ color:'#374151', fontSize:'.82rem' }}>
                                                {t.phone
                                                    ? <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                                        <i className="fas fa-phone" style={{ color:'#9ca3af', fontSize:'.68rem' }}></i>{t.phone}
                                                      </div>
                                                    : <span style={{ color:'#d1d5db' }}>—</span>
                                                }
                                            </td>

                                            {/* Login */}
                                            <td>
                                                {t.user_id ? (
                                                    <div>
                                                        <span style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', padding:'3px 10px', borderRadius:20, fontSize:'.73rem', fontWeight:600, whiteSpace:'nowrap' }}>
                                                            <i className="fas fa-check-circle" style={{ marginRight:4 }}></i>Active
                                                        </span>
                                                        {t.user?.role && <div style={{ color:'#9ca3af', fontSize:'.71rem', marginTop:3 }}>{t.user.role.name}</div>}
                                                    </div>
                                                ) : (
                                                    <span style={{ background:'#f9fafb', color:'#9ca3af', border:'1px solid #e5e7eb', padding:'3px 10px', borderRadius:20, fontSize:'.73rem', fontWeight:600, whiteSpace:'nowrap' }}>
                                                        <i className="fas fa-times-circle" style={{ marginRight:4 }}></i>None
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className={`db-status-badge ${t.status==='active'?'db-status-active':'db-status-inactive'}`}>
                                                    <i className={`fas fa-${t.status==='active'?'check-circle':'times-circle'}`}></i>
                                                    {t.status==='active'?'Active':'Inactive'}
                                                </span>
                                            </td>

                                            {(can('teachers','update')||can('teachers','delete')) && (
                                                <td>
                                                    <div className="db-action-btns">
                                                        {can('teachers','update') && (
                                                            <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditTeacher(t)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        )}
                                                        {can('teachers','update') && t.user_id && (
                                                            <button className="db-action-btn" title="Reset Password"
                                                                onClick={() => setResetTeacher(t)}
                                                                style={{ background:'#fffbeb', color:'#d97706', border:'1px solid #fde68a' }}>
                                                                <i className="fas fa-key"></i>
                                                            </button>
                                                        )}
                                                        {can('teachers','delete') && (
                                                            <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteTeacher(t)}>
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {renderPageButtons()}
                    </>)}
                </div>
            </div>

            {addModal      && <TeacherModal schools={schools} roles={roles} onSave={handleSave} onClose={() => setAddModal(false)} token={token} />}
            {editTeacher   && <TeacherModal teacher={editTeacher} schools={schools} roles={roles} onSave={handleSave} onClose={() => setEditTeacher(null)} token={token} />}
            {resetTeacher  && <ResetPasswordModal teacher={resetTeacher} token={token} onClose={() => setResetTeacher(null)} onDone={msg => { setResetTeacher(null); setToast({ message: msg, type: 'success' }); }} />}
            {deleteTeacher && <DeleteModal teacher={deleteTeacher} onConfirm={handleDelete} onClose={() => setDeleteTeacher(null)} loading={deleting} />}
        </div>
    );
}
