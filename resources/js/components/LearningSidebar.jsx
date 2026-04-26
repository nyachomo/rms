import { Link, useLocation } from 'react-router-dom';

const NAV = [
    { icon: 'fa-book-open',   label: 'My Courses',     to: '/learn' },
    { icon: 'fa-compass',     label: 'Browse Courses', to: '/courses' },
    { icon: 'fa-user-circle', label: 'My Profile',     to: '/learn/profile' },
];

export default function LearningSidebar({ user, onLogout, collapsed = false, onToggle }) {
    const { pathname } = useLocation();

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div style={{
            width: collapsed ? 64 : 240, flexShrink: 0,
            background: 'linear-gradient(180deg,#061540 0%,#081f4e 100%)',
            display: 'flex', flexDirection: 'column',
            height: '100vh', position: 'sticky', top: 0,
            borderRight: '2px solid #0f2d5e',
            boxShadow: '4px 0 16px rgba(0,0,0,.22)',
            fontFamily: 'Poppins,sans-serif',
            transition: 'width .22s ease',
            overflow: 'hidden',
        }}>

            {/* Brand + collapse button */}
            <div style={{
                padding: collapsed ? '20px 0 16px' : '20px 16px 16px',
                borderBottom: '1px solid rgba(255,255,255,.07)',
                flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: 8,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <img src="/logo/Logo.jpeg" alt="Techsphere"
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }} />
                    {!collapsed && (
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '.95rem', lineHeight: 1.1, whiteSpace: 'nowrap' }}>Techsphere</div>
                            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '.65rem', letterSpacing: '.04em' }}>Learning Portal</div>
                        </div>
                    )}
                </div>

                {!collapsed && onToggle && (
                    <button onClick={onToggle} title="Collapse sidebar" style={{
                        background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
                        color: 'rgba(255,255,255,.5)', borderRadius: 7, width: 28, height: 28,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '.75rem', transition: 'all .18s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.14)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: collapsed ? '14px 6px' : '14px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
                {!collapsed && (
                    <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.12em', padding: '0 14px', marginBottom: 6 }}>
                        Menu
                    </div>
                )}

                {NAV.map(item => {
                    const isActive = item.to === '/learn'
                        ? pathname === '/learn' || (pathname.startsWith('/learn/') && pathname !== '/learn/profile')
                        : pathname === item.to;
                    return (
                        <Link key={item.to} to={item.to} title={collapsed ? item.label : undefined} style={{
                            display: 'flex', alignItems: 'center',
                            gap: collapsed ? 0 : 12,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            padding: collapsed ? '11px 0' : '11px 14px',
                            borderRadius: 10, marginBottom: 3,
                            textDecoration: 'none', fontSize: '.87rem',
                            fontWeight: isActive ? 700 : 400,
                            background: isActive
                                ? 'linear-gradient(135deg,rgba(254,115,12,.28),rgba(254,115,12,.12))'
                                : 'transparent',
                            color: isActive ? '#fe730c' : 'rgba(255,255,255,.62)',
                            border: isActive ? '1px solid rgba(254,115,12,.3)' : '1px solid transparent',
                            transition: 'all .18s',
                        }}>
                            <i className={`fas ${item.icon}`} style={{ width: 18, textAlign: 'center', fontSize: '.88rem', flexShrink: 0 }}></i>
                            {!collapsed && item.label}
                        </Link>
                    );
                })}

                <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '12px 6px' }}></div>

                {!collapsed && (
                    <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.12em', padding: '0 14px', marginBottom: 6 }}>
                        Other
                    </div>
                )}

                <a href="/" title={collapsed ? 'Visit Website' : undefined} style={{
                    display: 'flex', alignItems: 'center',
                    gap: collapsed ? 0 : 12,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '11px 0' : '11px 14px',
                    borderRadius: 10,
                    textDecoration: 'none', fontSize: '.87rem',
                    color: 'rgba(255,255,255,.4)',
                    border: '1px solid transparent', transition: 'all .18s',
                }}>
                    <i className="fas fa-globe" style={{ width: 18, textAlign: 'center', fontSize: '.88rem', flexShrink: 0 }}></i>
                    {!collapsed && 'Visit Website'}
                </a>
            </nav>

            {/* User + Logout */}
            <div style={{
                padding: collapsed ? '14px 0 16px' : '14px 14px 16px',
                borderTop: '1px solid rgba(255,255,255,.07)',
                flexShrink: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: collapsed ? 'center' : 'stretch',
                gap: collapsed ? 8 : 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: collapsed ? 0 : 10 }}>
                    <div title={collapsed ? user?.name : undefined} style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#fe730c,#f97316)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '.8rem', fontWeight: 700,
                    }}>{initials}</div>
                    {!collapsed && (
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontSize: '.83rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '.68rem' }}>
                                {user?.role?.name ?? 'Student'}
                            </div>
                        </div>
                    )}
                </div>

                {collapsed ? (
                    <button onClick={onLogout} title="Sign Out" style={{
                        background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                        color: 'rgba(255,255,255,.5)', borderRadius: 8,
                        width: 36, height: 36, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.85rem', transition: 'all .2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                ) : (
                    <button onClick={onLogout} style={{
                        width: '100%', background: 'rgba(255,255,255,.06)',
                        border: '1px solid rgba(255,255,255,.1)',
                        color: 'rgba(255,255,255,.5)', borderRadius: 8,
                        padding: '8px', cursor: 'pointer',
                        fontSize: '.8rem', fontFamily: 'Poppins,sans-serif',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all .2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}>
                        <i className="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                )}
            </div>
        </div>
    );
}
