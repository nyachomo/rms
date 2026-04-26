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

/* ── Add / Edit Modal ── */
function EventModal({ event, onSave, onClose, token }) {
    const isEdit = !!event?.id;

    const [form, setForm] = useState({
        program_event_name:     event?.program_event_name     || '',
        program_event_location: event?.program_event_location || '',
        program_event_date:     event?.program_event_date     || '',
        status:                 event?.status                 || 'active',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const inp  = (k, props = {}) => (
        <input className="profile-input" value={form[k]} onChange={e => set(k, e.target.value)} {...props} />
    );
    const sel  = (k, children) => (
        <select className="profile-input" value={form[k]} onChange={e => set(k, e.target.value)}>{children}</select>
    );

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const url    = isEdit ? `/api/program-events/${event.id}` : '/api/program-events';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    program_event_name:     form.program_event_name     || null,
                    program_event_location: form.program_event_location || null,
                    program_event_date:     form.program_event_date     || null,
                    status:                 form.status,
                }),
            });
            const json = await res.json();
            if (!res.ok) { setErrors(json.errors || {}); return; }
            onSave(json.program_event, isEdit);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()}
                style={{ maxWidth: 520, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

                <button onClick={onClose} style={{ position: 'sticky', top: 14, float: 'right', marginRight: 14, zIndex: 10, width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', color: '#666' }}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="db-modal-header">
                    <h3>
                        <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i>{' '}
                        {isEdit ? 'Edit Program Event' : 'Add Program Event'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
                    <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                        Event Details
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                        {/* Name — full width */}
                        <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                            <label>Event Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-calendar-star"></i>
                                {inp('program_event_name', { placeholder: 'e.g. Annual Science Fair', required: true })}
                            </div>
                            {errors.program_event_name && <span className="profile-error">{errors.program_event_name[0]}</span>}
                        </div>

                        {/* Location — full width */}
                        <div className="profile-field" style={{ gridColumn: '1/-1' }}>
                            <label>Location</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-map-marker-alt"></i>
                                {inp('program_event_location', { placeholder: 'e.g. Main Hall, Nairobi' })}
                            </div>
                            {errors.program_event_location && <span className="profile-error">{errors.program_event_location[0]}</span>}
                        </div>

                        {/* Date */}
                        <div className="profile-field">
                            <label>Event Date</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-calendar-day"></i>
                                {inp('program_event_date', { type: 'date' })}
                            </div>
                            {errors.program_event_date && <span className="profile-error">{errors.program_event_date[0]}</span>}
                        </div>

                        {/* Status */}
                        <div className="profile-field">
                            <label>Status</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                {sel('status', [
                                    <option key="active"   value="active">Active</option>,
                                    <option key="archived" value="archived">Archived</option>,
                                ])}
                            </div>
                        </div>
                    </div>

                    <div className="db-modal-actions" style={{ marginTop: 24 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={saving}>
                            {saving
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Update Event' : 'Create Event'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ event, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className="db-modal-header" style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                    <h3 style={{ color: '#dc2626' }}><i className="fas fa-exclamation-triangle"></i> Delete Event</h3>
                </div>
                <div style={{ padding: '24px 28px 28px' }}>
                    <p style={{ color: '#374151', marginBottom: 8 }}>
                        Are you sure you want to delete <strong>{event.program_event_name}</strong>?
                    </p>
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '.83rem', color: '#92400e' }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }}></i>
                        Students enrolled in this event will be <strong>unassigned</strong>. This cannot be undone.
                    </div>
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

/* ── Helpers ── */
const fmtDate = d => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isPast   = d => d && new Date(d) < new Date();
const isFuture = d => d && new Date(d) > new Date();

/* ── Main Page ── */
export default function ProgramEvents() {
    const { user, token, can } = useAuth();

    const [events, setEvents]           = useState([]);
    const [meta, setMeta]               = useState({ total: 0, last_page: 1 });
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]               = useState(1);
    const [perPage, setPerPage]         = useState(15);
    const [loading, setLoading]         = useState(false);
    const [addModal, setAddModal]       = useState(false);
    const [editEvent, setEditEvent]     = useState(null);
    const [deleteEvent, setDeleteEvent] = useState(null);
    const [deleting, setDeleting]       = useState(false);
    const [toast, setToast]             = useState(null);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const headers  = { Accept: 'application/json', Authorization: `Bearer ${token}` };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, per_page: perPage });
            if (search)       p.set('search', search);
            if (statusFilter) p.set('status', statusFilter);
            const res  = await fetch(`/api/program-events?${p}`, { headers });
            const json = await res.json();
            setEvents(json.data || []);
            setMeta({ total: json.total || 0, last_page: json.last_page || 1 });
        } finally {
            setLoading(false);
        }
    }, [token, page, perPage, search, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleSave = (_saved, isEdit) => {
        setAddModal(false);
        setEditEvent(null);
        setToast({ message: `Event ${isEdit ? 'updated' : 'created'} successfully.`, type: 'success' });
        load();
    };

    const handleDelete = async () => {
        if (!deleteEvent) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/program-events/${deleteEvent.id}`, { method: 'DELETE', headers });
            if (res.ok) {
                setToast({ message: 'Event deleted.', type: 'success' });
                setDeleteEvent(null);
                load();
            }
        } finally {
            setDeleting(false);
        }
    };

    /* stats (page-level for instant feedback) */
    const activeCount   = events.filter(e => e.status === 'active').length;
    const archivedCount = events.filter(e => e.status === 'archived').length;

    const from = meta.total === 0 ? 0 : (page - 1) * perPage + 1;
    const to   = Math.min(page * perPage, meta.total);

    const renderPager = () => {
        if (meta.last_page <= 1) return null;
        const delta = 2, rs = Math.max(2, page - delta), re = Math.min(meta.last_page - 1, page + delta);
        const pages = [];
        if (meta.last_page >= 1) pages.push(1);
        if (rs > 2) pages.push('…l');
        for (let p = rs; p <= re; p++) pages.push(p);
        if (re < meta.last_page - 1) pages.push('…r');
        if (meta.last_page > 1) pages.push(meta.last_page);
        return (
            <div className="db-pagination" style={{ justifyContent: 'center', gap: 4, paddingTop: 16 }}>
                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(1)}><i className="fas fa-angle-double-left"></i></button>
                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
                {pages.map(p => typeof p === 'string'
                    ? <span key={p} className="db-page-btn" style={{ cursor: 'default', opacity: .45, pointerEvents: 'none' }}>…</span>
                    : <button key={p} className={`db-page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )}
                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)}><i className="fas fa-angle-double-right"></i></button>
            </div>
        );
    };

    return (
        <div className="db-wrap">
            <DashboardSidebar />
            <div className="db-main">

                <DashboardNavbar page="Program Events" />

                {/* Content */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('program_events', 'view') && <AccessDenied />}
                    {can('program_events', 'view') && (<>

                    {/* Top bar */}
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Program Events</h1>
                            <p className="db-page-sub">Manage events and student programme assignments</p>
                        </div>
                        {can('program_events', 'create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-plus"></i> Add Event
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('program_events', 'view_stats') && (
                        <div className="schools-stats-row">
                            <div className="schools-stat-card">
                                <div className="schools-stat-icon" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                                <div>
                                    <div className="schools-stat-value">{meta.total}</div>
                                    <div className="schools-stat-label">Total Events</div>
                                </div>
                            </div>
                            <div className="schools-stat-card">
                                <div className="schools-stat-icon" style={{ background: 'linear-gradient(135deg,#11998e,#38ef7d)' }}>
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div>
                                    <div className="schools-stat-value">{activeCount}</div>
                                    <div className="schools-stat-label">Active (this page)</div>
                                </div>
                            </div>
                            <div className="schools-stat-card">
                                <div className="schools-stat-icon" style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
                                    <i className="fas fa-archive"></i>
                                </div>
                                <div>
                                    <div className="schools-stat-value">{archivedCount}</div>
                                    <div className="schools-stat-label">Archived</div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search events by name or location…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select className="db-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Table header row */}
                    {!loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                            <div style={{ fontSize: '.82rem', color: '#9ca3af' }}>
                                {meta.total === 0 ? 'No records found'
                                    : <>Showing <strong style={{ color: '#374151' }}>{from}–{to}</strong> of <strong style={{ color: '#374151' }}>{meta.total}</strong> {meta.total === 1 ? 'event' : 'events'}</>
                                }
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem', color: '#9ca3af' }}>
                                <span>Per page</span>
                                <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                                    style={{ border: '1.5px solid #e4e7f0', borderRadius: 8, padding: '5px 10px', fontFamily: 'Poppins,sans-serif', fontSize: '.82rem', color: '#374151', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                                    {[10, 15, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem' }}></i>
                        </div>
                    ) : events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(8,31,78,.06)' }}>
                            <i className="fas fa-calendar-times" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: 16, display: 'block' }}></i>
                            <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: 600, margin: 0 }}>No program events found</p>
                            <p style={{ color: '#9ca3af', fontSize: '.85rem', marginTop: 6 }}>
                                {search || statusFilter ? 'Try adjusting your filters.' : 'Click "Add Event" to create the first event.'}
                            </p>
                        </div>
                    ) : (
                        <div className="db-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="db-table" style={{ minWidth: 700 }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 36 }}>#</th>
                                        <th>Event</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Students</th>
                                        <th>Status</th>
                                        {(can('program_events', 'update') || can('program_events', 'delete')) && <th style={{ width: 100 }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((ev, idx) => {
                                        const past   = isPast(ev.program_event_date);
                                        const future = isFuture(ev.program_event_date);
                                        return (
                                            <tr key={ev.id}>
                                                <td style={{ color: '#9ca3af', fontSize: '.8rem' }}>{from + idx}</td>

                                                {/* Event name + timing badge */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#667eea22,#764ba222)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <i className="fas fa-calendar-alt" style={{ color: '#764ba2', fontSize: '.85rem' }}></i>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '.88rem' }}>{ev.program_event_name}</div>
                                                            <div style={{ marginTop: 3 }}>
                                                                {future && (
                                                                    <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 4, padding: '1px 7px', fontSize: '.68rem', fontWeight: 700 }}>
                                                                        <i className="fas fa-clock" style={{ marginRight: 3 }}></i>Upcoming
                                                                    </span>
                                                                )}
                                                                {past && (
                                                                    <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 4, padding: '1px 7px', fontSize: '.68rem', fontWeight: 700 }}>
                                                                        <i className="fas fa-flag-checkered" style={{ marginRight: 3 }}></i>Past
                                                                    </span>
                                                                )}
                                                                {!ev.program_event_date && (
                                                                    <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: 4, padding: '1px 7px', fontSize: '.68rem', fontWeight: 700 }}>
                                                                        <i className="fas fa-question-circle" style={{ marginRight: 3 }}></i>No date
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Location */}
                                                <td style={{ color: '#374151', fontSize: '.84rem' }}>
                                                    {ev.program_event_location
                                                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <i className="fas fa-map-marker-alt" style={{ color: '#fe730c', fontSize: '.72rem' }}></i>
                                                            {ev.program_event_location}
                                                          </div>
                                                        : <span style={{ color: '#d1d5db' }}>—</span>
                                                    }
                                                </td>

                                                {/* Date */}
                                                <td style={{ fontSize: '.84rem' }}>
                                                    {ev.program_event_date
                                                        ? <div>
                                                            <div style={{ fontWeight: 600, color: future ? '#2563eb' : past ? '#6b7280' : '#374151' }}>
                                                                {fmtDate(ev.program_event_date)}
                                                            </div>
                                                          </div>
                                                        : <span style={{ color: '#d1d5db' }}>—</span>
                                                    }
                                                </td>

                                                {/* Student count */}
                                                <td>
                                                    <span style={{ background: '#f5f3ff', color: '#7c3aed', borderRadius: 20, padding: '3px 12px', fontSize: '.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                        <i className="fas fa-user-graduate" style={{ fontSize: '.65rem' }}></i>
                                                        {ev.students_count ?? 0}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span style={{
                                                        background: ev.status === 'active' ? '#f0fdf4' : '#f8f4ff',
                                                        color: ev.status === 'active' ? '#16a34a' : '#7c3aed',
                                                        border: `1px solid ${ev.status === 'active' ? '#bbf7d0' : '#ddd6fe'}`,
                                                        borderRadius: 20, padding: '3px 11px', fontSize: '.74rem', fontWeight: 600, whiteSpace: 'nowrap',
                                                    }}>
                                                        <i className={`fas ${ev.status === 'active' ? 'fa-check-circle' : 'fa-archive'}`} style={{ marginRight: 4 }}></i>
                                                        {ev.status === 'active' ? 'Active' : 'Archived'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                {(can('program_events', 'update') || can('program_events', 'delete')) && (
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {can('program_events', 'update') && (
                                                                <button title="Edit" onClick={() => setEditEvent(ev)}
                                                                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e0e7ff', background: '#f0f4ff', color: '#4f46e5', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.82rem', transition: 'all .15s' }}
                                                                    onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                                                                    onMouseOut={e  => e.currentTarget.style.background = '#f0f4ff'}>
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                            )}
                                                            {can('program_events', 'delete') && (
                                                                <button title="Delete" onClick={() => setDeleteEvent(ev)}
                                                                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.82rem', transition: 'all .15s' }}
                                                                    onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                                                                    onMouseOut={e  => e.currentTarget.style.background = '#fef2f2'}>
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

                    {renderPager()}

                    </>)}
                </div>
            </div>

            {addModal    && <EventModal onSave={handleSave} onClose={() => setAddModal(false)} token={token} />}
            {editEvent   && <EventModal event={editEvent} onSave={handleSave} onClose={() => setEditEvent(null)} token={token} />}
            {deleteEvent && <DeleteModal event={deleteEvent} onConfirm={handleDelete} onClose={() => setDeleteEvent(null)} loading={deleting} />}
        </div>
    );
}
