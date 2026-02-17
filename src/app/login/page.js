'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (data.success) {
                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || 'Error de autenticación');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card card">
                <div className="login-brand">
                    🔧 <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>U-FACTORY</span>
                </div>
                <h2>Iniciar Sesión</h2>
                <p className="subtitle">Accede a tu panel de consultas</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="login-email">📧 Email</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-phone">📱 Teléfono</label>
                        <input
                            id="login-phone"
                            type="tel"
                            placeholder="3056349637"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            required
                        />
                    </div>

                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <><div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }}></div> Ingresando...</> : '🔐 Ingresar'}
                    </button>
                </form>

                <div style={{ marginTop: 32, padding: '20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>🧪 Cuentas de Prueba:</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                        <strong>Admin:</strong> admin@ufactory.com / 3056349637
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>Cliente:</strong> cliente@test.com / 3051234567
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <a href="/" style={{ fontSize: '0.9rem' }}>← Volver al inicio</a>
                </div>
            </div>
        </div>
    );
}
