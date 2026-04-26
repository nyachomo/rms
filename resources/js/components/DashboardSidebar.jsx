import { useState, useMemo, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GROUPS = [
    {
        key: 'overview',
        label: 'Overview',
        icon: 'fas fa-th-large',
        items: [
            { label: 'Dashboard', to: '/dashboard', icon: 'fas fa-chart-pie', end: true, perm: null },
        ],
    },
    {
        key: 'people',
        label: 'People',
        icon: 'fas fa-users',
        items: [
            { label: 'Students', to: '/dashboard',          icon: 'fas fa-user-graduate',      end: true, perm: ['students', 'view'] },
            { label: 'Teachers', to: '/dashboard/teachers', icon: 'fas fa-chalkboard-teacher',            perm: ['teachers', 'view'] },
        ],
    },
    {
        key: 'academic',
        label: 'Academic',
        icon: 'fas fa-graduation-cap',
        items: [
            { label: 'Classes',           to: '/dashboard/classes',           icon: 'fas fa-chalkboard',      perm: ['classes',           'view'] },
            { label: 'Program Events',    to: '/dashboard/program-events',    icon: 'fas fa-calendar-alt',    perm: ['program_events',    'view'] },
            { label: 'Courses',           to: '/dashboard/courses',           icon: 'fas fa-book-open',       perm: ['courses',           'view'] },
            { label: 'Course Categories', to: '/dashboard/course-categories', icon: 'fas fa-tags',            perm: ['course_categories', 'view'] },
            { label: 'Intakes',           to: '/dashboard/intakes',           icon: 'fas fa-calendar-check',  perm: ['intakes',           'view'] },
            { label: 'Enrollments',       to: '/dashboard/enrollments',       icon: 'fas fa-file-alt',        perm: ['enrollments',       'view'] },
        ],
    },
    {
        key: 'ict_club',
        label: 'ICT Club',
        icon: 'fas fa-laptop-code',
        items: [
            { label: 'ICT Club', to: '/dashboard/ict-club', icon: 'fas fa-laptop-code', perm: ['ict_club', 'view'] },
        ],
    },
    {
        key: 'schools',
        label: 'Schools',
        icon: 'fas fa-school',
        items: [
            { label: 'Schools',           to: '/dashboard/schools',           icon: 'fas fa-school',      perm: ['schools',           'view'] },
            { label: 'School Categories', to: '/dashboard/school-categories', icon: 'fas fa-tags',        perm: ['school_categories', 'view'] },
            { label: 'School Levels',     to: '/dashboard/school-levels',     icon: 'fas fa-layer-group', perm: ['school_levels',     'view'] },
        ],
    },
    {
        key: 'admin',
        label: 'Administration',
        icon: 'fas fa-user-shield',
        items: [
            { label: 'Roles', to: '/dashboard/roles', icon: 'fas fa-user-shield', perm: ['roles', 'view'] },
            { label: 'Users', to: '/dashboard/users', icon: 'fas fa-users-cog',   perm: ['users', 'view'] },
        ],
    },
    {
        key: 'content',
        label: 'Content',
        icon: 'fas fa-globe',
        items: [
            { label: 'Home Page', to: '/dashboard/homepage', icon: 'fas fa-home', perm: ['homepage', 'view'] },
            { label: 'Settings',  to: '/dashboard/settings', icon: 'fas fa-cog',  perm: ['settings', 'view'] },
        ],
    },
];

export default function DashboardSidebar() {
    const { user, can, logout } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    const [search, setSearch]         = useState('');
    const [openGroups, setOpenGroups] = useState({});
    const [collapsed, setCollapsed]   = useState(
        () => localStorage.getItem('sidebar_collapsed') === 'true'
    );

    /* Sync collapsed class onto body so db-main can adjust its margin */
    useEffect(() => {
        document.body.classList.toggle('sidebar-collapsed', collapsed);
        return () => document.body.classList.remove('sidebar-collapsed');
    }, [collapsed]);

    /* Listen for toggle events fired by DashboardNavbar */
    useEffect(() => {
        const handler = e => setCollapsed(e.detail.collapsed);
        window.addEventListener('sidebar-toggle', handler);
        return () => window.removeEventListener('sidebar-toggle', handler);
    }, []);

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const toggle = key => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
    const handleLogout = async () => { await logout(); navigate('/login'); };
    const navClass = ({ isActive }) => `db-nav-item${isActive ? ' active' : ''}`;

    const query = search.trim().toLowerCase();
    const filteredGroups = useMemo(() => {
        if (!query) return null;
        const results = [];
        GROUPS.forEach(g => {
            g.items.forEach(item => {
                if (item.label.toLowerCase().includes(query) &&
                    (!item.perm || can(item.perm[0], item.perm[1]))) {
                    results.push(item);
                }
            });
        });
        return results;
    }, [query, can]);

    const visibleGroups = GROUPS.filter(g =>
        g.items.some(item => !item.perm || can(item.perm[0], item.perm[1]))
    );

    const activeGroupKey = useMemo(() => {
        for (const g of GROUPS) {
            for (const item of g.items) {
                const exact = item.end
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);
                if (exact) return g.key;
            }
        }
        return null;
    }, [location.pathname]);

    /* All permitted nav items flattened — used in collapsed mode */
    const allItems = useMemo(() => {
        const items = [];
        GROUPS.forEach(g => {
            g.items.forEach(item => {
                if (!item.perm || can(item.perm[0], item.perm[1])) items.push(item);
            });
        });
        items.push({ label: 'My Profile', to: '/dashboard/profile', icon: 'fas fa-user-cog', end: false, perm: null });
        return items;
    }, [can]);

    return (
        <aside className={`db-sidebar${collapsed ? ' collapsed' : ''}`}>

            {/* Brand */}
            <div className="db-sidebar-brand">
                <div className="db-sidebar-icon"><i className="fas fa-laptop-code"></i></div>
                {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>Techsphere</strong>
                        <small>Admin Dashboard</small>
                    </div>
                )}
            </div>

            {/* Search — hidden when collapsed */}
            {!collapsed && (
                <div className="db-sidebar-search-wrap">
                    <i className="fas fa-search db-sidebar-search-icon"></i>
                    <input
                        className="db-sidebar-search"
                        type="text"
                        placeholder="Search menu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="db-sidebar-search-clear" onClick={() => setSearch('')}>
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            )}

            {/* Nav */}
            <nav className="db-nav" style={{ paddingTop: 6 }}>

                {/* ── COLLAPSED MODE: flat icon list with tooltips ── */}
                {collapsed ? (
                    <div className="db-nav-collapsed">
                        {allItems.map(item => (
                            <NavLink
                                key={item.to + (item.end ? '-end' : '')}
                                to={item.to}
                                end={item.end}
                                className={navClass}
                                title={item.label}
                            >
                                <i className={item.icon}></i>
                                <span className="db-collapsed-tooltip">{item.label}</span>
                            </NavLink>
                        ))}
                        <a href="/" className="db-nav-item" title="View Website">
                            <i className="fas fa-globe"></i>
                            <span className="db-collapsed-tooltip">View Website</span>
                        </a>
                    </div>
                ) : (

                /* ── EXPANDED MODE: search results or grouped accordion ── */
                filteredGroups !== null ? (
                    filteredGroups.length === 0 ? (
                        <div className="db-nav-no-results">
                            <i className="fas fa-search"></i>
                            <span>No results for "{search}"</span>
                        </div>
                    ) : (
                        filteredGroups.map(item => (
                            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                            </NavLink>
                        ))
                    )
                ) : (
                    visibleGroups.map(group => {
                        const visibleItems = group.items.filter(
                            item => !item.perm || can(item.perm[0], item.perm[1])
                        );
                        if (visibleItems.length === 0) return null;

                        const isOpen = openGroups[group.key] ?? false;
                        const isGroupActive = group.key === activeGroupKey;

                        return (
                            <div key={group.key} className="db-nav-group">
                                <button
                                    className={`db-nav-group-toggle${isGroupActive ? ' group-active' : ''}`}
                                    onClick={() => toggle(group.key)}
                                >
                                    <span className="db-nav-group-left">
                                        <i className={group.icon}></i>
                                        <span>{group.label}</span>
                                    </span>
                                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} db-nav-group-chevron`}></i>
                                </button>

                                <div className={`db-nav-group-items${isOpen ? ' open' : ''}`}>
                                    <div>
                                        {visibleItems.map(item => (
                                            <NavLink
                                                key={item.to + (item.end ? '-end' : '')}
                                                to={item.to}
                                                end={item.end}
                                                className={navClass}
                                            >
                                                <i className={item.icon}></i>
                                                <span>{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ))}

                {/* Profile & Site — expanded mode only */}
                {!collapsed && !filteredGroups && (
                    <>
                        <div className="db-nav-section-label" style={{ marginTop: 8 }}>Account</div>
                        <NavLink to="/dashboard/profile" className={navClass}>
                            <i className="fas fa-user-cog"></i>
                            <span>My Profile</span>
                        </NavLink>
                        <div className="db-nav-section-label">Site</div>
                        <a href="/" className="db-nav-item">
                            <i className="fas fa-globe"></i>
                            <span>View Website</span>
                        </a>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="db-sidebar-footer">
                {user && !collapsed && (
                    <div className="db-user-chip">
                        <div className="db-navbar-avatar" style={{ width: 32, height: 32, fontSize: '.78rem', flexShrink: 0 }}>
                            {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontSize: '.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                )}
                {user && collapsed && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                        <div className="db-navbar-avatar" style={{ width: 32, height: 32, fontSize: '.78rem' }} title={user.name}>
                            {initials}
                        </div>
                    </div>
                )}
                <button
                    className="db-nav-item db-logout-btn"
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                    style={collapsed ? { justifyContent: 'center' } : {}}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
