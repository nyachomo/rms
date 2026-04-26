import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer>
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="logo" style={{ alignItems: 'center' }}>
                            <img src="/logo/Logo.jpeg" alt="Techsphere Logo" style={{ height: '52px', width: '52px', objectFit: 'contain', borderRadius: '50%' }} />
                            <div className="logo-text" style={{ color: '#fff' }}>
                                <span className="logo-title">TECHSPHERE</span>
                                <small style={{ color: 'var(--red)' }}>Digital Skills Academy</small>
                            </div>
                        </Link>
                        <p>Empowering the next generation of tech professionals with practical, industry-led digital skills training. Transform your career with Techsphere.</p>
                        <div className="social-links" style={{ marginTop: '20px' }}>
                            <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>
                    <div className="footer-col">
                        <h4>Courses</h4>
                        <ul>
                            <li><Link to="/courses/data-analysis"><i className="fas fa-chevron-right"></i> Data Analysis</Link></li>
                            <li><Link to="/courses/web-development"><i className="fas fa-chevron-right"></i> Web Development</Link></li>
                            <li><Link to="/courses/cybersecurity"><i className="fas fa-chevron-right"></i> Cybersecurity</Link></li>
                            <li><Link to="/courses/digital-marketing"><i className="fas fa-chevron-right"></i> Digital Marketing</Link></li>
                            <li><Link to="/courses/ai-ml"><i className="fas fa-chevron-right"></i> AI &amp; Machine Learning</Link></li>
                            <li><Link to="/courses/uiux-design"><i className="fas fa-chevron-right"></i> UI/UX Design</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/#about"><i className="fas fa-chevron-right"></i> About Us</Link></li>
                            <li><Link to="/#values"><i className="fas fa-chevron-right"></i> Our Values</Link></li>
                            <li><Link to="/#how"><i className="fas fa-chevron-right"></i> How We Work</Link></li>
                            <li><Link to="/contact"><i className="fas fa-chevron-right"></i> Contact Us</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li><a href="#"><i className="fas fa-map-marker-alt"></i> Garden Estate, Nairobi</a></li>
                            <li><a href="tel:+254748800500"><i className="fas fa-phone-alt"></i> +254 748-800-500</a></li>
                            <li><a href="mailto:info@techsphereademy.com"><i className="fas fa-envelope"></i> info@techsphereademy.com</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 <span>Techsphere Digital Skills Academy</span>. All rights reserved. Excellence in every engagement.</p>
                    <p>
                        <a href="#" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Privacy Policy</a>
                        &nbsp;|&nbsp;
                        <a href="#" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terms of Service</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
