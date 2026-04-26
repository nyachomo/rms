import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, can } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className={scrolled ? 'scrolled' : ''}>
                {/* TOP BAR */}
                <div className="top-bar">
                    <div className="top-bar-inner">
                        <div className="top-bar-left">
                            <a href="tel:+254748800500"><i className="fas fa-phone-alt"></i> +254 748-800-500</a>
                            <a href="mailto:info@techsphereademy.com"><i className="fas fa-envelope"></i> info@techsphereademy.com</a>
                        </div>
                        <div className="top-bar-right">
                            <div className="top-bar-tagline"><i className="fas fa-map-marker-alt"></i> Nairobi's #1 Digital Skills Academy</div>
                            <div className="top-social">
                                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                                <a href="#"><i className="fab fa-twitter"></i></a>
                                <a href="#"><i className="fab fa-facebook-f"></i></a>
                                <a href="#"><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN NAV */}
                <div className="main-nav">
                    <div className="main-nav-inner">
                        <Link to="/" className="logo">
                            <img src="/logo/Logo.jpeg" alt="Techsphere Digital Skills Academy Logo" style={{ height: '82px', width: '82px', objectFit: 'contain', borderRadius: '50%' }} />
                            <div className="logo-text">
                                <span className="logo-title">TECHSPHERE</span>
                                <small>Digital Skills Academy</small>
                            </div>
                        </Link>

                        <ul className="nav-links">
                            <li><Link to="/" className={isActive('/') ? 'active' : ''}><i className="fas fa-home"></i> Home</Link></li>
                            <li><Link to="/#about" onClick={() => setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100)}><i className="fas fa-info-circle"></i> About</Link></li>
                            <li><Link to="/courses" className={isActive('/courses') ? 'active' : ''}><i className="fas fa-graduation-cap"></i> Our Courses/Programs</Link></li>
                            <li><Link to="/ict-club" className={isActive('/ict-club') ? 'active' : ''}><i className="fas fa-laptop-code"></i> ICT Club</Link></li>
                            <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}><i className="fas fa-envelope"></i> Contact</Link></li>
                        </ul>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {user && can('learning', 'view') && (
                                <Link to="/learn" style={{ background: 'linear-gradient(135deg,#081f4e,#0d2d6b)', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <i className="fas fa-graduation-cap"></i> My Learning
                                </Link>
                            )}
                            <a href="tel:+254748800500" className="btn-callus"><i className="fas fa-phone-alt"></i> Call us</a>
                            <div className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} id="ham">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* MOBILE MENU */}
            <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobile-menu">
                <Link to="/" onClick={() => setMenuOpen(false)}><i className="fas fa-home"></i> Home</Link>
                <Link to="/courses" onClick={() => setMenuOpen(false)}><i className="fas fa-graduation-cap"></i> Our Courses/Programs</Link>
                <Link to="/ict-club" onClick={() => setMenuOpen(false)}><i className="fas fa-laptop-code"></i> ICT Club</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}><i className="fas fa-envelope"></i> Contact</Link>
                {user && can('learning', 'view') && <Link to="/learn" onClick={() => setMenuOpen(false)}><i className="fas fa-graduation-cap"></i> My Learning</Link>}
            </div>
        </>
    );
}
