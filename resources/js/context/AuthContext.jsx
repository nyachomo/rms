import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [token, setToken]     = useState(() => localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async (currentToken, { invalidateOnFail = false } = {}) => {
        if (!currentToken) return;
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${currentToken}`, Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('unauthorized');
            const data = await res.json();
            setUser(data.user);
        } catch {
            if (invalidateOnFail) {
                localStorage.removeItem('auth_token');
                setToken(null);
                setUser(null);
            }
        }
    }, []);

    // On mount, verify the stored token is still valid
    useEffect(() => {
        if (!token) { setLoading(false); return; }
        fetchMe(token, { invalidateOnFail: true }).finally(() => setLoading(false));
    }, []);

    // Re-fetch permissions when the window regains focus (e.g. admin changed a role in another tab)
    useEffect(() => {
        const onFocus = () => fetchMe(token);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [token, fetchMe]);

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password, password_confirmation) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name, email, password, password_confirmation }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const updateProfile = async (name, email) => {
        const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, email }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        setUser(data.user);
        return data;
    };

    const updatePassword = async (current_password, password, password_confirmation) => {
        const res = await fetch('/api/auth/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ current_password, password, password_confirmation }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        // Store the refreshed token returned after password change
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        return data;
    };

    const logout = async () => {
        if (token) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            }).catch(() => {});
        }
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    /**
     * can('schools', 'view') → true/false
     * null permissions = super-admin (no role assigned) → always true
     */
    const can = useCallback((module, action) => {
        if (!user) return false;
        if (user.permissions === null) return true;           // super-admin
        return user.permissions?.[module]?.[action] ?? false;
    }, [user]);

    const refreshUser = useCallback(() => fetchMe(token), [token, fetchMe]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, updatePassword, can, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
