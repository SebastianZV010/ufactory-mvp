'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('consultas');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [queries, setQueries] = useState([]);
    const [parts, setParts] = useState([]);
    const [filters, setFilters] = useState({ channel: '', status: '', make: '' });
    const [editingPart, setEditingPart] = useState(null);
    const [editValues, setEditValues] = useState({ price: '', stock_qty: '' });
    const [saveMsg, setSaveMsg] = useState(null);
    const router = useRouter();

    useEffect(() => { checkAuth(); }, []);
    useEffect(() => { if (user) loadTabData(); }, [activeTab, user]);

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.authenticated || data.user.role !== 'admin') { router.push('/login'); return; }
            setUser(data.user);
            setLoading(false);
        } catch { router.push('/login'); }
    }

    async function loadTabData() {
        if (activeTab === 'estadisticas') await loadStats();
        if (activeTab === 'consultas') await loadQueries();
        if (activeTab === 'inventario') await loadParts();
    }

    async function loadStats() {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data.stats);
        } catch (err) { console.error(err); }
    }

    async function loadQueries() {
        const params = new URLSearchParams();
        if (filters.channel) params.set('channel', filters.channel);
        if (filters.status) params.set('status', filters.status);
        if (filters.make) params.set('make', filters.make);
        try {
            const res = await fetch(`/api/queries?${params}`);
            const data = await res.json();
            setQueries(data.queries || []);
        } catch (err) { console.error(err); }
    }

    async function loadParts() {
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            setParts(data.parts || []);
        } catch (err) { console.error(err); }
    }

    async function savePart() {
        if (!editingPart) return;
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingPart, price: editValues.price, stock_qty: editValues.stock_qty })
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg('✅ Guardado');
                setEditingPart(null);
                loadParts();
                setTimeout(() => setSaveMsg(null), 2000);
            }
        } catch (err) { console.error(err); }
    }

    function startEdit(part) {
        setEditingPart(part.id);
        setEditValues({ price: part.price, stock_qty: part.stock_qty });
    }

    async function handleExport() {
        window.location.href = '/api/admin/export';
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    }

    const statusBadge = (s) => {
        const m = { pending: ['badge-warning', '⏳'], processed: ['badge-info', '🔄'], sent: ['badge-success', '✅'], failed: ['badge-error', '❌'] };
        const [cls, icon] = m[s] || ['badge-info', s];
        return <span className={`badge ${cls}`}>{icon} {s}</span>;
    };

    const channelBadge = (ch) => (
        <span className={`badge ${ch === 'web' ? 'badge-web' : 'badge-call'}`}>{ch === 'web' ? '🌐 Web' : '📞 Llamada'}</span>
    );

    const typeBadge = (t) => {
        const m = { radiador: '🔴', condensador: '❄️', ventilador: '🌀' };
        return <span>{m[t] || '🔩'} {t}</span>;
    };

    if (loading) return <div className="loading-overlay"><div className="loader"></div> Cargando...</div>;

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <a href="/" className="navbar-brand">🔧 <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>U-FACTORY</span> RADIATORS</a>
                    <div className="navbar-links">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>🛡️ Admin: {user?.name}</span>
                        <button onClick={handleLogout}>Cerrar Sesión</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">🛡️ Panel de Administración</h1>
                    <p className="page-subtitle">Gestión de consultas, inventario y estadísticas</p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {[
                        { id: 'consultas', label: '📋 Consultas' },
                        { id: 'inventario', label: '📦 Inventario' },
                        { id: 'estadisticas', label: '📊 Estadísticas' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button className="tab" onClick={handleExport} style={{ marginLeft: 'auto' }}>📥 Exportar CSV</button>
                </div>

                {/* ─── CONSULTAS TAB ─── */}
                {activeTab === 'consultas' && (
                    <>
                        <div className="filter-bar">
                            <select value={filters.channel} onChange={e => { setFilters({ ...filters, channel: e.target.value }); }}>
                                <option value="">Todos los canales</option>
                                <option value="web">🌐 Web</option>
                                <option value="call">📞 Llamada</option>
                            </select>
                            <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); }}>
                                <option value="">Todos los estados</option>
                                <option value="pending">Pendiente</option>
                                <option value="processed">Procesada</option>
                                <option value="sent">Enviada</option>
                                <option value="failed">Fallida</option>
                            </select>
                            <select value={filters.make} onChange={e => { setFilters({ ...filters, make: e.target.value }); }}>
                                <option value="">Todas las marcas</option>
                                {['Ford', 'Chevrolet', 'Toyota', 'Honda', 'Nissan', 'RAM', 'Hyundai', 'Kia'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <button className="btn btn-secondary btn-sm" onClick={loadQueries}>🔄 Filtrar</button>
                        </div>

                        {queries.length === 0 ? (
                            <div className="empty-state card"><div className="icon">📋</div><h3>Sin consultas</h3><p>No hay consultas con estos filtros.</p></div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Cliente</th>
                                            <th>VIN</th>
                                            <th>Vehículo</th>
                                            <th>Canal</th>
                                            <th>Piezas</th>
                                            <th>Email</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queries.map(q => (
                                            <tr key={q.id}>
                                                <td style={{ whiteSpace: 'nowrap' }}>{new Date(q.created_at).toLocaleDateString('es-US', { day: '2-digit', month: 'short' })} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(q.created_at).toLocaleTimeString('es-US', { hour: '2-digit', minute: '2-digit' })}</span></td>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.customer_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.customer_phone}</div>
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{q.vin}</td>
                                                <td>{q.vehicle_make ? `${q.vehicle_year} ${q.vehicle_make} ${q.vehicle_model}` : '—'}</td>
                                                <td>{channelBadge(q.channel)}</td>
                                                <td style={{ textAlign: 'center' }}>{q.parts_found || 0}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {q.email_sent ? '✅' : <span title={q.error_message || 'Error desconocido'}>❌</span>}
                                                </td>
                                                <td>{statusBadge(q.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ─── INVENTARIO TAB ─── */}
                {activeTab === 'inventario' && (
                    <>
                        {saveMsg && <div className="alert alert-success">{saveMsg}</div>}
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ref</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                        <th>Marca</th>
                                        <th>Modelo</th>
                                        <th>Años</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parts.map(p => (
                                        <tr key={p.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.part_number}</td>
                                            <td>{typeBadge(p.type)}</td>
                                            <td style={{ fontSize: '0.85rem', maxWidth: 250 }}>{p.description}</td>
                                            <td>{p.make}</td>
                                            <td>{p.model}</td>
                                            <td>{p.year_from}-{p.year_to}</td>
                                            <td>
                                                {editingPart === p.id ? (
                                                    <input type="number" className="edit-input" value={editValues.price} onChange={e => setEditValues({ ...editValues, price: e.target.value })} step="0.01" min="0" />
                                                ) : (
                                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${p.price.toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td>
                                                {editingPart === p.id ? (
                                                    <input type="number" className="edit-input" value={editValues.stock_qty} onChange={e => setEditValues({ ...editValues, stock_qty: e.target.value })} min="0" style={{ width: 60 }} />
                                                ) : (
                                                    <span className={`badge ${p.stock_qty > 5 ? 'badge-success' : p.stock_qty > 0 ? 'badge-warning' : 'badge-error'}`}>
                                                        {p.stock_qty}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {editingPart === p.id ? (
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button className="btn btn-primary btn-sm" onClick={savePart}>💾</button>
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingPart(null)}>✕</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}>✏️</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ─── ESTADÍSTICAS TAB ─── */}
                {activeTab === 'estadisticas' && stats && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-value">{stats.totalQueries}</div>
                                <div className="stat-label">Total Consultas</div>
                            </div>
                            <div className="stat-card card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-value">{stats.todayQueries}</div>
                                <div className="stat-label">Hoy</div>
                            </div>
                            <div className="stat-card card">
                                <div className="stat-icon">📆</div>
                                <div className="stat-value">{stats.weekQueries}</div>
                                <div className="stat-label">Esta Semana</div>
                            </div>
                            <div className="stat-card card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-value">{stats.totalParts}</div>
                                <div className="stat-label">Piezas en Catálogo</div>
                            </div>
                            <div className="stat-card card">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-value">{stats.lowStock}</div>
                                <div className="stat-label">Stock Bajo (≤3)</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            {/* By Channel */}
                            <div className="card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>📡 Consultas por Canal</h3>
                                {Object.entries(stats.byChannel || {}).map(([ch, count]) => (
                                    <div key={ch} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        {channelBadge(ch)}
                                        <div style={{ flex: 1, margin: '0 16px', height: 8, background: 'var(--bg-input)', borderRadius: 4 }}>
                                            <div style={{ width: `${(count / stats.totalQueries) * 100}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: 4 }}></div>
                                        </div>
                                        <span style={{ fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Top Makes */}
                            <div className="card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>🏆 Marcas Más Buscadas</h3>
                                {(stats.topMakes || []).map((m, i) => (
                                    <div key={m.make} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: '0.9rem' }}>{i + 1}. {m.make}</span>
                                        <div style={{ flex: 1, margin: '0 16px', height: 8, background: 'var(--bg-input)', borderRadius: 4 }}>
                                            <div style={{ width: `${(m.count / (stats.topMakes[0]?.count || 1)) * 100}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: 4 }}></div>
                                        </div>
                                        <span style={{ fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{m.count}</span>
                                    </div>
                                ))}
                                {(!stats.topMakes || stats.topMakes.length === 0) && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sin datos aún</p>
                                )}
                            </div>
                        </div>

                        {/* By Status */}
                        <div className="card" style={{ padding: 28, marginTop: 24 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>📈 Distribución por Estado</h3>
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                                    <div key={status} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{count}</div>
                                        <div>{statusBadge(status)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
