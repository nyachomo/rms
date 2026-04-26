import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';

const STATUS = {
    pending:  { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  border: 'rgba(245,158,11,.3)',  icon: 'fas fa-clock',        gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    approved: { label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,.12)',  border: 'rgba(16,185,129,.3)',  icon: 'fas fa-check-circle', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.3)',   icon: 'fas fa-times-circle', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
};

const TRACKS = ['Web & App Development','Cybersecurity','Data & AI Literacy','Digital Marketing','UI/UX & Design Thinking','Tech Entrepreneurship'];

const fmt = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

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

function StatusBadge({ status }) {
    const s = STATUS[status] ?? STATUS.pending;
    return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:20, fontSize:'.72rem', fontWeight:700, fontFamily:'Poppins,sans-serif', background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>
            <i className={s.icon} style={{ fontSize:'.62rem' }}></i> {s.label}
        </span>
    );
}

/* ── Detail Modal ── */
function DetailModal({ reg, onSave, onClose, token, canUpdate }) {
    const [status, setStatus] = useState(reg.status);
    const [saving, setSaving] = useState(false);

    const submit = async () => {
        if (status === reg.status) { onClose(); return; }
        setSaving(true);
        try {
            const res  = await fetch(`/api/ict-club/registrations/${reg.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type':'application/json', Accept:'application/json', Authorization:`Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            onSave(data.registration);
        } catch (e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const InfoRow = ({ icon, label, value, color='#64748b' }) => value ? (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={icon} style={{ color, fontSize:'.7rem' }}></i>
            </div>
            <div>
                <div style={{ fontSize:'.68rem', color:'#94a3b8', fontFamily:'Poppins,sans-serif', fontWeight:700, textTransform:'uppercase', letterSpacing:'.4px', marginBottom:1 }}>{label}</div>
                <div style={{ fontSize:'.85rem', color:'#1e293b', fontWeight:600, fontFamily:'Poppins,sans-serif' }}>{value}</div>
            </div>
        </div>
    ) : null;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth:540 }}>
                <div className="modal-header">
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:46, height:46, borderRadius:13, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className="fas fa-laptop-code" style={{ color:'#fff', fontSize:'1.1rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ margin:0, fontSize:'1rem', fontWeight:800, fontFamily:'Poppins,sans-serif' }}>ICT Club Registration</h3>
                            <p style={{ margin:0, fontSize:'.73rem', color:'rgba(255,255,255,.55)', fontFamily:'Poppins,sans-serif' }}>#{reg.id} · Submitted {fmt(reg.created_at)}</p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>

                <div className="modal-body" style={{ padding:'22px 24px', maxHeight:'65vh', overflowY:'auto' }}>
                    {/* Track banner */}
                    <div style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius:14, padding:'16px 20px', marginBottom:20, color:'#fff' }}>
                        <div style={{ fontSize:'.68rem', color:'rgba(255,255,255,.6)', fontFamily:'Poppins,sans-serif', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>
                            <i className="fas fa-code-branch" style={{ marginRight:5 }}></i>Learning Track
                        </div>
                        <div style={{ fontWeight:800, fontSize:'.98rem', fontFamily:'Poppins,sans-serif' }}>{reg.track}</div>
                        <div style={{ marginTop:10 }}><StatusBadge status={reg.status} /></div>
                    </div>

                    {/* Applicant */}
                    <div style={{ marginBottom:18 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                            <div style={{ width:3, height:14, borderRadius:2, background:'linear-gradient(135deg,#0d9488,#14b8a6)' }}></div>
                            <span style={{ fontSize:'.72rem', fontWeight:800, color:'#1e293b', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'Poppins,sans-serif' }}>Member Information</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', background:'#f0fdfa', borderRadius:12, marginBottom:10, border:'1px solid #ccfbf1' }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <span style={{ color:'#fff', fontWeight:900, fontSize:'.82rem', fontFamily:'Poppins,sans-serif' }}>
                                    {reg.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                                </span>
                            </div>
                            <div>
                                <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, color:'#0d9488', fontSize:'.95rem' }}>{reg.name}</div>
                                <div style={{ fontSize:'.75rem', color:'#64748b', fontFamily:'Poppins,sans-serif' }}>{reg.email}</div>
                            </div>
                        </div>
                        <InfoRow icon="fas fa-phone"           label="Phone"          value={reg.phone}  color="#3b82f6" />
                        <InfoRow icon="fas fa-university"      label="School/Inst."   value={reg.school} color="#8b5cf6" />
                    </div>

                    {/* Why */}
                    {reg.why && (
                        <div style={{ marginBottom:18, background:'#f8faff', border:'1px solid #e8eaf0', borderRadius:12, padding:'14px 16px' }}>
                            <div style={{ fontSize:'.7rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'Poppins,sans-serif', marginBottom:8 }}>Why they want to join</div>
                            <p style={{ margin:0, color:'#475569', fontSize:'.85rem', fontFamily:'Poppins,sans-serif', lineHeight:1.6 }}>{reg.why}</p>
                        </div>
                    )}

                    {/* Status update */}
                    {canUpdate && (
                        <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                                <div style={{ width:3, height:14, borderRadius:2, background:'linear-gradient(135deg,#fe730c,#f97316)' }}></div>
                                <span style={{ fontSize:'.72rem', fontWeight:800, color:'#1e293b', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'Poppins,sans-serif' }}>Update Status</span>
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                                {['pending','approved','rejected'].map(s => {
                                    const cfg = STATUS[s]; const active = status === s;
                                    return (
                                        <button key={s} onClick={() => setStatus(s)} style={{ padding:'12px 8px', borderRadius:12, border:`2px solid ${active ? cfg.color : '#e8eaf0'}`, background:active ? cfg.bg : '#fff', color:active ? cfg.color : '#94a3b8', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.77rem', cursor:'pointer', transition:'all .2s', display:'flex', flexDirection:'column', alignItems:'center', gap:6, boxShadow:active ? `0 4px 12px ${cfg.color}25` : 'none' }}>
                                            <div style={{ width:32, height:32, borderRadius:9, background:active ? cfg.gradient : '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                                                <i className={cfg.icon} style={{ color:active ? '#fff' : '#cbd5e1', fontSize:'.82rem' }}></i>
                                            </div>
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:10, background:'#fafbff' }}>
                    <button className="btn-modal-cancel" onClick={onClose}>Close</button>
                    {canUpdate && (
                        <button className="btn-modal-save" onClick={submit} disabled={saving}>
                            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save Status</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ reg, onConfirm, onClose, saving }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth:420 }}>
                <div className="modal-header" style={{ background:'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:42, height:42, borderRadius:11, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className="fas fa-trash-alt" style={{ color:'#fff' }}></i>
                        </div>
                        <div>
                            <h3 style={{ margin:0, color:'#fff', fontSize:'.95rem', fontWeight:800, fontFamily:'Poppins,sans-serif' }}>Delete Registration</h3>
                            <p style={{ margin:0, fontSize:'.72rem', color:'rgba(255,255,255,.6)', fontFamily:'Poppins,sans-serif' }}>This action is irreversible</p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body" style={{ padding:24 }}>
                    <div style={{ display:'flex', gap:14, alignItems:'flex-start', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'14px 16px' }}>
                        <i className="fas fa-exclamation-triangle" style={{ color:'#ef4444', marginTop:2, flexShrink:0 }}></i>
                        <p style={{ margin:0, color:'#7f1d1d', fontFamily:'Poppins,sans-serif', fontSize:'.86rem', lineHeight:1.6 }}>
                            Permanently delete the ICT Club registration for <strong>{reg.name}</strong>? This cannot be undone.
                        </p>
                    </div>
                </div>
                <div style={{ padding:'14px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:10, background:'#fafbff' }}>
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" style={{ background:'linear-gradient(135deg,#dc2626,#b91c1c)' }} onClick={onConfirm} disabled={saving}>
                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash-alt"></i> Delete</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function AdminIctClub() {
    const { token, can } = useAuth();
    if (!can('ict_club', 'view')) return <AccessDenied />;

    const [regs,       setRegs]       = useState([]);
    const [meta,       setMeta]       = useState({});
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState('');
    const [statusF,    setStatusF]    = useState('');
    const [trackF,     setTrackF]     = useState('');
    const [page,       setPage]       = useState(1);
    const [perPage,    setPerPage]    = useState(15);
    const [detail,     setDetail]     = useState(null);
    const [delTarget,  setDelTarget]  = useState(null);
    const [delSaving,  setDelSaving]  = useState(false);
    const [toast,      setToast]      = useState({ message:'', type:'' });

    const notify = (message, type='success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message:'', type:'' }), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, per_page:perPage });
            if (search)  params.set('search', search);
            if (statusF) params.set('status', statusF);
            if (trackF)  params.set('track',  trackF);
            const res  = await fetch(`/api/ict-club/registrations?${params}`, { headers:{ Accept:'application/json', Authorization:`Bearer ${token}` } });
            const data = await res.json();
            setRegs(data.data ?? []);
            setMeta({ total:data.total, lastPage:data.last_page, from:data.from, to:data.to });
        } finally { setLoading(false); }
    }, [token, page, perPage, search, statusF, trackF]);

    useEffect(() => { load(); }, [load]);

    const handleStatusSave = updated => {
        setRegs(list => list.map(r => r.id === updated.id ? { ...r, ...updated } : r));
        setDetail(prev => prev ? { ...prev, ...updated } : null);
        notify('Status updated successfully');
    };

    const confirmDelete = async () => {
        setDelSaving(true);
        try {
            await fetch(`/api/ict-club/registrations/${delTarget.id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
            setRegs(list => list.filter(r => r.id !== delTarget.id));
            setDelTarget(null);
            notify('Registration deleted');
        } catch { notify('Delete failed', 'error'); }
        finally { setDelSaving(false); }
    };

    const counts = { pending:0, approved:0, rejected:0 };
    regs.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

    const statCards = [
        { label:'Total Members',    value:meta.total ?? 0, color:'#0d9488', icon:'fas fa-users',        gradient:'linear-gradient(135deg,#0d9488,#14b8a6)' },
        { label:'Pending Review',   value:counts.pending,  color:'#d97706', icon:'fas fa-hourglass-half',gradient:'linear-gradient(135deg,#f59e0b,#d97706)' },
        { label:'Approved',         value:counts.approved, color:'#059669', icon:'fas fa-user-check',   gradient:'linear-gradient(135deg,#10b981,#059669)' },
        { label:'Rejected',         value:counts.rejected, color:'#dc2626', icon:'fas fa-user-times',   gradient:'linear-gradient(135deg,#ef4444,#dc2626)' },
    ];

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">
                <DashboardNavbar page="ICT Club" />
                <div className="db-content" style={{ background:'#f4f6fb' }}>
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message:'', type:'' })} />

                    {/* Header banner */}
                    <div style={{ background:'linear-gradient(135deg,#0d9488 0%,#0f766e 55%,#134e4a 100%)', borderRadius:20, padding:'28px 32px', marginBottom:28, position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' }}></div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, position:'relative' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                                <div style={{ width:52, height:52, borderRadius:15, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <i className="fas fa-laptop-code" style={{ color:'#fff', fontSize:'1.3rem' }}></i>
                                </div>
                                <div>
                                    <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:900, color:'#fff', fontFamily:'Poppins,sans-serif' }}>ICT Club Registrations</h1>
                                    <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,.6)', fontSize:'.82rem', fontFamily:'Poppins,sans-serif' }}>
                                        Review and manage ICT club membership applications
                                    </p>
                                </div>
                            </div>
                            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                                {[
                                    { icon:'fas fa-users',           label:`${meta.total ?? 0} Total`,      color:'rgba(255,255,255,.12)', text:'rgba(255,255,255,.85)' },
                                    { icon:'fas fa-hourglass-half',  label:`${counts.pending} Pending`,     color:'rgba(245,158,11,.2)',   text:'#fbbf24' },
                                    { icon:'fas fa-check-circle',    label:`${counts.approved} Approved`,   color:'rgba(255,255,255,.1)',  text:'rgba(255,255,255,.8)' },
                                ].map((b,i) => (
                                    <div key={i} style={{ display:'flex', alignItems:'center', gap:7, background:b.color, borderRadius:10, padding:'7px 14px', border:`1px solid ${b.color}` }}>
                                        <i className={b.icon} style={{ color:b.text, fontSize:'.75rem' }}></i>
                                        <span style={{ color:b.text, fontFamily:'Poppins,sans-serif', fontSize:'.78rem', fontWeight:700 }}>{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
                        {statCards.map(c => (
                            <div key={c.label} style={{ background:'#fff', borderRadius:16, padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,.06)', border:'1px solid #eef0f6', display:'flex', alignItems:'center', gap:16, position:'relative', overflow:'hidden' }}>
                                <div style={{ position:'absolute', top:0, left:0, width:4, height:'100%', background:c.gradient, borderRadius:'16px 0 0 16px' }}></div>
                                <div style={{ width:48, height:48, borderRadius:13, background:c.gradient, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 6px 16px ${c.color}30` }}>
                                    <i className={c.icon} style={{ color:'#fff', fontSize:'1.05rem' }}></i>
                                </div>
                                <div>
                                    <div style={{ fontSize:'1.7rem', fontWeight:900, color:c.color, lineHeight:1, fontFamily:'Poppins,sans-serif' }}>{c.value}</div>
                                    <div style={{ fontSize:'.72rem', color:'#94a3b8', fontFamily:'Poppins,sans-serif', fontWeight:600, marginTop:2 }}>{c.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div style={{ background:'#fff', borderRadius:16, padding:'16px 20px', boxShadow:'0 2px 10px rgba(0,0,0,.05)', border:'1px solid #eef0f6', marginBottom:20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                        <div style={{ flex:'1 1 220px', position:'relative' }}>
                            <i className="fas fa-search" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#cbd5e1', fontSize:'.82rem' }}></i>
                            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, phone, school…"
                                style={{ width:'100%', paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10, border:'1.5px solid #e8eaf0', borderRadius:10, fontFamily:'Poppins,sans-serif', fontSize:'.84rem', outline:'none', color:'#374151', background:'#f8faff', boxSizing:'border-box', transition:'border-color .2s' }}
                                onFocus={e => e.target.style.borderColor='#0d9488'}
                                onBlur={e => e.target.style.borderColor='#e8eaf0'} />
                        </div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {['','pending','approved','rejected'].map(s => {
                                const cfg = s ? STATUS[s] : null;
                                const active = statusF === s;
                                return (
                                    <button key={s} onClick={() => { setStatusF(s); setPage(1); }}
                                        style={{ padding:'8px 14px', borderRadius:20, border:`1.5px solid ${active ? (cfg?.color ?? '#0d9488') : '#e8eaf0'}`, background:active ? (cfg ? cfg.bg : 'rgba(13,148,136,.1)') : '#fff', color:active ? (cfg?.color ?? '#0d9488') : '#64748b', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.75rem', cursor:'pointer', transition:'all .2s', display:'flex', alignItems:'center', gap:5 }}>
                                        {s ? <><i className={STATUS[s].icon} style={{ fontSize:'.65rem' }}></i>{STATUS[s].label}</> : <><i className="fas fa-th" style={{ fontSize:'.65rem' }}></i>All</>}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ position:'relative' }}>
                            <select value={trackF} onChange={e => { setTrackF(e.target.value); setPage(1); }}
                                style={{ padding:'9px 32px 9px 12px', border:'1.5px solid #e8eaf0', borderRadius:10, fontFamily:'Poppins,sans-serif', fontSize:'.82rem', color:'#374151', background:'#f8faff', cursor:'pointer', appearance:'none', outline:'none' }}>
                                <option value="">All Tracks</option>
                                {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <i className="fas fa-chevron-down" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:'.65rem', pointerEvents:'none' }}></i>
                        </div>
                        <div style={{ position:'relative' }}>
                            <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }}
                                style={{ padding:'9px 32px 9px 12px', border:'1.5px solid #e8eaf0', borderRadius:10, fontFamily:'Poppins,sans-serif', fontSize:'.82rem', color:'#374151', background:'#f8faff', cursor:'pointer', appearance:'none', outline:'none' }}>
                                {[10,15,25,50].map(n => <option key={n} value={n}>{n} / page</option>)}
                            </select>
                            <i className="fas fa-chevron-down" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:'.65rem', pointerEvents:'none' }}></i>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ background:'#fff', borderRadius:18, boxShadow:'0 2px 12px rgba(0,0,0,.06)', border:'1px solid #eef0f6', overflow:'hidden' }}>
                        <div style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)' }}>
                            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                <thead>
                                    <tr>
                                        {['#','Member','Track','School','Applied','Status','Actions'].map(h => (
                                            <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'rgba(255,255,255,.85)', fontSize:'.68rem', fontFamily:'Poppins,sans-serif', fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', whiteSpace:'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div style={{ overflowX:'auto' }}>
                            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={7} style={{ padding:'60px 20px', textAlign:'center' }}>
                                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                                                <div style={{ width:50, height:50, borderRadius:'50%', background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(13,148,136,.3)' }}>
                                                    <i className="fas fa-spinner fa-spin" style={{ color:'#fff', fontSize:'1.1rem' }}></i>
                                                </div>
                                                <span style={{ color:'#94a3b8', fontFamily:'Poppins,sans-serif', fontSize:'.85rem', fontWeight:600 }}>Loading registrations…</span>
                                            </div>
                                        </td></tr>
                                    ) : regs.length === 0 ? (
                                        <tr><td colSpan={7} style={{ padding:'64px 20px', textAlign:'center' }}>
                                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                                                <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border:'2px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                    <i className="fas fa-laptop-code" style={{ fontSize:'1.8rem', color:'#14b8a6' }}></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, color:'#475569', fontSize:'.95rem', marginBottom:4 }}>No registrations found</div>
                                                    <div style={{ color:'#94a3b8', fontFamily:'Poppins,sans-serif', fontSize:'.8rem' }}>{search || statusF || trackF ? 'Try adjusting your filters' : 'ICT Club registrations will appear here'}</div>
                                                </div>
                                            </div>
                                        </td></tr>
                                    ) : regs.map((r, i) => (
                                        <tr key={r.id} style={{ borderBottom:'1px solid #f4f6fb', transition:'background .15s' }}
                                            onMouseEnter={ev => ev.currentTarget.style.background='#f0fdfa'}
                                            onMouseLeave={ev => ev.currentTarget.style.background=''}>
                                            <td style={{ padding:'14px 16px', width:50 }}>
                                                <span style={{ width:26, height:26, borderRadius:7, background:'#f1f5f9', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:'.72rem', fontFamily:'Poppins,sans-serif', fontWeight:700 }}>
                                                    {(meta.from ?? 0) + i}
                                                </span>
                                            </td>
                                            <td style={{ padding:'14px 16px' }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                                    <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 3px 10px rgba(13,148,136,.25)' }}>
                                                        <span style={{ color:'#fff', fontWeight:900, fontSize:'.7rem', fontFamily:'Poppins,sans-serif' }}>
                                                            {r.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight:700, fontSize:'.85rem', color:'#1e293b', fontFamily:'Poppins,sans-serif' }}>{r.name}</div>
                                                        <div style={{ fontSize:'.73rem', color:'#64748b', fontFamily:'Poppins,sans-serif' }}>{r.email}</div>
                                                        {r.phone && <div style={{ fontSize:'.7rem', color:'#94a3b8', fontFamily:'Poppins,sans-serif' }}>{r.phone}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding:'14px 16px' }}>
                                                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(13,148,136,.08)', border:'1px solid rgba(13,148,136,.2)', fontSize:'.72rem', color:'#0d9488', fontFamily:'Poppins,sans-serif', fontWeight:700, whiteSpace:'nowrap' }}>
                                                    <i className="fas fa-code" style={{ fontSize:'.6rem' }}></i> {r.track}
                                                </span>
                                            </td>
                                            <td style={{ padding:'14px 16px', fontSize:'.8rem', color:'#475569', fontFamily:'Poppins,sans-serif' }}>{r.school || <span style={{ color:'#cbd5e1' }}>—</span>}</td>
                                            <td style={{ padding:'14px 16px', fontSize:'.78rem', color:'#64748b', fontFamily:'Poppins,sans-serif', whiteSpace:'nowrap' }}>
                                                <i className="fas fa-clock" style={{ color:'#cbd5e1', marginRight:5, fontSize:'.65rem' }}></i>{fmt(r.created_at)}
                                            </td>
                                            <td style={{ padding:'14px 16px' }}><StatusBadge status={r.status} /></td>
                                            <td style={{ padding:'14px 16px' }}>
                                                <div style={{ display:'flex', gap:6 }}>
                                                    <button title="View / Update" onClick={() => setDetail(r)}
                                                        style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #e8eaf0', background:'#fff', color:'#0d9488', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
                                                        onMouseEnter={ev => { ev.currentTarget.style.background='#0d9488'; ev.currentTarget.style.color='#fff'; ev.currentTarget.style.borderColor='#0d9488'; }}
                                                        onMouseLeave={ev => { ev.currentTarget.style.background='#fff'; ev.currentTarget.style.color='#0d9488'; ev.currentTarget.style.borderColor='#e8eaf0'; }}>
                                                        <i className="fas fa-eye" style={{ fontSize:'.78rem' }}></i>
                                                    </button>
                                                    {can('ict_club','delete') && (
                                                        <button title="Delete" onClick={() => setDelTarget(r)}
                                                            style={{ width:34, height:34, borderRadius:9, border:'1.5px solid #fecaca', background:'#fff', color:'#dc2626', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
                                                            onMouseEnter={ev => { ev.currentTarget.style.background='#dc2626'; ev.currentTarget.style.color='#fff'; ev.currentTarget.style.borderColor='#dc2626'; }}
                                                            onMouseLeave={ev => { ev.currentTarget.style.background='#fff'; ev.currentTarget.style.color='#dc2626'; ev.currentTarget.style.borderColor='#fecaca'; }}>
                                                            <i className="fas fa-trash-alt" style={{ fontSize:'.78rem' }}></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {(meta.lastPage > 1 || regs.length > 0) && (
                            <div style={{ padding:'14px 20px', borderTop:'1px solid #f4f6fb', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, background:'#fafbff' }}>
                                <span style={{ fontSize:'.78rem', color:'#94a3b8', fontFamily:'Poppins,sans-serif' }}>
                                    {meta.from && meta.to
                                        ? <>Showing <strong style={{ color:'#475569' }}>{meta.from}–{meta.to}</strong> of <strong style={{ color:'#475569' }}>{meta.total}</strong> registrations</>
                                        : `${regs.length} registration${regs.length !== 1 ? 's' : ''}`
                                    }
                                </span>
                                {meta.lastPage > 1 && (
                                    <div style={{ display:'flex', gap:5 }}>
                                        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e8eaf0', background:'#fff', color:'#64748b', cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?.4:1 }}>
                                            <i className="fas fa-chevron-left" style={{ fontSize:'.65rem' }}></i>
                                        </button>
                                        {Array.from({ length:meta.lastPage }, (_,i) => i+1).map(p => (
                                            <button key={p} onClick={() => setPage(p)} style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${page===p?'#0d9488':'#e8eaf0'}`, background:page===p?'#0d9488':'#fff', color:page===p?'#fff':'#374151', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'.8rem', cursor:'pointer', transition:'all .2s' }}>{p}</button>
                                        ))}
                                        <button onClick={() => setPage(p => Math.min(meta.lastPage, p+1))} disabled={page===meta.lastPage} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e8eaf0', background:'#fff', color:'#64748b', cursor:page===meta.lastPage?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===meta.lastPage?.4:1 }}>
                                            <i className="fas fa-chevron-right" style={{ fontSize:'.65rem' }}></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {detail && <DetailModal reg={detail} onSave={handleStatusSave} onClose={() => setDetail(null)} token={token} canUpdate={can('ict_club','update')} />}
            {delTarget && <DeleteModal reg={delTarget} onConfirm={confirmDelete} onClose={() => setDelTarget(null)} saving={delSaving} />}
        </div>
    );
}
