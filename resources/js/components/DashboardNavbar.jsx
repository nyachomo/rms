import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardNavbar({ page }) {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const dateStr = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const toggleSidebar = () => {
        const next = !document.body.classList.contains('sidebar-collapsed');
        document.body.classList.toggle('sidebar-collapsed', next);
        localStorage.setItem('sidebar_collapsed', String(next));
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: next } }));
    };

    return (
        <div className="db-navbar">
            <div className="db-navbar-left">
                {/* Sidebar toggle */}
                <button
                    onClick={toggleSidebar}
                    title="Toggle sidebar"
                    style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: '#f1f5f9', border: '1.5px solid #e4e7f0',
                        color: '#64748b', cursor: 'pointer', fontSize: '.9rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginRight: 12, transition: 'all .2s', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8edf5'; e.currentTarget.style.color = '#081f4e'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <i className="fas fa-bars"></i>
                </button>

                <div className="db-navbar-breadcrumb">
                    <Link to="/dashboard"><i className="fas fa-home"></i></Link>
                    <i className="fas fa-chevron-right"></i>
                    <span>{page}</span>
                </div>
            </div>
            <div className="db-navbar-right">
                <div className="db-navbar-date">
                    <i className="fas fa-calendar-alt" style={{ marginRight: 6, color: '#fe730c' }}></i>
                    {dateStr}
                </div>
                <div className="db-navbar-divider"></div>
                {user && (
                    <div className="db-navbar-user">
                        <div className="db-navbar-user-info">
                            <strong>{user.name}</strong>
                            <small>{user?.role?.name ?? 'Super Admin'}</small>
                        </div>
                        <div className="db-navbar-avatar">{initials}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
