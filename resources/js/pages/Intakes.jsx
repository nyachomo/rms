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

/* ── Status config ── */
const STATUS = {
    active:   { label: 'Active',   color: '#10b981', bg: 'rgba(16,185,129,.12)',  border: 'rgba(16,185,129,.3)',  icon: 'fas fa-check-circle' },
    archived: { label: 'Archived', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', border: 'rgba(139,92,246,.3)', icon: 'fas fa-archive' },
    ended:    { label: 'Ended',    color: '#ef4444', bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.3)',   icon: 'fas fa-times-circle' },
};

const fmt = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

/* ── Styled label helper ── */
const FLabel = ({ children }) => (
    <label style={{ display:'block', fontSize:'.73rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.5px', fontFamily:'Poppins,sans-serif', marginBottom:5 }}>
        {children}
    </label>
);

/* ══════════════ INTAKE MODAL ══════════════ */
function IntakeModal({ intake, onSave, onClose, token }) {
    const isEdit = !!intake?.id;
    const empty  = { intake_name: '', intake_start_date: '', intake_end_date: '', intake_status: 'active' };
    const [form, setForm]     = useState(isEdit ? {
        intake_name:       intake.intake_name,
        intake_start_date: intake.intake_start_date?.slice(0, 10) ?? '',
        intake_end_date:   intake.intake_end_date?.slice(0, 10)   ?? '',
        intake_status:     intake.intake_status,
    } : empty);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const handle = e => set(e.target.name, e.target.value);

    const submit = async e => {
        e.preventDefault();
        setSaving(true); setErrors({});
        try {
            const url    = isEdit ? `/api/intakes/${intake.id}` : '/api/intakes';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.intake);
        } finally {
            setSaving(false);
        }
    };

    const selStyle = { border:'none', background:'transparent', outline:'none', width:'100%', fontFamily:'Poppins,sans-serif', fontSize:'.88rem', color:'#081f4e', cursor:'pointer' };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 520 }}>

                {/* Header */}
                <div className="modal-header">
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className={`fas fa-${isEdit ? 'edit' : 'calendar-plus'}`} style={{ color:'#fff', fontSize:'.95rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ color:'#fff', fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1.05rem', margin:0 }}>
                                {isEdit ? 'Edit Intake' : 'Add Intake'}
                            </h3>
                            <p style={{ color:'rgba(255,255,255,.6)', fontSize:'.75rem', margin:0, fontFamily:'Poppins,sans-serif' }}>
                                {isEdit ? 'Update intake details' : 'Create a new intake period'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'.9rem' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

                        {/* Intake Name */}
                        <div>
                            <FLabel>Intake Name <span style={{ color:'#ef4444' }}>*</span></FLabel>
                            <div className="profile-input-wrap">
                                <i className="fas fa-layer-group"></i>
                                <input type="text" name="intake_name" required
                                    placeholder="e.g. January 2026 Intake"
                                    value={form.intake_name} onChange={handle} />
                            </div>
                            {errors.intake_name && <span className="profile-error">{errors.intake_name[0]}</span>}
                        </div>

                        {/* Dates */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                            <div>
                                <FLabel>Start Date <span style={{ color:'#ef4444' }}>*</span></FLabel>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-calendar-alt"></i>
                                    <input type="date" name="intake_start_date" required
                                        value={form.intake_start_date} onChange={handle} />
                                </div>
                                {errors.intake_start_date && <span className="profile-error">{errors.intake_start_date[0]}</span>}
                            </div>
                            <div>
                                <FLabel>End Date <span style={{ color:'#ef4444' }}>*</span></FLabel>
                                <div className="profile-input-wrap">
                                    <i className="fas fa-calendar-check"></i>
                                    <input type="date" name="intake_end_date" required
                                        value={form.intake_end_date} onChange={handle} />
                                </div>
                                {errors.intake_end_date && <span className="profile-error">{errors.intake_end_date[0]}</span>}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <FLabel>Status</FLabel>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                <select name="intake_status" value={form.intake_status} onChange={handle} style={selStyle}>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                    <option value="ended">Ended</option>
                                </select>
                            </div>
                            {/* Live status preview */}
                            {form.intake_status && (
                                <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:7 }}>
                                    <span style={{
                                        background: STATUS[form.intake_status].bg,
                                        color:      STATUS[form.intake_status].color,
                                        border:     `1px solid ${STATUS[form.intake_status].border}`,
                                        padding:'3px 10px', borderRadius:20, fontSize:'.72rem', fontWeight:700,
                                        fontFamily:'Poppins,sans-serif', display:'inline-flex', alignItems:'center', gap:5,
                                    }}>
                                        <i className={STATUS[form.intake_status].icon} style={{ fontSize:'.6rem' }}></i>
                                        {STATUS[form.intake_status].label}
                                    </span>
                                    <span style={{ color:'#9ca3af', fontSize:'.73rem', fontFamily:'Poppins,sans-serif' }}>preview</span>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ marginTop:4, paddingTop:18, borderTop:'1px solid #f0f2f8' }}>
                            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-modal-save" disabled={saving}>
                                {saving
                                    ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                    : <><i className={`fas fa-${isEdit ? 'save' : 'plus'}`}></i> {isEdit ? 'Update Intake' : 'Create Intake'}</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* ══════════════ DELETE MODAL ══════════════ */
function DeleteModal({ intake, onConfirm, onClose }) {
    const [deleting, setDeleting] = useState(false);
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth:440 }}>
                <div className="modal-header" style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className="fas fa-trash-alt" style={{ color:'#fff', fontSize:'.9rem' }}></i>
                        </div>
                        <h3 style={{ color:'#fff', fontFamily:'Poppins,sans-serif', fontWeight:800, fontSize:'1rem', margin:0 }}>Delete Intake</h3>
                    </div>
                    <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.2)', border:'none', cursor:'pointer', color:'#fff', fontSize:'.85rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ color:'#374151', fontFamily:'Poppins,sans-serif', lineHeight:1.7, marginBottom:6 }}>
                        Are you sure you want to permanently delete <strong style={{ color:'#081f4e' }}>{intake.intake_name}</strong>?
                    </p>
                    <p style={{ color:'#9ca3af', fontSize:'.83rem', fontFamily:'Poppins,sans-serif' }}>This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)' }}
                        disabled={deleting}
                        onClick={async () => { setDeleting(true); await onConfirm(); }}>
                        {deleting ? <><i className="fas fa-circle-notch fa-spin"></i> Deleting…</> : <><i className="fas fa-trash-alt"></i> Yes, Delete</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════ MAIN PAGE ══════════════════════════════════ */
export default function Intakes() {
    const { user, token, can } = useAuth();

    const [intakes, setIntakes]           = useState([]);
    const [meta, setMeta]                 = useState(null);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]                 = useState(1);
    const [perPage, setPerPage]           = useState(15);
    const [toast, setToast]               = useState(null);
    const [modal, setModal]               = useState(false);
    const [editItem, setEditItem]         = useState(null);
    const [delItem, setDelItem]           = useState(null);

    const now      = new Date();
    const dateStr  = now.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';

    const load = useCallback(async (p = page) => {
        setLoading(true);
        const params = new URLSearchParams({ page: p, per_page: perPage });
        if (search)       params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        const r    = await fetch(`/api/intakes?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await r.json();
        setIntakes(json.data || []);
        setMeta(json);
        setLoading(false);
    }, [token, page, perPage, search, statusFilter]);

    useEffect(() => { load(1); setPage(1); }, [search, statusFilter, perPage]);
    useEffect(() => { load(page); }, [page]);

    const handleSave = saved => {
        setIntakes(prev => {
            const idx = prev.findIndex(x => x.id === saved.id);
            return idx >= 0 ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev];
        });
        setModal(false); setEditItem(null);
        setToast({ message: editItem ? 'Intake updated.' : 'Intake created.', type: 'success' });
    };

    const handleDelete = async () => {
        await fetch(`/api/intakes/${delItem.id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
        setIntakes(prev => prev.filter(x => x.id !== delItem.id));
        setDelItem(null);
        setToast({ message: 'Intake deleted.', type: 'success' });
    };

    /* Computed stats */
    const totalAll  = meta?.total ?? 0;
    const activeN   = intakes.filter(x => x.intake_status === 'active').length;
    const archivedN = intakes.filter(x => x.intake_status === 'archived').length;
    const endedN    = intakes.filter(x => x.intake_status === 'ended').length;

    /* Duration helper */
    const duration = (start, end) => {
        if (!start || !end) return '—';
        const days = Math.round((new Date(end) - new Date(start)) / 86400000);
        if (days < 0) return 'Invalid';
        if (days < 30) return `${days}d`;
        const months = Math.round(days / 30.4);
        return months < 12 ? `${months} mo` : `${(months / 12).toFixed(1)} yr`;
    };

    /* Progress bar (% of intake elapsed) */
    const progress = (start, end) => {
        const s = new Date(start), e = new Date(end), t = new Date();
        if (t < s) return 0;
        if (t > e) return 100;
        return Math.round(((t - s) / (e - s)) * 100);
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">

                <DashboardNavbar page="Intakes" />

                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('intakes','view') && <AccessDenied />}
                    {can('intakes','view') && (<>

                    {/* ── Stat Cards ── */}
                    <div className="db-stats-row">
                        <div className="db-stat-card" style={{ background:'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
                            <div className="db-stat-icon" style={{ background:'rgba(255,255,255,.18)' }}><i className="fas fa-layer-group"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Total Intakes</span>
                                <span className="db-stat-value">{totalAll}</span>
                            </div>
                        </div>
                        <div className="db-stat-card" style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                            <div className="db-stat-icon" style={{ background:'rgba(255,255,255,.18)' }}><i className="fas fa-check-circle"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Active</span>
                                <span className="db-stat-value">{activeN}</span>
                            </div>
                        </div>
                        <div className="db-stat-card" style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
                            <div className="db-stat-icon" style={{ background:'rgba(255,255,255,.18)' }}><i className="fas fa-archive"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Archived</span>
                                <span className="db-stat-value">{archivedN}</span>
                            </div>
                        </div>
                        <div className="db-stat-card" style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                            <div className="db-stat-icon" style={{ background:'rgba(255,255,255,.18)' }}><i className="fas fa-times-circle"></i></div>
                            <div className="db-stat-info">
                                <span className="db-stat-label">Ended</span>
                                <span className="db-stat-value">{endedN}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Status quick-filters ── */}
                    <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                        {[
                            { key:'',         label:'All Intakes', icon:'fas fa-th-large',    color:'#081f4e' },
                            { key:'active',   label:'Active',      icon:'fas fa-check-circle', color:'#10b981' },
                            { key:'archived', label:'Archived',    icon:'fas fa-archive',      color:'#8b5cf6' },
                            { key:'ended',    label:'Ended',       icon:'fas fa-times-circle', color:'#ef4444' },
                        ].map(f => (
                            <button key={f.key} onClick={() => setStatusFilter(f.key)}
                                style={{
                                    padding:'7px 16px', borderRadius:20, cursor:'pointer',
                                    border: statusFilter === f.key ? `2px solid ${f.color}` : '1.5px solid #e8eaf0',
                                    background: statusFilter === f.key ? f.color + '18' : '#fff',
                                    color: statusFilter === f.key ? f.color : '#555',
                                    fontFamily:'Poppins,sans-serif', fontSize:'.75rem', fontWeight:700,
                                    display:'flex', alignItems:'center', gap:6, transition:'all .2s',
                                }}>
                                <i className={f.icon} style={{ fontSize:'.7rem' }}></i> {f.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Controls ── */}
                    <div className="db-controls">
                        <div className="db-search-wrap" style={{ flex:1 }}>
                            <i className="fas fa-search db-search-icon"></i>
                            <input className="db-search" placeholder="Search by intake name…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        {can('intakes','create') && (
                            <button className="btn-add-new" onClick={() => { setEditItem(null); setModal(true); }}>
                                <i className="fas fa-plus"></i> Add Intake
                            </button>
                        )}
                    </div>

                    {/* ── Count + per-page ── */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                        <span style={{ fontSize:'.78rem', color:'#888', fontFamily:'Poppins,sans-serif' }}>
                            {meta ? <><strong style={{ color:'#081f4e' }}>{meta.from ?? 0}–{meta.to ?? 0}</strong> of <strong style={{ color:'#081f4e' }}>{meta.total ?? 0}</strong> intakes</> : ''}
                        </span>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.78rem', color:'#888', fontFamily:'Poppins,sans-serif' }}>
                            Show
                            <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                                style={{ padding:'3px 8px', borderRadius:6, border:'1.5px solid #e8eaf0', fontFamily:'Poppins,sans-serif', fontSize:'.78rem', color:'#374151' }}>
                                {[10,15,25,50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            per page
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="db-table-wrap" style={{ boxShadow:'0 4px 24px rgba(8,31,78,.07)', borderRadius:16, border:'1px solid #e8eaf0' }}>
                        <table className="db-table" style={{ minWidth:'unset', width:'100%' }}>
                            <thead>
                                <tr style={{ background:'linear-gradient(135deg,#f7f9fc,#eef2f7)' }}>
                                    <th style={{ width:40 }}>#</th>
                                    <th style={{ minWidth:200 }}>Intake</th>
                                    <th style={{ minWidth:130 }}>Start Date</th>
                                    <th style={{ minWidth:130 }}>End Date</th>
                                    <th style={{ minWidth:140 }}>Duration / Progress</th>
                                    <th style={{ minWidth:100 }}>Status</th>
                                    {(can('intakes','update') || can('intakes','delete')) && <th style={{ width:100 }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'50px 0', color:'#999' }}>
                                        <i className="fas fa-spinner fa-spin" style={{ fontSize:'1.5rem', marginBottom:8, display:'block' }}></i>
                                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'.85rem' }}>Loading intakes…</span>
                                    </td></tr>
                                ) : intakes.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 0', color:'#bbb' }}>
                                        <i className="fas fa-calendar-times" style={{ fontSize:'2.8rem', marginBottom:10, display:'block', opacity:.35 }}></i>
                                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:'.88rem' }}>No intakes found.</span>
                                    </td></tr>
                                ) : intakes.map((item, i) => {
                                    const st  = STATUS[item.intake_status] || STATUS.active;
                                    const pct = item.intake_status === 'ended' ? 100 : progress(item.intake_start_date, item.intake_end_date);
                                    return (
                                        <tr key={item.id}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f9faff'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}>

                                            <td style={{ color:'#bbb', fontSize:'.75rem', fontWeight:600 }}>
                                                {(meta?.from ?? 1) + i}
                                            </td>

                                            {/* Intake name */}
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                    <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${st.color}22,${st.color}44)`, border:`1.5px solid ${st.color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                        <i className="fas fa-layer-group" style={{ color:st.color, fontSize:'.75rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight:700, color:'#081f4e', fontSize:'.88rem', fontFamily:'Poppins,sans-serif' }}>
                                                            {item.intake_name}
                                                        </div>
                                                        <div style={{ fontSize:'.68rem', color:'#aaa', marginTop:1, fontFamily:'Poppins,sans-serif' }}>
                                                            ID #{item.id} · Added {fmt(item.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Start date */}
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.82rem', color:'#374151' }}>
                                                    <i className="fas fa-calendar-alt" style={{ color:'#10b981', fontSize:'.68rem' }}></i>
                                                    {fmt(item.intake_start_date)}
                                                </div>
                                            </td>

                                            {/* End date */}
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.82rem', color:'#374151' }}>
                                                    <i className="fas fa-calendar-check" style={{ color:'#ef4444', fontSize:'.68rem' }}></i>
                                                    {fmt(item.intake_end_date)}
                                                </div>
                                            </td>

                                            {/* Duration + progress bar */}
                                            <td>
                                                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                                    <span style={{ fontSize:'.78rem', fontWeight:700, color:'#555', fontFamily:'Poppins,sans-serif' }}>
                                                        {duration(item.intake_start_date, item.intake_end_date)}
                                                    </span>
                                                    <div style={{ height:5, borderRadius:10, background:'#e5e7eb', overflow:'hidden', width:'100%' }}>
                                                        <div style={{ height:'100%', width:`${pct}%`, borderRadius:10, background: pct === 100 ? '#ef4444' : `linear-gradient(90deg,${st.color},${st.color}aa)`, transition:'width .4s' }} />
                                                    </div>
                                                    <span style={{ fontSize:'.65rem', color:'#9ca3af', fontFamily:'Poppins,sans-serif' }}>{pct}% elapsed</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span style={{
                                                    background: st.bg, color: st.color, border:`1px solid ${st.border}`,
                                                    padding:'4px 10px', borderRadius:20, fontSize:'.7rem', fontWeight:700,
                                                    fontFamily:'Poppins,sans-serif', display:'inline-flex', alignItems:'center', gap:5,
                                                }}>
                                                    <i className={st.icon} style={{ fontSize:'.6rem' }}></i> {st.label}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            {(can('intakes','update') || can('intakes','delete')) && (
                                                <td>
                                                    <div style={{ display:'flex', gap:5 }}>
                                                        {can('intakes','update') && (
                                                            <button title="Edit" onClick={() => { setEditItem(item); setModal(true); }}
                                                                style={{ background:'#eff6ff', color:'#3b82f6', border:'none', borderRadius:7, padding:'6px 9px', cursor:'pointer', fontSize:'.72rem' }}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        )}
                                                        {can('intakes','delete') && (
                                                            <button title="Delete" onClick={() => setDelItem(item)}
                                                                style={{ background:'#fef2f2', color:'#ef4444', border:'none', borderRadius:7, padding:'6px 9px', cursor:'pointer', fontSize:'.72rem' }}>
                                                                <i className="fas fa-trash"></i>
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

                    {/* ── Pagination ── */}
                    {meta && meta.last_page > 1 && (
                        <div className="db-pagination">
                            <button className="db-page-btn" disabled={page===1} onClick={() => setPage(1)}>«</button>
                            <button className="db-page-btn" disabled={page===1} onClick={() => setPage(p => p-1)}>‹</button>
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                                .filter(n => Math.abs(n - page) <= 2)
                                .map(n => (
                                    <button key={n} className={`db-page-btn${n===page?' active':''}`} onClick={() => setPage(n)}>{n}</button>
                                ))}
                            <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(p => p+1)}>›</button>
                            <button className="db-page-btn" disabled={page===meta.last_page} onClick={() => setPage(meta.last_page)}>»</button>
                        </div>
                    )}

                    </>)}
                </div>
            </div>

            {modal   && <IntakeModal intake={editItem} onSave={handleSave} onClose={() => { setModal(false); setEditItem(null); }} token={token} />}
            {delItem && <DeleteModal intake={delItem} onConfirm={handleDelete} onClose={() => setDelItem(null)} />}
        </div>
    );
}
