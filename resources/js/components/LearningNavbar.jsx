import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LearningNavbar({ page = 'My Courses', sidebarCollapsed = false, onSidebarToggle }) {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const dateStr = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div style={{
            height: 62, background: '#fff', borderBottom: '1.5px solid #e8edf5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px 0 20px', flexShrink: 0,
            boxShadow: '0 1px 8px rgba(8,31,78,.05)',
            gap: 12,
        }}>

            {/* Left — sidebar toggle + breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {onSidebarToggle && (
                    <button
                        onClick={onSidebarToggle}
                        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        style={{
                            width: 36, height: 36, borderRadius: 9, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: sidebarCollapsed ? 'rgba(8,31,78,.07)' : 'transparent',
                            border: '1.5px solid #e8edf5',
                            color: '#6b7280', fontSize: '.9rem', flexShrink: 0,
                            transition: 'all .18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#081f4e'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = sidebarCollapsed ? 'rgba(8,31,78,.07)' : 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                    >
                        <i className={`fas fa-${sidebarCollapsed ? 'indent' : 'outdent'}`}></i>
                    </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem' }}>
                    <Link to="/learn" style={{ color: '#fe730c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className="fas fa-home" style={{ fontSize: '.8rem' }}></i>
                        Learning Portal
                    </Link>
                    <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '.65rem' }}></i>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{page}</span>
                </div>
            </div>

            {/* Right — date + user */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ fontSize: '.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fas fa-calendar-alt" style={{ color: '#fe730c' }}></i>
                    {dateStr}
                </div>

                <div style={{ width: 1, height: 28, background: '#e8edf5' }}></div>

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '.83rem', fontWeight: 700, color: '#081f4e', lineHeight: 1.2 }}>{user.name}</div>
                            <div style={{ fontSize: '.7rem', color: '#94a3b8', lineHeight: 1 }}>{user?.role?.name ?? 'Student'}</div>
                        </div>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#fe730c,#f97316)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '.82rem', fontWeight: 700, flexShrink: 0,
                        }}>{initials}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
