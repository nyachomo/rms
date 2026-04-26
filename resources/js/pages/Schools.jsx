import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div className="profile-toast" style={{ background: isError ? '#fef2f2' : '#f0fdf4', borderColor: isError ? '#fca5a5' : '#86efac' }}>
            <i className={`fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}`}
               style={{ color: isError ? '#dc2626' : '#16a34a' }}></i>
            <span style={{ color: isError ? '#991b1b' : '#15803d' }}>{message}</span>
            <button onClick={onClose} className="profile-toast-close"><i className="fas fa-times"></i></button>
        </div>
    );
}

/* ── ImportModal ─────────────────────────────────────────── */
function ImportModal({ onClose, onImported, token, categories, levels }) {
    const [file, setFile]               = useState(null);
    const [dragOver, setDragOver]       = useState(false);
    const [stage, setStage]             = useState('pick'); // pick | uploading | result
    const [progress, setProgress]       = useState(0);      // 0–100
    const [serverBusy, setServerBusy]   = useState(false);
    const [result, setResult]           = useState(null);   // { imported, errors, message }
    const [importCategory, setImportCategory] = useState('');
    const [importLevel, setImportLevel]       = useState('');
    const inputRef                      = useRef(null);
    const xhrRef                        = useRef(null);

    const ACCEPTED = '.csv,.xlsx,.xls';

    const pickFile = f => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(ext)) {
            alert('Please upload a .csv, .xlsx, or .xls file.');
            return;
        }
        setFile(f);
    };

    const onDrop = e => {
        e.preventDefault();
        setDragOver(false);
        pickFile(e.dataTransfer.files[0]);
    };

    const downloadTemplate = async () => {
        const res = await fetch('/api/schools/template', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'schools_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const submit = () => {
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        if (importCategory) fd.append('school_category_id', importCategory);
        if (importLevel)    fd.append('school_level_id', importLevel);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = e => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                setProgress(pct);
                if (pct === 100) setServerBusy(true);
            }
        };

        xhr.onload = () => {
            xhrRef.current = null;
            try {
                const data = JSON.parse(xhr.responseText);
                setResult(data);
                if (data.success) onImported();
            } catch {
                setResult({ success: false, message: 'Unexpected server response.', errors: [] });
            }
            setStage('result');
        };

        xhr.onerror = () => {
            xhrRef.current = null;
            setResult({ success: false, message: 'Upload failed. Please try again.', errors: [] });
            setStage('result');
        };

        xhr.open('POST', '/api/schools/import');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(fd);

        setProgress(0);
        setServerBusy(false);
        setStage('uploading');
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal schools-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, position: 'relative' }}>
                {/* Close button anchored to modal card */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 14, right: 14, zIndex: 10,
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#f3f4f6', border: 'none', cursor: 'pointer',
                        fontSize: '.9rem', color: '#666',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .2s, color .2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fe730c'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#666'; }}
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="db-modal-header">
                    <h3><i className="fas fa-file-import"></i> Import Schools</h3>
                </div>

                {stage === 'pick' && (
                    <div style={{ padding: '24px 28px 28px' }}>
                        {/* Instructions */}
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '.85rem', color: '#1e40af' }}>
                            <i className="fas fa-info-circle" style={{ marginRight: 7 }}></i>
                            Upload a <strong>CSV or Excel</strong> file with columns:&nbsp;
                            <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>school_name</code>,&nbsp;
                            <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>school_location</code>,&nbsp;
                            <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>school_contact_person</code>,&nbsp;
                            <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>school_status</code>&nbsp;
                            (optional, defaults to <em>active</em>). The first row must be the header row.
                        </div>

                        {/* Category & Level assignment */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                            <div className="profile-field" style={{ marginBottom:0 }}>
                                <label style={{ fontSize:'.82rem', color:'#374151', fontWeight:600 }}>
                                    <i className="fas fa-tags" style={{ marginRight:5, color:'#7c3aed' }}></i>
                                    Assign Category
                                </label>
                                <div className="profile-input-wrap" style={{ marginTop:5 }}>
                                    <i className="fas fa-tags"></i>
                                    <select value={importCategory} onChange={e => setImportCategory(e.target.value)}>
                                        <option value="">— None —</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <i className="fas fa-chevron-down select-arrow"></i>
                                </div>
                            </div>
                            <div className="profile-field" style={{ marginBottom:0 }}>
                                <label style={{ fontSize:'.82rem', color:'#374151', fontWeight:600 }}>
                                    <i className="fas fa-layer-group" style={{ marginRight:5, color:'#059669' }}></i>
                                    Assign Level
                                </label>
                                <div className="profile-input-wrap" style={{ marginTop:5 }}>
                                    <i className="fas fa-layer-group"></i>
                                    <select value={importLevel} onChange={e => setImportLevel(e.target.value)}>
                                        <option value="">— None —</option>
                                        {levels.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                    <i className="fas fa-chevron-down select-arrow"></i>
                                </div>
                            </div>
                        </div>

                        {/* Template download */}
                        <button
                            onClick={downloadTemplate}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1.5px dashed #d1d5db', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', color: '#374151', fontSize: '.85rem', fontFamily: 'Poppins, sans-serif', fontWeight: 600, marginBottom: 18, width: '100%', justifyContent: 'center' }}
                        >
                            <i className="fas fa-download" style={{ color: '#fe730c' }}></i>
                            Download CSV Template
                        </button>

                        {/* Drop zone */}
                        <div
                            className={`import-drop-zone${dragOver ? ' drag-over' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept={ACCEPTED}
                                style={{ display: 'none' }}
                                onChange={e => pickFile(e.target.files[0])}
                            />
                            {file ? (
                                <>
                                    <i className="fas fa-file-excel" style={{ fontSize: '2.2rem', color: '#16a34a', marginBottom: 8 }}></i>
                                    <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{file.name}</p>
                                    <p style={{ color: '#6b7280', fontSize: '.82rem', margin: 0 }}>
                                        {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; Click to change
                                    </p>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.4rem', color: '#9ca3af', marginBottom: 8 }}></i>
                                    <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>Drag & drop your file here</p>
                                    <p style={{ color: '#9ca3af', fontSize: '.82rem', margin: 0 }}>or click to browse &nbsp;·&nbsp; CSV, XLSX, XLS · max 5 MB</p>
                                </>
                            )}
                        </div>

                        <div className="db-modal-actions" style={{ marginTop: 20 }}>
                            <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                            <button
                                className="profile-btn-save"
                                disabled={!file}
                                onClick={submit}
                            >
                                <i className="fas fa-file-import"></i> Import
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'uploading' && (
                    <div style={{ padding: '32px 28px 36px', textAlign: 'center' }}>
                        {/* File info */}
                        <i className="fas fa-file-excel" style={{ fontSize: '2.6rem', color: '#16a34a', marginBottom: 10, display: 'block' }}></i>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#111827', margin: '0 0 4px', fontSize: '.95rem' }}>
                            {file?.name}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '.8rem', margin: '0 0 28px' }}>
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                        </p>

                        {/* Progress bar track */}
                        <div className="import-progress-track">
                            <div
                                className="import-progress-bar"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        {/* Percentage + status label */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                            <span style={{ fontSize: '.82rem', color: '#6b7280' }}>
                                {serverBusy ? (
                                    <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: 5, color: '#fe730c' }}></i>Processing on server…</>
                                ) : (
                                    <><i className="fas fa-arrow-up" style={{ marginRight: 5, color: '#fe730c' }}></i>Uploading…</>
                                )}
                            </span>
                            <span style={{ fontSize: '.88rem', fontWeight: 700, color: '#fe730c' }}>{progress}%</span>
                        </div>
                    </div>
                )}

                {stage === 'result' && (
                    <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
                        <i
                            className={`fas ${result?.success ? 'fa-check-circle' : 'fa-times-circle'}`}
                            style={{ fontSize: '3rem', color: result?.success ? '#16a34a' : '#dc2626', marginBottom: 14, display: 'block' }}
                        ></i>
                        <h4 style={{ fontFamily: 'Poppins, sans-serif', color: '#111827', marginBottom: 6 }}>
                            {result?.success ? 'Import Complete' : 'Import Failed'}
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '.9rem', marginBottom: 20 }}>{result?.message}</p>

                        {result?.errors?.length > 0 && (
                            <div style={{ textAlign: 'left', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, maxHeight: 180, overflowY: 'auto' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#991b1b', fontSize: '.82rem', marginBottom: 8 }}>
                                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>
                                    Skipped rows:
                                </p>
                                {result.errors.map((err, i) => (
                                    <p key={i} style={{ color: '#b91c1c', fontSize: '.8rem', margin: '0 0 4px' }}>• {err}</p>
                                ))}
                            </div>
                        )}

                        <div className="db-modal-actions" style={{ justifyContent: 'center' }}>
                            {result?.success && (
                                <button
                                    className="db-btn-secondary"
                                    onClick={() => { setStage('pick'); setFile(null); setResult(null); }}
                                >
                                    <i className="fas fa-redo"></i> Import More
                                </button>
                            )}
                            <button className="profile-btn-save" onClick={onClose}>
                                <i className="fas fa-check"></i> Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── SchoolModal (add / edit) ────────────────────────────── */
function SchoolModal({ school, onSave, onClose, token, categories, levels }) {
    const isEdit = !!school?.id;
    const [form, setForm] = useState({
        school_name:           school?.school_name           || '',
        school_location:       school?.school_location       || '',
        school_contact_person: school?.school_contact_person || '',
        school_status:         school?.school_status         || 'active',
        school_category_id:    school?.school_category_id    || '',
        school_level_id:       school?.school_level_id       || '',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/schools/${school.id}` : '/api/schools';
            const method = isEdit ? 'PUT' : 'POST';
            const payload = {
                ...form,
                school_category_id: form.school_category_id || null,
                school_level_id:    form.school_level_id    || null,
            };
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.school);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal schools-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, position: 'relative' }}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3><i className={`fas fa-${isEdit ? 'edit' : 'plus-circle'}`}></i> {isEdit ? 'Edit School' : 'Add School'}</h3>
                </div>
                <form onSubmit={submit} className="schools-form">
                    <div className="profile-field">
                        <label>School Name <span style={{ color:'#dc2626' }}>*</span></label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-school"></i>
                            <input type="text" name="school_name" required placeholder="e.g. Nairobi High School"
                                   value={form.school_name} onChange={handle} />
                        </div>
                        {errors.school_name && <span className="profile-error">{errors.school_name[0]}</span>}
                    </div>

                    <div className="profile-field">
                        <label>Location <span style={{ color:'#dc2626' }}>*</span></label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-map-marker-alt"></i>
                            <input type="text" name="school_location" required placeholder="e.g. Nairobi, Kenya"
                                   value={form.school_location} onChange={handle} />
                        </div>
                        {errors.school_location && <span className="profile-error">{errors.school_location[0]}</span>}
                    </div>

                    <div className="profile-field">
                        <label>Contact Person <span style={{ color:'#dc2626' }}>*</span></label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-user-tie"></i>
                            <input type="text" name="school_contact_person" required placeholder="e.g. John Doe"
                                   value={form.school_contact_person} onChange={handle} />
                        </div>
                        {errors.school_contact_person && <span className="profile-error">{errors.school_contact_person[0]}</span>}
                    </div>

                    {/* Category & Level side-by-side */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                        <div className="profile-field" style={{ marginBottom:0 }}>
                            <label>Category</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-tags"></i>
                                <select name="school_category_id" value={form.school_category_id} onChange={handle}>
                                    <option value="">— None —</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                            {errors.school_category_id && <span className="profile-error">{errors.school_category_id[0]}</span>}
                        </div>

                        <div className="profile-field" style={{ marginBottom:0 }}>
                            <label>Level</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-layer-group"></i>
                                <select name="school_level_id" value={form.school_level_id} onChange={handle}>
                                    <option value="">— None —</option>
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                            {errors.school_level_id && <span className="profile-error">{errors.school_level_id[0]}</span>}
                        </div>
                    </div>

                    {isEdit && (
                        <div className="profile-field">
                            <label>Status</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                <select name="school_status" value={form.school_status} onChange={handle}>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                        </div>
                    )}

                    <div className="db-modal-actions">
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Save Changes' : 'Add School'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── DeleteModal ─────────────────────────────────────────── */
function DeleteModal({ school, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <div className="db-modal-header">
                    <h3 style={{ color: '#dc2626' }}><i className="fas fa-trash-alt"></i> Delete School</h3>
                    <button className="db-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <div style={{ padding: '24px 28px' }}>
                    <p style={{ color: '#374151', marginBottom: 8 }}>
                        Are you sure you want to delete <strong>{school.school_name}</strong>?
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '.9rem' }}>This action cannot be undone.</p>
                </div>
                <div className="db-modal-actions">
                    <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="db-btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? <><i className="fas fa-circle-notch fa-spin"></i> Deleting…</> : <><i className="fas fa-trash-alt"></i> Delete</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── ClearAllModal ───────────────────────────────────────── */
function ClearAllModal({ total, onConfirm, onClose, loading }) {
    const [typed, setTyped] = useState('');
    const confirmed = typed === 'DELETE';
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" style={{ maxWidth: 460, position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header" style={{ borderBottom:'2px solid #fee2e2' }}>
                    <h3 style={{ color:'#dc2626' }}><i className="fas fa-exclamation-triangle"></i> Clear All Schools</h3>
                </div>
                <div style={{ padding:'24px 28px' }}>
                    <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'14px 16px', marginBottom:20 }}>
                        <p style={{ color:'#991b1b', fontWeight:700, margin:'0 0 6px', fontSize:'.9rem' }}>
                            <i className="fas fa-radiation-alt" style={{ marginRight:7 }}></i>
                            This will permanently delete all {total} school record{total !== 1 ? 's' : ''}.
                        </p>
                        <p style={{ color:'#b91c1c', margin:0, fontSize:'.85rem' }}>
                            This action <strong>cannot be undone</strong>. The table will be completely cleared.
                        </p>
                    </div>
                    <div className="profile-field" style={{ marginBottom:0 }}>
                        <label style={{ color:'#374151', fontSize:'.85rem' }}>
                            Type <strong style={{ color:'#dc2626' }}>DELETE</strong> to confirm
                        </label>
                        <div className="profile-input-wrap" style={{ marginTop:6 }}>
                            <i className="fas fa-keyboard"></i>
                            <input
                                type="text"
                                placeholder="Type DELETE here…"
                                value={typed}
                                onChange={e => setTyped(e.target.value)}
                                style={{ fontFamily:'monospace', letterSpacing:'0.05em' }}
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
                <div className="db-modal-actions">
                    <button className="db-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="db-btn-danger" onClick={onConfirm} disabled={!confirmed || loading}>
                        {loading
                            ? <><i className="fas fa-circle-notch fa-spin"></i> Clearing…</>
                            : <><i className="fas fa-trash-alt"></i> Clear All Records</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Schools Page ───────────────────────────────────── */
export default function Schools() {
    const { user, token, logout, can } = useAuth();

    const [schools, setSchools]         = useState([]);
    const [meta, setMeta]               = useState({ total: 0, current_page: 1, last_page: 1 });
    const [search, setSearch]               = useState('');
    const [statusFilter, setStatus]         = useState('');
    const [locationFilter, setLocation]     = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [levelFilter, setLevelFilter]     = useState('');
    const [locations, setLocations]         = useState([]);
    const [categories, setCategories]       = useState([]);
    const [levels, setLevels]               = useState([]);
    const [page, setPage]                   = useState(1);
    const [fetching, setFetching]       = useState(false);

    const [toast, setToast]               = useState(null);
    const [addModal, setAddModal]         = useState(false);
    const [importModal, setImportModal]   = useState(false);
    const [editSchool, setEditSchool]     = useState(null);
    const [deleteSchool, setDeleteSchool] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [clearAllModal, setClearAllModal] = useState(false);
    const [clearAllLoading, setClearAllLoading] = useState(false);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const fetchSchools = useCallback(async () => {
        setFetching(true);
        const params = new URLSearchParams({ page });
        if (search)         params.set('search', search);
        if (statusFilter)   params.set('status', statusFilter);
        if (locationFilter) params.set('location', locationFilter);
        if (categoryFilter) params.set('category_id', categoryFilter);
        if (levelFilter)    params.set('level_id', levelFilter);
        try {
            const res  = await fetch(`/api/schools?${params}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setSchools(data.data || []);
            setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page });
        } catch {
            setToast({ message: 'Failed to load schools.', type: 'error' });
        } finally {
            setFetching(false);
        }
    }, [token, page, search, statusFilter, locationFilter, categoryFilter, levelFilter]);

    useEffect(() => { fetchSchools(); }, [fetchSchools]);

    // Load distinct locations, active categories, and active levels once on mount
    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

        fetch('/api/schools/locations', { headers })
            .then(r => r.json())
            .then(data => setLocations(Array.isArray(data) ? data : []))
            .catch(() => {});

        fetch('/api/school-categories?status=active&per_page=200', { headers })
            .then(r => r.json())
            .then(data => setCategories(data.data || []))
            .catch(() => {});

        fetch('/api/school-levels?status=active&per_page=200', { headers })
            .then(r => r.json())
            .then(data => setLevels(data.data || []))
            .catch(() => {});
    }, [token]);

    const handleSearch   = e => { setSearch(e.target.value);         setPage(1); };
    const handleStatus   = e => { setStatus(e.target.value);         setPage(1); };
    const handleLocation = e => { setLocation(e.target.value);       setPage(1); };
    const handleCategory = e => { setCategoryFilter(e.target.value); setPage(1); };
    const handleLevel    = e => { setLevelFilter(e.target.value);    setPage(1); };

    const onSaved = school => {
        setAddModal(false);
        setEditSchool(null);
        fetchSchools();
        setToast({ message: `School "${school.school_name}" saved successfully!`, type: 'success' });
    };

    const [pdfLoading, setPdfLoading] = useState(false);

    const exportPdf = async () => {
        setPdfLoading(true);
        try {
            const params = new URLSearchParams();
            if (search)         params.set('search', search);
            if (statusFilter)   params.set('status', statusFilter);
            if (locationFilter) params.set('location', locationFilter);
            if (categoryFilter) params.set('category_id', categoryFilter);
            if (levelFilter)    params.set('level_id', levelFilter);

            const res = await fetch(`/api/schools/export-pdf?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Export failed');

            const blob     = await res.blob();
            const url      = URL.createObjectURL(blob);
            const a        = document.createElement('a');
            a.href         = url;
            a.download     = `schools_${new Date().toISOString().slice(0,10)}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setToast({ message: 'Failed to export PDF. Please try again.', type: 'error' });
        } finally {
            setPdfLoading(false);
        }
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/schools/${deleteSchool.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            setDeleteSchool(null);
            fetchSchools();
            setToast({ message: 'School deleted successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete school.', type: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    const confirmClearAll = async () => {
        setClearAllLoading(true);
        try {
            const res = await fetch('/api/schools/all', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            if (!res.ok) throw new Error();
            setClearAllModal(false);
            fetchSchools();
            setToast({ message: data.message, type: 'success' });
        } catch {
            setToast({ message: 'Failed to clear records. Please try again.', type: 'error' });
        } finally {
            setClearAllLoading(false);
        }
    };

    return (
        <div className="db-wrap">
            {/* SIDEBAR */}
            <DashboardSidebar />

            {/* MAIN */}
            <div className="db-main">
                <DashboardNavbar page="Schools" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('schools', 'view') && <AccessDenied />}
                    {can('schools', 'view') && (
                    <>
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">Schools</h1>
                            <p className="db-page-sub">Manage partner schools and institutions</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {can('schools', 'import') && (
                                <button className="db-btn-secondary" onClick={() => setImportModal(true)}>
                                    <i className="fas fa-file-import"></i> Import
                                </button>
                            )}
                            {can('schools', 'export') && (
                                <button className="db-btn-secondary" onClick={exportPdf} disabled={pdfLoading}
                                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
                                    {pdfLoading
                                        ? <><i className="fas fa-circle-notch fa-spin"></i> Exporting…</>
                                        : <><i className="fas fa-file-pdf"></i> Export PDF</>
                                    }
                                </button>
                            )}
                            {can('schools', 'clear_all') && (
                                <button className="db-btn-danger" onClick={() => setClearAllModal(true)} disabled={meta.total === 0}
                                    title="Permanently delete all school records">
                                    <i className="fas fa-trash-alt"></i> Clear All
                                </button>
                            )}
                            {can('schools', 'create') && (
                                <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                    <i className="fas fa-plus"></i> Add School
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats row */}
                    {can('schools','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background: 'linear-gradient(135deg,#fe730c,#f59e0b)' }}>
                                <i className="fas fa-school"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Schools</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{schools.filter(s => s.school_status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background: 'linear-gradient(135deg,#6b7280,#9ca3af)' }}>
                                <i className="fas fa-archive"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{schools.filter(s => s.school_status === 'archived').length}</div>
                                <div className="schools-stat-label">Archived (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input
                                type="text" placeholder="Search by name, location or contact…"
                                value={search} onChange={handleSearch}
                            />
                        </div>
                        <select className="db-filter-select" value={statusFilter} onChange={handleStatus}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                        <select className="db-filter-select" value={locationFilter} onChange={handleLocation}>
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <select className="db-filter-select" value={categoryFilter} onChange={handleCategory}>
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select className="db-filter-select" value={levelFilter} onChange={handleLevel}>
                            <option value="">All Levels</option>
                            {levels.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="db-table-wrap">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>School Name</th>
                                    <th>Location</th>
                                    <th>Category</th>
                                    <th>Level</th>
                                    <th>Contact Person</th>
                                    <th>Status</th>
                                    <th>Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetching ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.5rem' }}></i>
                                    </td></tr>
                                ) : schools.length === 0 ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                                        <i className="fas fa-school" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}></i>
                                        No schools found.
                                    </td></tr>
                                ) : schools.map((s, i) => (
                                    <tr key={s.id}>
                                        <td style={{ color: '#9ca3af', fontSize: '.85rem' }}>
                                            {(meta.current_page - 1) * 15 + i + 1}
                                        </td>
                                        <td>
                                            <div className="db-student-name">{s.school_name}</div>
                                        </td>
                                        <td>
                                            <span className="db-track-pill" style={{ background: '#eff6ff', color: '#2563eb' }}>
                                                <i className="fas fa-map-marker-alt" style={{ marginRight: 5 }}></i>
                                                {s.school_location}
                                            </span>
                                        </td>
                                        <td>
                                            {s.category
                                                ? <span className="db-track-pill" style={{ background: '#fdf4ff', color: '#7c3aed' }}>
                                                    <i className="fas fa-tags" style={{ marginRight: 5 }}></i>
                                                    {s.category.name}
                                                  </span>
                                                : <span style={{ color: '#d1d5db', fontSize: '.82rem', fontStyle: 'italic' }}>—</span>
                                            }
                                        </td>
                                        <td>
                                            {s.level
                                                ? <span className="db-track-pill" style={{ background: '#ecfdf5', color: '#059669' }}>
                                                    <i className="fas fa-layer-group" style={{ marginRight: 5 }}></i>
                                                    {s.level.name}
                                                  </span>
                                                : <span style={{ color: '#d1d5db', fontSize: '.82rem', fontStyle: 'italic' }}>—</span>
                                            }
                                        </td>
                                        <td style={{ color: '#374151' }}>{s.school_contact_person}</td>
                                        <td>
                                            <span className={`db-status-badge ${s.school_status === 'active' ? 'db-status-active' : 'db-status-inactive'}`}>
                                                <i className={`fas fa-${s.school_status === 'active' ? 'check-circle' : 'archive'}`}></i>
                                                {s.school_status === 'active' ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#9ca3af', fontSize: '.85rem' }}>
                                            {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <div className="db-action-btns">
                                                {can('schools', 'update') && (
                                                    <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditSchool(s)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                )}
                                                {can('schools', 'delete') && (
                                                    <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteSchool(s)}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (() => {
                        // Build page numbers with ellipsis: 1 … 4 5 [6] 7 8 … 73
                        const pages = [];
                        const delta = 2; // pages on each side of current
                        const rangeStart = Math.max(2, page - delta);
                        const rangeEnd   = Math.min(meta.last_page - 1, page + delta);

                        pages.push(1);
                        if (rangeStart > 2) pages.push('…left');
                        for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
                        if (rangeEnd < meta.last_page - 1) pages.push('…right');
                        if (meta.last_page > 1) pages.push(meta.last_page);

                        return (
                            <div className="db-pagination">
                                {/* First + Prev */}
                                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(1)} title="First">
                                    <i className="fas fa-angle-double-left"></i>
                                </button>
                                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} title="Previous">
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                {pages.map((p, i) =>
                                    typeof p === 'string' ? (
                                        <span key={p} className="db-page-btn" style={{ cursor: 'default', opacity: .5 }}>…</span>
                                    ) : (
                                        <button key={p} className={`db-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                    )
                                )}

                                {/* Next + Last */}
                                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} title="Next">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)} title="Last">
                                    <i className="fas fa-angle-double-right"></i>
                                </button>

                                <span style={{ fontSize: '.8rem', color: '#9ca3af', marginLeft: 8, whiteSpace: 'nowrap' }}>
                                    Page {page} of {meta.last_page} &nbsp;·&nbsp; {meta.total} records
                                </span>
                            </div>
                        );
                    })()}
                    </>
                    )}{/* /can schools view */}
                </div>{/* /db-content */}
            </div>{/* /db-main */}

            {/* Modals */}
            {importModal && (
                <ImportModal
                    token={token}
                    onClose={() => setImportModal(false)}
                    onImported={() => {
                        fetchSchools();
                        setToast({ message: 'Schools imported successfully!', type: 'success' });
                    }}
                    categories={categories}
                    levels={levels}
                />
            )}
            {addModal   && <SchoolModal token={token} onSave={onSaved} onClose={() => setAddModal(false)} categories={categories} levels={levels} />}
            {editSchool && <SchoolModal school={editSchool} token={token} onSave={onSaved} onClose={() => setEditSchool(null)} categories={categories} levels={levels} />}
            {deleteSchool && (
                <DeleteModal
                    school={deleteSchool}
                    loading={deleteLoading}
                    onConfirm={confirmDelete}
                    onClose={() => setDeleteSchool(null)}
                />
            )}
            {clearAllModal && (
                <ClearAllModal
                    total={meta.total}
                    loading={clearAllLoading}
                    onConfirm={confirmClearAll}
                    onClose={() => setClearAllModal(false)}
                />
            )}
        </div>
    );
}
