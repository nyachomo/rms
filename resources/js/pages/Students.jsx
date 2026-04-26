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

const GENDER_COLORS = {
    male:   { bg:'#eff6ff', color:'#2563eb' },
    female: { bg:'#fdf2f8', color:'#9333ea' },
    other:  { bg:'#f0fdf4', color:'#16a34a' },
};

/* ── Reset Password Modal ── */
function ResetPasswordModal({ student, onClose, onDone, token }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone]       = useState(false);

    const handleReset = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/students/${student.id}/reset-password`, {
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

                    {/* Student info */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, background:'#f8fafc', borderRadius:10, padding:'12px 14px', marginBottom:20 }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background: student.gender==='female'?'#fdf2f8':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <i className="fas fa-user" style={{ color: student.gender==='female'?'#9333ea':'#2563eb', fontSize:'.85rem' }}></i>
                        </div>
                        <div>
                            <div style={{ fontWeight:600, color:'#111827', fontSize:'.9rem' }}>{student.name}</div>
                            <div style={{ color:'#9ca3af', fontSize:'.75rem' }}>{student.email}</div>
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
                            This will reset <strong>{student.name}</strong>'s login password to the default:
                        </p>
                        <div style={{ background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:8, padding:'10px 14px', textAlign:'center', fontSize:'1.1rem', fontFamily:'monospace', fontWeight:700, color:'#4338ca', letterSpacing:2, marginBottom:20 }}>
                            12345678
                        </div>
                        <p style={{ color:'#9ca3af', fontSize:'.78rem', marginBottom:24 }}>
                            The student should change this password after logging in.
                        </p>
                        <div className="db-modal-actions">
                            <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                            <button onClick={handleReset} disabled={loading}
                                style={{ background:'#fe730c', color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontFamily:'Poppins,sans-serif', fontSize:'.88rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:7, opacity: loading ? .7 : 1 }}>
                                {loading
                                    ? <><i className="fas fa-circle-notch fa-spin"></i> Resetting…</>
                                    : <><i className="fas fa-redo-alt"></i> Reset Password</>
                                }
                            </button>
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    );
}

/* ── Section divider ── */
const SectionHead = ({ icon, label }) => (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'22px 0 14px' }}>
        <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#081f4e,#1e3a8a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className={icon} style={{ color:'#fff', fontSize:'.65rem' }}></i>
        </div>
        <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.73rem', color:'#374151', letterSpacing:'.07em', textTransform:'uppercase' }}>{label}</span>
        <div style={{ flex:1, height:1, background:'linear-gradient(90deg,#e2e8f0,transparent)' }}></div>
    </div>
);

/* ── Styled label ── */
const FLabel = ({ children }) => (
    <label style={{ display:'block', fontSize:'.73rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'Poppins,sans-serif', marginBottom:5 }}>
        {children}
    </label>
);

/* ── Add / Edit Modal ── */
function StudentModal({ student, schools, classes, roles, programEvents, onSave, onClose, token, currentUser }) {
    const isEdit = !!student?.id;

    const [form, setForm] = useState({
        name:             student?.name             || '',
        school_id:        student?.school_id        || '',
        class_id:         student?.class_id         || '',
        gender:           student?.gender           || '',
        date_of_birth:    student?.date_of_birth    || '',
        phone:            student?.phone            || '',
        parent_phone:     student?.parent_phone     || '',
        address:          student?.address          || '',
        status:           student?.status           || 'active',
        role_id:          student?.user?.role_id    || '',
        program_event_id: student?.program_event_id || '',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/students/${student.id}` : '/api/students';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    school_id:        form.school_id        || null,
                    class_id:         form.class_id         || null,
                    gender:           form.gender           || null,
                    date_of_birth:    form.date_of_birth    || null,
                    role_id:          form.role_id          || null,
                    program_event_id: form.program_event_id || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.student);
        } finally {
            setLoading(false);
        }
    };

    const Sel = ({ name, children }) => (
        <div className="profile-input-wrap">
            <select name={name} value={form[name]} onChange={handle}
                style={{ border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.88rem', color: form[name] ? '#081f4e' : '#9ca3af' }}>
                {children}
            </select>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth:660, maxHeight:'92vh', overflowY:'auto' }}>

                {/* ── Header ── */}
                <div className="modal-header">
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className={`fas fa-${isEdit ? 'user-edit' : 'user-plus'}`} style={{ color:'#fff', fontSize:'.95rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ color:'#fff', fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.05rem', margin:0 }}>
                                {isEdit ? 'Edit Student' : 'Add Student'}
                            </h3>
                            <p style={{ color:'rgba(255,255,255,.6)', fontSize:'.75rem', margin:0, fontFamily:'Poppins,sans-serif' }}>
                                {isEdit ? 'Update student information' : 'Enrol a new student'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'.9rem', flexShrink:0 }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">

                    {/* ── Auto-generated info (add only) ── */}
                    {!isEdit && (
                        <div style={{ background:'linear-gradient(135deg,#eff6ff,#e0f2fe)', border:'1px solid #bfdbfe', borderRadius:12, padding:'12px 16px', marginBottom:6, display:'flex', alignItems:'flex-start', gap:10 }}>
                            <div style={{ width:30, height:30, borderRadius:8, background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <i className="fas fa-info" style={{ color:'#fff', fontSize:'.72rem' }}></i>
                            </div>
                            <p style={{ margin:0, fontSize:'.8rem', color:'#1e40af', lineHeight:1.6, fontFamily:'Poppins,sans-serif' }}>
                                A <strong>4-digit admission number</strong> will be auto-generated. Login email: <strong>admno@tti.co.ke</strong> · default password: <code style={{ background:'#dbeafe', padding:'1px 6px', borderRadius:4 }}>12345678</code>
                            </p>
                        </div>
                    )}

                    {/* ── Admission info (edit only) ── */}
                    {isEdit && student?.admission_number && (
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                            <span style={{ background:'#eef2ff', color:'#4338ca', border:'1px solid #c7d2fe', borderRadius:8, padding:'6px 14px', fontSize:'.78rem', fontFamily:'Poppins,sans-serif', fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
                                <i className="fas fa-id-badge"></i> Adm. {student.admission_number}
                            </span>
                            <span style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', borderRadius:8, padding:'6px 14px', fontSize:'.78rem', fontFamily:'Poppins,sans-serif', fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
                                <i className="fas fa-envelope"></i> {student.email}
                            </span>
                        </div>
                    )}

                    <form onSubmit={submit}>

                        {/* ══ Personal Details ══ */}
                        <SectionHead icon="fas fa-user" label="Personal Details" />
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

                            <div style={{ gridColumn:'1/-1' }}>
                                <FLabel>Full Name <span style={{ color:'#ef4444' }}>*</span></FLabel>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-user"></i>
                                    <input type="text" name="name" required placeholder="Student full name" value={form.name} onChange={handle} />
                                </div>
                                {errors.name && <span className="profile-error">{errors.name[0]}</span>}
                            </div>

                            <div style={{ gridColumn:'1/-1' }}>
                                <FLabel>School <span style={{ color:'#ef4444' }}>*</span></FLabel>
                                <Sel name="school_id">
                                    <option value="">— Select School —</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.school_name}</option>)}
                                </Sel>
                                {errors.school_id && <span className="profile-error">{errors.school_id[0]}</span>}
                            </div>

                            <div style={{ gridColumn:'1/-1' }}>
                                <FLabel>Program Event</FLabel>
                                <Sel name="program_event_id">
                                    <option value="">— No Program Event —</option>
                                    {programEvents.map(pe => <option key={pe.id} value={pe.id}>{pe.program_event_name}</option>)}
                                </Sel>
                                {errors.program_event_id && <span className="profile-error">{errors.program_event_id[0]}</span>}
                            </div>

                            <div>
                                <FLabel>Class</FLabel>
                                <Sel name="class_id">
                                    <option value="">— Select Class —</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Sel>
                                {errors.class_id && <span className="profile-error">{errors.class_id[0]}</span>}
                            </div>

                            <div>
                                <FLabel>Gender</FLabel>
                                <Sel name="gender">
                                    <option value="">— Select —</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Sel>
                            </div>

                            <div>
                                <FLabel>Date of Birth</FLabel>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-calendar-alt"></i>
                                    <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handle} />
                                </div>
                            </div>

                            <div>
                                <FLabel>Status</FLabel>
                                <Sel name="status">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </Sel>
                            </div>

                        </div>

                        {/* ══ Contact ══ */}
                        <SectionHead icon="fas fa-phone-alt" label="Contact Information" />
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

                            <div>
                                <FLabel>Phone</FLabel>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-phone"></i>
                                    <input type="text" name="phone" placeholder="+254 700 000 000" value={form.phone} onChange={handle} />
                                </div>
                            </div>

                            <div>
                                <FLabel>Parent / Guardian Phone</FLabel>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-phone-alt"></i>
                                    <input type="text" name="parent_phone" placeholder="+254 700 000 000" value={form.parent_phone} onChange={handle} />
                                </div>
                                {errors.parent_phone && <span className="profile-error">{errors.parent_phone[0]}</span>}
                            </div>

                            <div style={{ gridColumn:'1/-1' }}>
                                <FLabel>Physical Address</FLabel>
                                <RichTextEditor
                                    value={form.address}
                                    onChange={v => set('address', v)}
                                    placeholder="Enter physical address or any relevant location notes…"
                                    minHeight={90}
                                />
                            </div>

                        </div>

                        {/* ══ System Access ══ */}
                        <SectionHead icon="fas fa-user-shield" label="System Access" />
                        <div>
                            <FLabel>Assign Role</FLabel>
                            <Sel name="role_id">
                                <option value="">— No role —</option>
                                {(currentUser?.role?.name?.toLowerCase() === 'teacher'
                                    ? roles.filter(r => r.name.toLowerCase() === 'student')
                                    : roles
                                ).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </Sel>
                            {errors.role_id && <span className="profile-error">{errors.role_id[0]}</span>}
                        </div>

                        <div className="modal-footer" style={{ marginTop:24, paddingTop:18, borderTop:'1px solid #f0f2f8' }}>
                            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-modal-save" disabled={loading}>
                                {loading
                                    ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                    : <><i className={`fas fa-${isEdit ? 'save' : 'user-plus'}`}></i> {isEdit ? 'Update Student' : 'Add Student'}</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ student, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:440 }}>
                <div className="db-modal-header" style={{ background:'#fef2f2', borderBottom:'1px solid #fecaca' }}>
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-exclamation-triangle"></i> Delete Student</h3>
                </div>
                <div style={{ padding:'24px 28px 28px' }}>
                    <p style={{ color:'#374151', marginBottom:8 }}>
                        Are you sure you want to delete <strong>{student.name}</strong>?
                    </p>
                    {student.user_id && (
                        <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:'.83rem', color:'#92400e' }}>
                            <i className="fas fa-exclamation-circle" style={{ marginRight:6 }}></i>
                            This student has a login account which will also be <strong>permanently deleted</strong>.
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
export default function Students() {
    const { user, token, can } = useAuth();

    const [students, setStudents]         = useState([]);
    const [schools, setSchools]           = useState([]);
    const [classes, setClasses]           = useState([]);
    const [roles, setRoles]               = useState([]);
    const [programEvents, setProgramEvents] = useState([]);
    const [meta, setMeta]                 = useState({ total: 0, last_page: 1 });
    const [search, setSearch]             = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    const [classFilter, setClassFilter]   = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]                 = useState(1);
    const [perPage, setPerPageVal]        = useState(15);
    const [loading, setLoading]           = useState(true);
    const [toast, setToast]               = useState(null);

    const [addModal, setAddModal]             = useState(false);
    const [editStudent, setEditStudent]       = useState(null);
    const [resetStudent, setResetStudent]     = useState(null);
    const [deleteStudent, setDeleteStudent]   = useState(null);
    const [deleting, setDeleting]             = useState(false);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    /* Load dropdowns once */
    useEffect(() => {
        const h = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
        fetch('/api/schools?per_page=500', { headers: h })
            .then(r => r.json()).then(d => setSchools(d.data || [])).catch(() => {});
        fetch('/api/classes/all', { headers: h })
            .then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : [])).catch(() => {});
        fetch('/api/roles?per_page=200', { headers: h })
            .then(r => r.json()).then(d => setRoles(d.data || [])).catch(() => {});
        fetch('/api/program-events/all', { headers: h })
            .then(r => r.json()).then(d => setProgramEvents(Array.isArray(d) ? d : [])).catch(() => {});
    }, [token]);

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, per_page: perPage });
        if (search)        params.set('search', search);
        if (schoolFilter)  params.set('school_id', schoolFilter);
        if (classFilter)   params.set('class_id', classFilter);
        if (genderFilter)  params.set('gender', genderFilter);
        if (statusFilter)  params.set('status', statusFilter);
        fetch(`/api/students?${params}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
            .then(r => r.json())
            .then(d => { setStudents(d.data || []); setMeta({ total: d.total || 0, last_page: d.last_page || 1 }); })
            .catch(() => setToast({ message: 'Failed to load students.', type: 'error' }))
            .finally(() => setLoading(false));
    }, [token, page, perPage, search, schoolFilter, classFilter, genderFilter, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleSave = saved => {
        setStudents(prev => {
            const idx = prev.findIndex(s => s.id === saved.id);
            return idx >= 0 ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev];
        });
        if (!editStudent) setMeta(m => ({ ...m, total: m.total + 1 }));
        setAddModal(false);
        setEditStudent(null);
        setToast({ message: editStudent ? 'Student updated.' : 'Student added.', type: 'success' });
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`/api/students/${deleteStudent.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            setStudents(prev => prev.filter(s => s.id !== deleteStudent.id));
            setMeta(m => ({ ...m, total: m.total - 1 }));
            setDeleteStudent(null);
            setToast({ message: 'Student deleted.', type: 'success' });
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
                    : <>Showing <strong style={{ color:'#374151' }}>{from}–{to}</strong> of <strong style={{ color:'#374151' }}>{meta.total}</strong> {meta.total === 1 ? 'student' : 'students'}</>
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
                <button className="db-page-btn" disabled={page===1} onClick={() => setPage(1)} title="First"><i className="fas fa-angle-double-left"></i></button>
                <button className="db-page-btn" disabled={page===1} onClick={() => setPage(p => p-1)} title="Previous"><i className="fas fa-chevron-left"></i></button>
                {pages.map(p => typeof p === 'string'
                    ? <span key={p} className="db-page-btn" style={{ cursor:'default', opacity:.45, pointerEvents:'none' }}>…</span>
                    : <button key={p} className={`db-page-btn${p===page?' active':''}`} onClick={() => setPage(p)}>{p}</button>
                )}
                <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(p => p+1)} title="Next"><i className="fas fa-chevron-right"></i></button>
                <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(meta.last_page)} title="Last"><i className="fas fa-angle-double-right"></i></button>
            </div>
        );
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">

                <DashboardNavbar page="Students" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('students','view') && <AccessDenied />}
                    {can('students','view') && (<>

                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Students</h1>
                            <p className="db-page-sub">Manage enrolled students and their system login access</p>
                        </div>
                        {can('students','create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-user-plus"></i> Add Student
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('students','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
                                <i className="fas fa-user-graduate"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Students</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#11998e,#38ef7d)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{students.filter(s => s.status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#f093fb,#f5576c)' }}>
                                <i className="fas fa-key"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{students.filter(s => s.user_id).length}</div>
                                <div className="schools-stat-label">Have Login (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search by name, admission no., email…"
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <select className="db-filter-select" value={schoolFilter} onChange={e => { setSchoolFilter(e.target.value); setPage(1); }}>
                            <option value="">All Schools</option>
                            {schools.map(s => <option key={s.id} value={s.id}>{s.school_name}</option>)}
                        </select>
                        <select className="db-filter-select" value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}>
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                    ) : students.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'80px 20px', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(8,31,78,.06)' }}>
                            <i className="fas fa-user-graduate" style={{ fontSize:'3rem', color:'#d1d5db', marginBottom:16, display:'block' }}></i>
                            <p style={{ color:'#6b7280', fontSize:'1rem', fontWeight:600, margin:0 }}>No students found</p>
                            <p style={{ color:'#9ca3af', fontSize:'.85rem', marginTop:6 }}>
                                {search||classFilter||genderFilter||statusFilter ? 'Try adjusting your filters.' : 'Click "Add Student" to enrol the first student.'}
                            </p>
                        </div>
                    ) : (
                        <div className="db-table-wrap" style={{ overflowX:'auto' }}>
                            <table className="db-table" style={{ minWidth:780 }}>
                                <thead>
                                    <tr>
                                        <th style={{ width:36 }}>#</th>
                                        <th>Student</th>
                                        <th>School / Class</th>
                                        <th>Contact</th>
                                        <th>Login</th>
                                        <th>Status</th>
                                        {(can('students','update')||can('students','delete')) && <th style={{ width:90 }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, idx) => (
                                        <tr key={s.id}>
                                            {/* # */}
                                            <td style={{ color:'#9ca3af', fontSize:'.8rem' }}>
                                                {(page-1)*perPage+idx+1}
                                            </td>

                                            {/* Student: avatar + name + email + adm + gender */}
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:36, height:36, borderRadius:'50%', background: s.gender==='female'?'#fdf2f8':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                        <i className="fas fa-user" style={{ color: s.gender==='female'?'#9333ea':'#2563eb', fontSize:'.82rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight:600, color:'#111827', fontSize:'.88rem', whiteSpace:'nowrap' }}>{s.name}</div>
                                                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2, flexWrap:'wrap' }}>
                                                            {s.admission_number && (
                                                                <span style={{ background:'#f3f4f6', color:'#6b7280', borderRadius:4, padding:'1px 6px', fontSize:'.7rem', fontWeight:600, fontFamily:'monospace' }}>
                                                                    {s.admission_number}
                                                                </span>
                                                            )}
                                                            {s.gender && (
                                                                <span style={{ ...GENDER_COLORS[s.gender], borderRadius:4, padding:'1px 6px', fontSize:'.7rem', fontWeight:600, textTransform:'capitalize' }}>
                                                                    {s.gender}
                                                                </span>
                                                            )}
                                                            {s.email && <span style={{ color:'#9ca3af', fontSize:'.71rem' }}>{s.email}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* School + Class stacked */}
                                            <td>
                                                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                                    {s.school
                                                        ? <span style={{ background:'#fff7ed', color:'#c2410c', padding:'2px 8px', borderRadius:4, fontSize:'.74rem', fontWeight:600, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4 }}>
                                                            <i className="fas fa-school" style={{ fontSize:'.68rem' }}></i>{s.school.school_name}
                                                          </span>
                                                        : <span style={{ color:'#d1d5db', fontSize:'.74rem' }}>No school</span>
                                                    }
                                                    {s.school_class
                                                        ? <span style={{ background:'#eef2ff', color:'#4338ca', padding:'2px 8px', borderRadius:4, fontSize:'.74rem', fontWeight:600, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4 }}>
                                                            <i className="fas fa-chalkboard" style={{ fontSize:'.68rem' }}></i>{s.school_class.name}
                                                          </span>
                                                        : <span style={{ color:'#d1d5db', fontSize:'.74rem' }}>No class</span>
                                                    }
                                                </div>
                                            </td>

                                            {/* Phone + Parent Phone stacked */}
                                            <td>
                                                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                                                    <div style={{ fontSize:'.8rem', color:'#374151', display:'flex', alignItems:'center', gap:5 }}>
                                                        <i className="fas fa-phone" style={{ color:'#9ca3af', fontSize:'.68rem', width:10 }}></i>
                                                        {s.phone || <span style={{ color:'#d1d5db' }}>—</span>}
                                                    </div>
                                                    <div style={{ fontSize:'.8rem', color:'#6b7280', display:'flex', alignItems:'center', gap:5 }}>
                                                        <i className="fas fa-phone-alt" style={{ color:'#9ca3af', fontSize:'.68rem', width:10 }}></i>
                                                        {s.parent_phone
                                                            ? <span>{s.parent_phone}<span style={{ fontSize:'.68rem', color:'#9ca3af', marginLeft:3 }}>(parent)</span></span>
                                                            : <span style={{ color:'#d1d5db' }}>—</span>
                                                        }
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Login */}
                                            <td>
                                                {s.user_id ? (
                                                    <div>
                                                        <span style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', padding:'3px 10px', borderRadius:20, fontSize:'.73rem', fontWeight:600, whiteSpace:'nowrap' }}>
                                                            <i className="fas fa-check-circle" style={{ marginRight:4 }}></i>Active
                                                        </span>
                                                        {s.user?.role && <div style={{ color:'#9ca3af', fontSize:'.71rem', marginTop:3 }}>{s.user.role.name}</div>}
                                                    </div>
                                                ) : (
                                                    <span style={{ background:'#f9fafb', color:'#9ca3af', border:'1px solid #e5e7eb', padding:'3px 10px', borderRadius:20, fontSize:'.73rem', fontWeight:600, whiteSpace:'nowrap' }}>
                                                        <i className="fas fa-times-circle" style={{ marginRight:4 }}></i>None
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className={`db-status-badge ${s.status==='active'?'db-status-active':'db-status-inactive'}`}>
                                                    <i className={`fas fa-${s.status==='active'?'check-circle':'times-circle'}`}></i>
                                                    {s.status==='active'?'Active':'Inactive'}
                                                </span>
                                            </td>
                                            {(can('students','update')||can('students','delete')) && (
                                                <td>
                                                    <div className="db-action-btns">
                                                        {can('students','update') && (
                                                            <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditStudent(s)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        )}
                                                        {can('students','update') && s.user_id && (
                                                            <button className="db-action-btn" title="Reset Password"
                                                                onClick={() => setResetStudent(s)}
                                                                style={{ background:'#fffbeb', color:'#d97706', border:'1px solid #fde68a' }}>
                                                                <i className="fas fa-key"></i>
                                                            </button>
                                                        )}
                                                        {can('students','delete') && (
                                                            <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteStudent(s)}>
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

            {addModal      && <StudentModal schools={schools} classes={classes} roles={roles} programEvents={programEvents} onSave={handleSave} onClose={() => setAddModal(false)} token={token} currentUser={user} />}
            {editStudent   && <StudentModal student={editStudent} schools={schools} classes={classes} roles={roles} programEvents={programEvents} onSave={handleSave} onClose={() => setEditStudent(null)} token={token} currentUser={user} />}
            {resetStudent  && <ResetPasswordModal student={resetStudent} token={token} onClose={() => setResetStudent(null)} onDone={msg => { setResetStudent(null); setToast({ message: msg, type: 'success' }); }} />}
            {deleteStudent && <DeleteModal student={deleteStudent} onConfirm={handleDelete} onClose={() => setDeleteStudent(null)} loading={deleting} />}
        </div>
    );
}
