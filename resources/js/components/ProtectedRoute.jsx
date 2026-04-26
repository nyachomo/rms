import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f8' }}>
                <div style={{ textAlign: 'center', fontFamily: 'Poppins,sans-serif', color: '#081f4e' }}>
                    <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#fe730c', marginBottom: 16, display: 'block' }}></i>
                    Verifying session…
                </div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}
