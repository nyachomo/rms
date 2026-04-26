import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate     = useNavigate();

    const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.password_confirmation);
            navigate('/dashboard');
        } catch (err) {
            setErrors(err.errors || { name: [err.message || 'Registration failed.'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card-head">
                    <div className="auth-logo">
                        <img src="/logo/Logo.jpeg" alt="Techsphere" />
                    </div>
                    <h2>Create an account</h2>
                    <p>Set up your Techsphere admin account</p>
                </div>

                <form onSubmit={submit} className="auth-form">
                    <div className="auth-field">
                        <label>Full Name</label>
                        <div className="auth-input-wrap">
                            <i className="fas fa-user"></i>
                            <input
                                type="text" name="name" required
                                placeholder="Jane Mwangi"
                                value={form.name} onChange={handle}
                            />
                        </div>
                        {errors.name && <span className="auth-error">{errors.name[0]}</span>}
                    </div>

                    <div className="auth-field">
                        <label>Email Address</label>
                        <div className="auth-input-wrap">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email" name="email" required
                                placeholder="you@example.com"
                                value={form.email} onChange={handle}
                            />
                        </div>
                        {errors.email && <span className="auth-error">{errors.email[0]}</span>}
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrap">
                            <i className="fas fa-lock"></i>
                            <input
                                type="password" name="password" required
                                placeholder="Min. 8 characters"
                                value={form.password} onChange={handle}
                            />
                        </div>
                        {errors.password && <span className="auth-error">{errors.password[0]}</span>}
                    </div>

                    <div className="auth-field">
                        <label>Confirm Password</label>
                        <div className="auth-input-wrap">
                            <i className="fas fa-lock"></i>
                            <input
                                type="password" name="password_confirmation" required
                                placeholder="Repeat your password"
                                value={form.password_confirmation} onChange={handle}
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading
                            ? <><i className="fas fa-circle-notch fa-spin"></i> Creating account…</>
                            : <><i className="fas fa-user-plus"></i> Create Account</>
                        }
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
