import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', program: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setForm({ first_name: '', last_name: '', email: '', phone: '', program: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <>
            {/* PAGE BANNER */}
            <div className="page-banner" style={{ marginTop: '128px', position: 'relative', height: '260px', background: 'linear-gradient(135deg, #081f4e 0%, #0d2a6e 60%, #0b2060 100%)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center 35%', opacity: 0.35 }}></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,15,50,0.75) 0%, rgba(5,15,50,0.50) 60%, rgba(5,15,50,0.30) 100%)' }}></div>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
                    <div>
                        <div className="page-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '.83rem', marginBottom: '12px' }}>
                            <Link to="/" style={{ color: 'rgba(255,255,255,.78)', textDecoration: 'none' }}>Home</Link>
                            <span style={{ color: 'var(--red)', fontWeight: 700 }}>›</span>
                            <span style={{ color: 'var(--red)', fontWeight: 600 }}>Contact</span>
                        </div>
                        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: '#fff', letterSpacing: '.5px', textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>Contacts</h1>
                    </div>
                    <div className="page-quicklinks">
                        <h5>Quick Links</h5>
                        <hr />
                        <div className="quicklinks-row">
                            <Link to="/courses"><i className="fas fa-chevron-right"></i> Our Courses</Link>
                            <Link to="/#about"><i className="fas fa-chevron-right"></i> About Us</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTACT SECTION */}
            <section className="contact-section">
                <div className="container">
                    <div className="contact-wrap">
                        {/* Info Panel */}
                        <div className="info-panel">
                            <h3 className="info-panel-title">Contact Information</h3>
                            <p className="info-panel-sub">Reach out to us through any of the channels below and we'll get back to you shortly.</p>
                            <div className="info-stack">
                                {[
                                    { icon: 'fas fa-map-marker-alt', label: 'Our Location', value: 'Garden Estate, Nairobi, Kenya', href: null },
                                    { icon: 'fas fa-phone-alt', label: 'Phone Number', value: '+254 748-800-500', href: 'tel:+254748800500' },
                                    { icon: 'fas fa-envelope', label: 'Email Address', value: 'info@techsphereacademy.com', href: 'mailto:info@techsphereacademy.com' },
                                    { icon: 'fas fa-clock', label: 'Working Hours', value: 'Mon – Fri: 8:00 AM – 6:00 PM\nSaturday: 9:00 AM – 1:00 PM', href: null },
                                ].map((item, i) => (
                                    <div key={i} className="info-card">
                                        <div className="info-icon"><i className={item.icon}></i></div>
                                        <div>
                                            <h4>{item.label}</h4>
                                            {item.href
                                                ? <a href={item.href}>{item.value}</a>
                                                : <p style={{ whiteSpace: 'pre-line' }}>{item.value}</p>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="social-section">
                                <p className="social-label">Follow Us</p>
                                <div className="social-row">
                                    {['fab fa-linkedin-in', 'fab fa-twitter', 'fab fa-facebook-f', 'fab fa-instagram', 'fab fa-youtube'].map((icon, i) => (
                                        <a key={i} href="#" className="social-pill"><i className={icon}></i></a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="form-card">
                            <div className="form-card-header">
                                <h3>Send Us a Message</h3>
                                <p>Fill in the form below and our team will get back to you within 24 hours.</p>
                            </div>
                            <form onSubmit={submit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" name="first_name" placeholder="John" required value={form.first_name} onChange={handle} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" name="last_name" placeholder="Doe" required value={form.last_name} onChange={handle} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" name="email" placeholder="john@company.com" required value={form.email} onChange={handle} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" name="phone" placeholder="+254 700 000 000" value={form.phone} onChange={handle} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Training Program of Interest</label>
                                    <select name="program" value={form.program} onChange={handle}>
                                        <option value="">Select a program...</option>
                                        <option>Data Analysis</option>
                                        <option>Web Development</option>
                                        <option>Cybersecurity</option>
                                        <option>Digital Marketing</option>
                                        <option>AI &amp; Machine Learning</option>
                                        <option>UI/UX Design</option>
                                        <option>Corporate Training</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Your Message</label>
                                    <textarea name="message" placeholder="Tell us about your training needs and how we can help..." value={form.message} onChange={handle}></textarea>
                                </div>
                                <button type="submit" className="btn-submit" disabled={status === 'loading'}>
                                    {status === 'loading'
                                        ? <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                                        : <><i className="fas fa-paper-plane"></i> Send Message</>
                                    }
                                </button>
                                {status === 'success' && (
                                    <div className="form-success" style={{ display: 'block' }}>
                                        <i className="fas fa-check-circle"></i> Thank you! Your message has been sent. We'll get back to you within 24 hours.
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="form-success" style={{ display: 'block', background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }}>
                                        <i className="fas fa-exclamation-circle"></i> Something went wrong. Please try again or call us directly.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAP */}
            <section className="map-section">
                <div className="container">
                    <div className="map-wrap">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6864661415!2d36.87!3d-1.245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTQnNDIuMCJTIDM2wrA1MicxMi4wIkU!5e0!3m2!1sen!2ske!4v1234567890"
                            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            title="Techsphere Location — Garden Estate, Nairobi"
                        ></iframe>
                    </div>
                </div>
            </section>
        </>
    );
}
