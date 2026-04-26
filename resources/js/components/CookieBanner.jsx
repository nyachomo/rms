import { useState, useEffect } from 'react';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('cookies')) {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookies', '1');
        setVisible(false);
    };

    const decline = () => setVisible(false);

    if (!visible) return null;

    return (
        <div id="cookie-banner">
            <p>🍪 We use cookies to improve your experience on our website. By continuing to browse, you agree to our <a href="#" style={{ color: 'var(--red)' }}>Cookie Policy</a>.</p>
            <button className="btn btn-primary" onClick={accept}>Accept</button>
            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,.3)', color: 'rgba(255,255,255,.7)', padding: '9px 18px' }} onClick={decline}>Decline</button>
        </div>
    );
}
