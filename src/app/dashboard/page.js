'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientDashboard() {
    const [user, setUser] = useState(null);
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.authenticated) { router.push('/login'); return; }
            if (data.user.role === 'admin') { router.push('/admin'); return; }
            setUser(data.user);
            loadQueries();
        } catch { router.push('/login'); }
    }

    async function loadQueries() {
        try {
            const res = await fetch('/api/queries');
            const data = await res.json();
            setQueries(data.queries || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    }

    const statusBadge = (status) => {
        const map = {
            pending: { cls: 'badge-warning', label: '⏳ Pendiente' },
            processed: { cls: 'badge-info', label: '🔄 Procesada' },
            sent: { cls: 'badge-success', label: '✅ Enviada' },
            failed: { cls: 'badge-error', label: '❌ Fallida' }
        };
        const s = map[status] || { cls: 'badge-info', label: status };
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    const channelBadge = (ch) => (
        <span className={`badge ${ch === 'web' ? 'badge-web' : 'badge-call'}`}>
            {ch === 'web' ? '🌐 Web' : '📞 Llamada'}
        </span>
    );

    if (loading) return <div className="loading-overlay"><div className="loader"></div> Cargando...</div>;

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <a href="/" className="navbar-brand">🔧 <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>U-FACTORY</span> RADIATORS</a>
                    <div className="navbar-links">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>👤 {user?.name}</span>
                        <button onClick={handleLogout}>Cerrar Sesión</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">📋 Mis Consultas</h1>
                    <p className="page-subtitle">Historial de consultas VIN realizadas</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">{queries.length}</div>
                        <div className="stat-label">Total Consultas</div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{queries.filter(q => q.status === 'sent').length}</div>
                        <div className="stat-label">Enviadas</div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-value">{queries.reduce((sum, q) => sum + (q.parts_found || 0), 0)}</div>
                        <div className="stat-label">Piezas Encontradas</div>
                    </div>
                </div>

                {/* Queries table */}
                {queries.length === 0 ? (
                    <div className="empty-state card" style={{ padding: 60 }}>
                        <div className="icon">🔍</div>
                        <h3>Sin consultas aún</h3>
                        <p>Realiza tu primera consulta desde la <a href="/">página principal</a>.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>VIN</th>
                                    <th>Vehículo</th>
                                    <th>Canal</th>
                                    <th>Piezas</th>
                                    <th>Estado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {queries.map(q => (
                                    <>
                                        <tr key={q.id} onClick={() => setExpandedId(expandedId === q.id ? null : q.id)} style={{ cursor: 'pointer' }}>
                                            <td>{new Date(q.created_at).toLocaleDateString('es-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{q.vin}</td>
                                            <td>{q.vehicle_make ? `${q.vehicle_year} ${q.vehicle_make} ${q.vehicle_model}` : '—'}</td>
                                            <td>{channelBadge(q.channel)}</td>
                                            <td>{q.parts_found || 0}</td>
                                            <td>{statusBadge(q.status)}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedId === q.id ? '▲' : '▼'}</td>
                                        </tr>
                                        {expandedId === q.id && q.parts && q.parts.length > 0 && (
                                            <tr key={q.id + '-parts'}>
                                                <td colSpan={7} style={{ padding: '16px 24px', background: 'rgba(245,158,11,0.03)' }}>
                                                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Piezas encontradas:</strong>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 12 }}>
                                                        {q.parts.map((p, i) => (
                                                            <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                                                                    {p.type === 'radiador' ? '🔴' : p.type === 'condensador' ? '❄️' : '🌀'} {p.description}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                                    Ref: {p.part_number} · <span style={{ color: 'var(--accent)', fontWeight: 700 }}>${p.price.toFixed(2)}</span> · Stock: {p.stock_qty}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
