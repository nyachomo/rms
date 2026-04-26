import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import AccessDenied from '../components/AccessDenied';
import RichTextEditor from '../components/RichTextEditor';

/* ── Toast ── */
function Toast({ message, type, onClose }) {
    if (!message) return null;
    const err = type === 'error';
    return (
        <div className="profile-toast" style={{ background: err ? '#fef2f2' : '#f0fdf4', borderColor: err ? '#fca5a5' : '#86efac' }}>
            <i className={`fas ${err ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ color: err ? '#dc2626' : '#16a34a' }}></i>
            <span style={{ color: err ? '#991b1b' : '#15803d' }}>{message}</span>
            <button onClick={onClose} className="profile-toast-close"><i className="fas fa-times"></i></button>
        </div>
    );
}

/* ── Add / Edit Modal ── */
function CategoryModal({ category, onSave, onClose, token }) {
    const isEdit = !!category?.id;
    const [form, setForm] = useState({
        name:        category?.name        || '',
        description: category?.description || '',
        status:      category?.status      || 'active',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/school-categories/${category.id}` : '/api/school-categories';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setErrors(data.errors || {}); return; }
            onSave(data.category);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, position: 'relative' }}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3><i className={`fas fa-${isEdit ? 'edit' : 'plus-circle'}`}></i> {isEdit ? 'Edit Category' : 'Add Category'}</h3>
                </div>
                <form onSubmit={submit} style={{ padding: '24px 28px 28px' }}>
                    <div className="profile-field">
                        <label>Category Name <span style={{ color:'#dc2626' }}>*</span></label>
                        <div className="profile-input-wrap">
                            <i className="fas fa-tag"></i>
                            <input type="text" name="name" required placeholder="e.g. Public Secondary"
                                   value={form.name} onChange={handle} />
                        </div>
                        {errors.name && <span className="profile-error">{errors.name[0]}</span>}
                    </div>

                    <div className="profile-field">
                        <label>Description</label>
                        <RichTextEditor value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} />
                        {errors.description && <span className="profile-error">{errors.description[0]}</span>}
                    </div>

                    {isEdit && (
                        <div className="profile-field">
                            <label>Status</label>
                            <div className="profile-input-wrap">
                                <i className="fas fa-toggle-on"></i>
                                <select name="status" value={form.status} onChange={handle}>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                        </div>
                    )}

                    <div className="db-modal-actions" style={{ marginTop: 8 }}>
                        <button type="button" className="db-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="profile-btn-save" disabled={loading}>
                            {loading
                                ? <><i className="fas fa-circle-notch fa-spin"></i> Saving…</>
                                : <><i className="fas fa-save"></i> {isEdit ? 'Save Changes' : 'Add Category'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal ── */
function DeleteModal({ category, onConfirm, onClose, loading }) {
    return (
        <div className="db-modal-overlay" onClick={onClose}>
            <div className="db-modal" style={{ maxWidth: 420, position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:10, width:32, height:32, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', color:'#666' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="db-modal-header">
                    <h3 style={{ color: '#dc2626' }}><i className="fas fa-trash-alt"></i> Delete Category</h3>
                </div>
                <div style={{ padding: '24px 28px' }}>
                    <p style={{ color: '#374151', marginBottom: 8 }}>
                        Are you sure you want to delete <strong>{category.name}</strong>?
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

/* ── Main Page ── */
export default function SchoolCategories() {
    const { user, token, logout, can } = useAuth();

    const [categories, setCategories]   = useState([]);
    const [meta, setMeta]               = useState({ total: 0, current_page: 1, last_page: 1 });
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatus]     = useState('');
    const [page, setPage]               = useState(1);
    const [fetching, setFetching]       = useState(false);

    const [toast, setToast]             = useState(null);
    const [addModal, setAddModal]       = useState(false);
    const [editCat, setEditCat]         = useState(null);
    const [deleteCat, setDeleteCat]     = useState(null);
    const [deleteLoading, setDeleting]  = useState(false);

    const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const fetchCategories = useCallback(async () => {
        setFetching(true);
        const params = new URLSearchParams({ page });
        if (search)       params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        try {
            const res  = await fetch(`/api/school-categories?${params}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setCategories(data.data || []);
            setMeta({ total: data.total, current_page: data.current_page, last_page: data.last_page });
        } catch {
            setToast({ message: 'Failed to load categories.', type: 'error' });
        } finally {
            setFetching(false);
        }
    }, [token, page, search, statusFilter]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleSearch = e => { setSearch(e.target.value); setPage(1); };
    const handleStatus = e => { setStatus(e.target.value); setPage(1); };

    const onSaved = cat => {
        setAddModal(false);
        setEditCat(null);
        fetchCategories();
        setToast({ message: `Category "${cat.name}" saved successfully!`, type: 'success' });
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/school-categories/${deleteCat.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            setDeleteCat(null);
            fetchCategories();
            setToast({ message: 'Category deleted successfully.', type: 'success' });
        } catch {
            setToast({ message: 'Failed to delete category.', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    /* ── Pagination ── */
    const PaginationBar = () => {
        if (meta.last_page <= 1) return null;
        const delta = 2;
        const rangeStart = Math.max(2, page - delta);
        const rangeEnd   = Math.min(meta.last_page - 1, page + delta);
        const pages = [1];
        if (rangeStart > 2) pages.push('…l');
        for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
        if (rangeEnd < meta.last_page - 1) pages.push('…r');
        if (meta.last_page > 1) pages.push(meta.last_page);

        return (
            <div className="db-pagination">
                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(1)}><i className="fas fa-angle-double-left"></i></button>
                <button className="db-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
                {pages.map((p, i) =>
                    typeof p === 'string'
                        ? <span key={p + i} className="db-page-btn" style={{ cursor:'default', opacity:.5 }}>…</span>
                        : <button key={p} className={`db-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )}
                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                <button className="db-page-btn" disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)}><i className="fas fa-angle-double-right"></i></button>
                <span style={{ fontSize:'.8rem', color:'#9ca3af', marginLeft:8, whiteSpace:'nowrap' }}>
                    Page {page} of {meta.last_page} &nbsp;·&nbsp; {meta.total} records
                </span>
            </div>
        );
    };

    return (
        <div className="db-wrap">
            {/* SIDEBAR */}
            <DashboardSidebar />

            {/* MAIN */}
            <div className="db-main">
                <DashboardNavbar page="School Categories" />

                {/* CONTENT */}
                <div className="db-content">
                    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

                    {!can('school_categories', 'view') && <AccessDenied />}
                    {can('school_categories', 'view') && (
                    <>
                    <div className="db-topbar">
                        <div>
                            <h1 className="db-page-title">School Categories</h1>
                            <p className="db-page-sub">Organise schools into meaningful groups</p>
                        </div>
                        {can('school_categories', 'create') && (
                            <button className="db-btn-primary" onClick={() => setAddModal(true)}>
                                <i className="fas fa-plus"></i> Add Category
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {can('school_categories','view_stats') && <div className="schools-stats-row">
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#fe730c,#f59e0b)' }}>
                                <i className="fas fa-tags"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{meta.total}</div>
                                <div className="schools-stat-label">Total Categories</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{categories.filter(c => c.status === 'active').length}</div>
                                <div className="schools-stat-label">Active (this page)</div>
                            </div>
                        </div>
                        <div className="schools-stat-card">
                            <div className="schools-stat-icon" style={{ background:'linear-gradient(135deg,#6b7280,#9ca3af)' }}>
                                <i className="fas fa-archive"></i>
                            </div>
                            <div>
                                <div className="schools-stat-value">{categories.filter(c => c.status === 'archived').length}</div>
                                <div className="schools-stat-label">Archived (this page)</div>
                            </div>
                        </div>
                    </div>}

                    {/* Filters */}
                    <div className="db-controls">
                        <div className="db-search-wrap">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search by name or description…"
                                   value={search} onChange={handleSearch} />
                        </div>
                        <select className="db-filter-select" value={statusFilter} onChange={handleStatus}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="db-table-wrap">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetching ? (
                                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'1.5rem' }}></i>
                                    </td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                                        <i className="fas fa-tags" style={{ fontSize:'2.5rem', display:'block', marginBottom:12 }}></i>
                                        No categories found.
                                    </td></tr>
                                ) : categories.map((cat, i) => (
                                    <tr key={cat.id}>
                                        <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                            {(meta.current_page - 1) * 15 + i + 1}
                                        </td>
                                        <td>
                                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#fe730c22,#f59e0b22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                    <i className="fas fa-tag" style={{ color:'#fe730c', fontSize:'.85rem' }}></i>
                                                </div>
                                                <span className="db-student-name">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color:'#6b7280', maxWidth:320 }}>
                                            {cat.description
                                                ? <span title={cat.description}>{cat.description.length > 80 ? cat.description.slice(0, 80) + '…' : cat.description}</span>
                                                : <span style={{ color:'#d1d5db', fontStyle:'italic' }}>No description</span>
                                            }
                                        </td>
                                        <td>
                                            <span className={`db-status-badge ${cat.status === 'active' ? 'db-status-active' : 'db-status-inactive'}`}>
                                                <i className={`fas fa-${cat.status === 'active' ? 'check-circle' : 'archive'}`}></i>
                                                {cat.status === 'active' ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        <td style={{ color:'#9ca3af', fontSize:'.85rem' }}>
                                            {new Date(cat.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                        </td>
                                        <td>
                                            <div className="db-action-btns">
                                                {can('school_categories', 'update') && (
                                                    <button className="db-action-btn db-action-edit" title="Edit" onClick={() => setEditCat(cat)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                )}
                                                {can('school_categories', 'delete') && (
                                                    <button className="db-action-btn db-action-delete" title="Delete" onClick={() => setDeleteCat(cat)}>
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

                    <PaginationBar />
                    </>
                    )}{/* /can school_categories view */}
                </div>
            </div>

            {/* Modals */}
            {addModal   && <CategoryModal token={token} onSave={onSaved} onClose={() => setAddModal(false)} />}
            {editCat    && <CategoryModal category={editCat} token={token} onSave={onSaved} onClose={() => setEditCat(null)} />}
            {deleteCat  && <DeleteModal category={deleteCat} loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setDeleteCat(null)} />}
        </div>
    );
}
