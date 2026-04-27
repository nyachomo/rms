import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LearningSidebar from '../components/LearningSidebar';
import LearningNavbar from '../components/LearningNavbar';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const INIT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>

  <h1>Hello, World! 🌍</h1>
  <p>Edit the <strong>HTML</strong>, <strong>CSS</strong> and
     <strong>JS</strong> tabs, then click <em>Run</em>.</p>

  <div class="card">
    <h2>Interactive Card</h2>
    <p id="counter-text">You haven't clicked yet.</p>
    <button id="btn">Click Me</button>
  </div>

</body>
</html>`;

const INIT_CSS = `/* --- Base styles --- */
body {
  font-family: Arial, sans-serif;
  padding: 30px;
  background: #f0f2f8;
  color: #333;
}

h1 { color: #081f4e; margin-bottom: 8px; }
p  { color: #555;    margin-bottom: 20px; }

/* --- Card component --- */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 380px;
  box-shadow: 0 4px 16px rgba(0,0,0,.1);
}

.card h2 { color: #081f4e; margin-top: 0; }

button {
  background: #fe730c;
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  transition: background .2s, transform .15s;
}

button:hover { background: #d9600a; }`;

const INIT_JS = `// JavaScript is live inside the preview!
const btn = document.getElementById('btn');
const text = document.getElementById('counter-text');
let clicks = 0;

btn.addEventListener('click', () => {
  clicks++;
  text.textContent =
    \`You clicked \${clicks} time\${clicks === 1 ? '' : 's'} 🎉\`;
  btn.style.transform = 'scale(1.08)';
  setTimeout(() => (btn.style.transform = ''), 150);
});`;

function buildSrcDoc(htmlCode, cssCode, jsCode) {
    let doc = htmlCode;

    // Inject CSS into <head>
    if (doc.includes('</head>')) {
        doc = doc.replace('</head>', `<style>\n${cssCode}\n</style>\n</head>`);
    } else {
        doc = `<style>\n${cssCode}\n</style>\n` + doc;
    }

    // Inject JS before </body>
    if (doc.includes('</body>')) {
        doc = doc.replace('</body>', `<script>\n${jsCode}\n<\/script>\n</body>`);
    } else {
        doc = doc + `\n<script>\n${jsCode}\n<\/script>`;
    }

    return doc;
}

const TABS = [
    { id: 'html', label: 'HTML', icon: 'fa-code',        color: '#e34c26', ext: html() },
    { id: 'css',  label: 'CSS',  icon: 'fa-paint-brush', color: '#264de4', ext: css() },
    { id: 'js',   label: 'JS',   icon: 'fa-bolt',        color: '#f0db4f', ext: javascript() },
];

const PANEL_HEADER = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 14px',
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    flexShrink: 0,
    userSelect: 'none',
};

export default function CodePractice() {
    const { user, token, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [htmlCode, setHtmlCode] = useState(INIT_HTML);
    const [cssCode,  setCssCode]  = useState(INIT_CSS);
    const [jsCode,   setJsCode]   = useState(INIT_JS);
    const [srcDoc,   setSrcDoc]   = useState(() => buildSrcDoc(INIT_HTML, INIT_CSS, INIT_JS));
    const [autoRun,  setAutoRun]  = useState(false);
    const [activeTab, setActiveTab] = useState('html');
    const [toast,    setToast]    = useState(null);

    useEffect(() => {
        if (!authLoading && !token) navigate('/login');
    }, [authLoading, token]);

    useEffect(() => {
        if (!autoRun) return;
        const t = setTimeout(() => setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode)), 700);
        return () => clearTimeout(t);
    }, [htmlCode, cssCode, jsCode, autoRun]);

    const showToast = (msg, color = '#238636') => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 2200);
    };

    const handleRun = () => {
        setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
        showToast('Preview updated!');
    };

    const handleReset = () => {
        setHtmlCode(INIT_HTML);
        setCssCode(INIT_CSS);
        setJsCode(INIT_JS);
        setSrcDoc(buildSrcDoc(INIT_HTML, INIT_CSS, INIT_JS));
        showToast('Reset to starter code.', '#6e40c9');
    };

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const codeForTab = { html: htmlCode, css: cssCode, js: jsCode };
    const setCodeForTab = { html: setHtmlCode, css: setCssCode, js: setJsCode };
    const activeTabMeta = TABS.find(t => t.id === activeTab);

    if (authLoading) return (
        <div style={{ minHeight: '100vh', background: '#081f4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#fe730c' }}></i>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Poppins,sans-serif', background: '#0d1117', overflow: 'hidden' }}>

            <LearningSidebar
                user={user}
                onLogout={handleLogout}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(s => !s)}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                <LearningNavbar
                    page="Code Playground"
                    sidebarCollapsed={sidebarCollapsed}
                    onSidebarToggle={() => setSidebarCollapsed(s => !s)}
                />

                {/* ── Toolbar ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 16px',
                    background: '#161b22',
                    borderBottom: '1px solid #30363d',
                    flexShrink: 0,
                }}>
                    <i className="fas fa-terminal" style={{ color: '#fe730c' }}></i>
                    <span style={{ color: '#c9d1d9', fontSize: '.82rem', fontWeight: 600, flex: 1 }}>
                        HTML · CSS · JavaScript Playground
                    </span>

                    {/* Auto-run toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#8b949e', fontSize: '.78rem' }}>
                        <div
                            role="switch"
                            aria-checked={autoRun}
                            onClick={() => setAutoRun(v => !v)}
                            style={{
                                width: 34, height: 18, borderRadius: 9,
                                background: autoRun ? '#fe730c' : '#30363d',
                                position: 'relative', cursor: 'pointer', transition: 'background .2s',
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 2,
                                left: autoRun ? 18 : 2,
                                width: 14, height: 14, borderRadius: '50%',
                                background: '#fff', transition: 'left .2s',
                            }} />
                        </div>
                        Auto-run
                    </label>

                    <button
                        onClick={handleReset}
                        style={{
                            background: 'transparent', border: '1px solid #30363d',
                            color: '#8b949e', borderRadius: 6, padding: '5px 14px',
                            cursor: 'pointer', fontSize: '.78rem', fontFamily: 'Poppins,sans-serif',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'all .18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b949e'; e.currentTarget.style.color = '#c9d1d9'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
                    >
                        <i className="fas fa-undo" style={{ fontSize: '.7rem' }}></i> Reset
                    </button>

                    <button
                        onClick={handleRun}
                        style={{
                            background: '#fe730c', border: 'none',
                            color: '#fff', borderRadius: 6, padding: '5px 18px',
                            cursor: 'pointer', fontSize: '.82rem', fontWeight: 700,
                            fontFamily: 'Poppins,sans-serif',
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: '0 2px 8px rgba(254,115,12,.35)',
                            transition: 'opacity .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                        <i className="fas fa-play" style={{ fontSize: '.7rem' }}></i> Run
                    </button>
                </div>

                {/* ── Main split pane ── */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

                    {/* Left: tabbed editor */}
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #30363d', minWidth: 0 }}>

                        {/* Tab bar */}
                        <div style={{ display: 'flex', background: '#161b22', borderBottom: '1px solid #30363d', flexShrink: 0 }}>
                            {TABS.map(tab => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            background: active ? '#0d1117' : 'transparent',
                                            border: 'none',
                                            borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
                                            color: active ? '#c9d1d9' : '#8b949e',
                                            padding: '9px 22px',
                                            cursor: 'pointer',
                                            fontSize: '.8rem',
                                            fontFamily: 'Poppins,sans-serif',
                                            fontWeight: active ? 600 : 400,
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            transition: 'all .15s',
                                        }}
                                    >
                                        <i className={`fas ${tab.icon}`} style={{ color: tab.color, fontSize: '.75rem' }}></i>
                                        {tab.label}
                                    </button>
                                );
                            })}

                            {/* Keyboard shortcut hint */}
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 14, color: '#484f58', fontSize: '.68rem' }}>
                                Ctrl+Enter to run
                            </div>
                        </div>

                        {/* Editor area */}
                        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                            <CodeMirror
                                key={activeTab}
                                value={codeForTab[activeTab]}
                                height="100%"
                                extensions={[activeTabMeta.ext]}
                                theme={oneDark}
                                onChange={setCodeForTab[activeTab]}
                                style={{ fontSize: 13, height: '100%' }}
                                basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true, bracketMatching: true }}
                                onKeyDown={e => {
                                    if (e.ctrlKey && e.key === 'Enter') {
                                        e.preventDefault();
                                        setSrcDoc(buildSrcDoc(htmlCode, cssCode, jsCode));
                                        showToast('Preview updated!');
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: preview */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ ...PANEL_HEADER, gap: 10 }}>
                            <div style={{ display: 'flex', gap: 5, marginRight: 6 }}>
                                {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                                ))}
                            </div>
                            <i className="fas fa-eye" style={{ color: '#8b949e', fontSize: '.78rem' }}></i>
                            <span style={{ color: '#8b949e', fontSize: '.78rem', fontWeight: 600 }}>Preview</span>
                            {autoRun && (
                                <span style={{ marginLeft: 'auto', fontSize: '.68rem', color: '#fe730c', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <i className="fas fa-circle" style={{ fontSize: '.45rem' }}></i> live
                                </span>
                            )}
                        </div>

                        <iframe
                            key={srcDoc}
                            srcDoc={srcDoc}
                            title="Live Preview"
                            sandbox="allow-scripts"
                            style={{ flex: 1, border: 'none', background: '#fff', width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 28, right: 28,
                    background: toast.color,
                    color: '#fff', padding: '10px 20px',
                    borderRadius: 8, fontSize: '.82rem', fontFamily: 'Poppins,sans-serif',
                    boxShadow: '0 4px 16px rgba(0,0,0,.3)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    zIndex: 9999,
                }}>
                    <i className="fas fa-check-circle"></i>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
