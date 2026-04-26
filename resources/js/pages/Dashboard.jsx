import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';

const TRACKS = [
    'Web & App Development',
    'Cybersecurity',
    'Data & AI Literacy',
    'Digital Marketing',
    'UI/UX & Design Thinking',
    'Tech Entrepreneurship',
];

const TRACK_COLORS = {
    'Web & App Development':   { bg: 'rgba(14,165,233,.12)', color: '#0891b2' },
    'Cybersecurity':           { bg: 'rgba(239,68,68,.12)',  color: '#dc2626' },
    'Data & AI Literacy':      { bg: 'rgba(139,92,246,.12)', color: '#7c3aed' },
    'Digital Marketing':       { bg: 'rgba(254,115,12,.12)', color: '#ea6a08' },
    'UI/UX & Design Thinking': { bg: 'rgba(16,185,129,.12)', color: '#059669' },
    'Tech Entrepreneurship':   { bg: 'rgba(245,158,11,.12)', color: '#d97706' },
};

function badge(track) {
    const c = TRACK_COLORS[track] || { bg: '#f3f4f6', color: '#555' };
    return (
        <span style={{ background: c.bg, color: c.color, fontFamily: 'Poppins,sans-serif', fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            {track}
        </span>
    );
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatCard({ icon, iconBg, label, value, sub }) {
    return (
        <div className="db-stat-card">
            <div className="db-stat-icon" style={{ background: iconBg }}><i className={icon}></i></div>
            <div>
                <div className="db-stat-value">{value}</div>
                <div className="db-stat-label">{label}</div>
                {sub && <div className="db-stat-sub">{sub}</div>}
            </div>
        </div>
    );
}

function StudentModal({ student, onClose }) {
    if (!student) return null;
    return (
        <div className="db-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="db-detail-modal">
                <button className="db-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
                <div className="db-detail-head">
                    <div className="db-avatar-lg">{student.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3>{student.name}</h3>
                        <p>{student.email}</p>
                        <div style={{ marginTop: 8 }}>{badge(student.track)}</div>
                    </div>
                </div>
                <div className="db-detail-grid">
                    {[
                        { icon: 'fas fa-phone-alt', label: 'Phone', val: student.phone || '—' },
                        { icon: 'fas fa-university', label: 'School / Institution', val: student.school || '—' },
                        { icon: 'fas fa-calendar-alt', label: 'Registered On', val: formatDate(student.registeredAt) },
                        { icon: 'fas fa-circle', label: 'Status', val: student.status || 'Active' },
                    ].map(r => (
                        <div key={r.label} className="db-detail-row">
                            <i className={r.icon}></i>
                            <div>
                                <small>{r.label}</small>
                                <span>{r.val}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {student.why && (
                    <div className="db-detail-why">
                        <label><i className="fas fa-comment-alt"></i> Why they joined</label>
                        <p>"{student.why}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user, token, logout, can } = useAuth();

    const [students, setStudents] = useState(() =>
        JSON.parse(localStorage.getItem('ict_students') || '[]')
    );
    const [search, setSearch] = useState('');
    const [trackFilter, setTrackFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortDir, setSortDir] = useState('desc');
    const [selected, setSelected] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const filtered = useMemo(() => {
        let list = [...students];
        if (trackFilter !== 'all') list = list.filter(s => s.track === trackFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.school || '').toLowerCase().includes(q) ||
                (s.track || '').toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            let va, vb;
            if (sortBy === 'date') { va = a.registeredAt; vb = b.registeredAt; }
            else if (sortBy === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
            else { va = (a.track || '').toLowerCase(); vb = (b.track || '').toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [students, search, trackFilter, sortBy, sortDir]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const confirmDelete = (id) => {
        const updated = students.filter(s => s.id !== id);
        setStudents(updated);
        localStorage.setItem('ict_students', JSON.stringify(updated));
        setDeleteId(null);
    };

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('asc'); }
        setPage(1);
    };

    const exportCSV = () => {
        const header = ['Name', 'Email', 'Phone', 'School', 'Track', 'Registered On', 'Status'];
        const rows = students.map(s => [
            s.name, s.email, s.phone || '', s.school || '', s.track,
            formatDate(s.registeredAt), s.status || 'Active'
        ]);
        const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ict_club_students_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
    };

    // Stats
    const thisMonth = students.filter(s => {
        const d = new Date(s.registeredAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const trackCounts = TRACKS.map(t => ({ track: t, count: students.filter(s => s.track === t).length }))
        .sort((a, b) => b.count - a.count);

    const sortIcon = (col) => {
        if (sortBy !== col) return <i className="fas fa-sort" style={{ opacity: .3, marginLeft: 4 }}></i>;
        return <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: 4, color: 'var(--red)' }}></i>;
    };

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="db-wrap">
            {/* SIDEBAR */}
            <DashboardSidebar />

            {/* MAIN */}
            <div className="db-main">

                <DashboardNavbar page="Dashboard" />

                {/* CONTENT */}
                <div className="db-content">

                {/* TOPBAR */}
                <div className="db-topbar">
                    <div>
                        <h1 className="db-page-title">Student Management</h1>
                        <p className="db-page-sub">ICT Club — Registered Members</p>
                    </div>
                    <button className="db-export-btn" onClick={exportCSV}>
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                </div>

                {/* STAT CARDS */}
                <div className="db-stats-row">
                    <StatCard icon="fas fa-users" iconBg="linear-gradient(135deg,#0ea5e9,#06b6d4)" label="Total Students" value={students.length} sub="All time" />
                    <StatCard icon="fas fa-calendar-check" iconBg="linear-gradient(135deg,#10b981,#059669)" label="This Month" value={thisMonth} sub="New registrations" />
                    <StatCard icon="fas fa-layer-group" iconBg="linear-gradient(135deg,#8b5cf6,#a855f7)" label="Tracks Active" value={trackCounts.filter(t => t.count > 0).length} sub={`of ${TRACKS.length} tracks`} />
                    <StatCard icon="fas fa-trophy" iconBg="linear-gradient(135deg,#fe730c,#f59e0b)" label="Top Track" value={trackCounts[0]?.count > 0 ? trackCounts[0].count : '—'} sub={trackCounts[0]?.count > 0 ? trackCounts[0].track : 'No data yet'} />
                </div>

                {/* TRACK BREAKDOWN */}
                <div className="db-track-bar">
                    {TRACKS.map(t => {
                        const cnt = students.filter(s => s.track === t).length;
                        const pct = students.length ? Math.round((cnt / students.length) * 100) : 0;
                        const c = TRACK_COLORS[t];
                        return (
                            <div key={t} className="db-track-item" onClick={() => { setTrackFilter(trackFilter === t ? 'all' : t); setPage(1); }} style={{ cursor: 'pointer', opacity: trackFilter !== 'all' && trackFilter !== t ? .45 : 1 }}>
                                <div className="db-track-top">
                                    <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', fontWeight: 600, color: '#444' }}>{t}</span>
                                    <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '.78rem', fontWeight: 700, color: c.color }}>{cnt}</span>
                                </div>
                                <div className="db-track-prog-bg">
                                    <div className="db-track-prog-fill" style={{ width: `${pct}%`, background: c.color }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* TABLE CONTROLS */}
                <div className="db-table-controls">
                    <div className="db-search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search by name, email, school or track…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                        {search && <button className="db-search-clear" onClick={() => { setSearch(''); setPage(1); }}><i className="fas fa-times"></i></button>}
                    </div>
                    <div className="db-filter-group">
                        <select value={trackFilter} onChange={e => { setTrackFilter(e.target.value); setPage(1); }} className="db-select">
                            <option value="all">All Tracks</option>
                            {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="db-results-badge">
                        <span>{filtered.length}</span> student{filtered.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* TABLE */}
                <div className="db-table-wrap">
                    {students.length === 0 ? (
                        <div className="db-empty">
                            <i className="fas fa-user-graduate"></i>
                            <h3>No students yet</h3>
                            <p>Registrations from the ICT Club form will appear here.</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="db-empty">
                            <i className="fas fa-search"></i>
                            <h3>No results found</h3>
                            <p>Try a different search term or filter.</p>
                        </div>
                    ) : (
                        <>
                            <table className="db-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 36 }}>#</th>
                                        <th onClick={() => toggleSort('name')} className="db-th-sort">Name {sortIcon('name')}</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>School</th>
                                        <th onClick={() => toggleSort('track')} className="db-th-sort">Track {sortIcon('track')}</th>
                                        <th onClick={() => toggleSort('date')} className="db-th-sort">Registered {sortIcon('date')}</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paged.map((s, idx) => (
                                        <tr key={s.id} className="db-row">
                                            <td className="db-row-num">{(page - 1) * PER_PAGE + idx + 1}</td>
                                            <td>
                                                <div className="db-name-cell">
                                                    <div className="db-avatar">{s.name.charAt(0).toUpperCase()}</div>
                                                    <span>{s.name}</span>
                                                </div>
                                            </td>
                                            <td className="db-muted">{s.email}</td>
                                            <td className="db-muted">{s.phone || '—'}</td>
                                            <td className="db-muted">{s.school || '—'}</td>
                                            <td>{badge(s.track)}</td>
                                            <td className="db-muted">{formatDate(s.registeredAt)}</td>
                                            <td>
                                                <span className="db-status-badge">
                                                    <span className="db-status-dot"></span>
                                                    {s.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="db-actions">
                                                    <button className="db-btn-view" title="View details" onClick={() => setSelected(s)}>
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button className="db-btn-del" title="Delete" onClick={() => setDeleteId(s.id)}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="db-pagination">
                                    <button className="db-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                        <button key={n} className={`db-pg-btn${n === page ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                                    ))}
                                    <button className="db-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                </div>{/* /db-content */}
            </div>{/* /db-main */}

            {/* STUDENT DETAIL MODAL */}
            <StudentModal student={selected} onClose={() => setSelected(null)} />

            {/* DELETE CONFIRM */}
            {deleteId && (
                <div className="db-overlay" onClick={() => setDeleteId(null)}>
                    <div className="db-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="db-confirm-icon"><i className="fas fa-exclamation-triangle"></i></div>
                        <h4>Delete Student?</h4>
                        <p>This will permanently remove the student record. This action cannot be undone.</p>
                        <div className="db-confirm-btns">
                            <button className="db-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="db-btn-confirm-del" onClick={() => confirmDelete(deleteId)}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
