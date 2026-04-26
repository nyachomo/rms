import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate  = useNavigate();

    const [form, setForm]       = useState({ email: '', password: '' });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            const roleName = (user?.role?.name ?? '').toLowerCase();
            const isStudent = roleName.includes('student') || roleName.includes('learner');
            navigate(isStudent ? '/learn' : '/dashboard');
        } catch (err) {
            setErrors(err.errors || { email: [err.message || 'Login failed.'] });
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
                    <h2>Welcome back</h2>
                    <p>Sign in to your Techsphere admin account</p>
                </div>

                <form onSubmit={submit} className="auth-form">
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
                                placeholder="••••••••"
                                value={form.password} onChange={handle}
                            />
                        </div>
                        {errors.password && <span className="auth-error">{errors.password[0]}</span>}
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading
                            ? <><i className="fas fa-circle-notch fa-spin"></i> Signing in…</>
                            : <><i className="fas fa-sign-in-alt"></i> Sign In</>
                        }
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
