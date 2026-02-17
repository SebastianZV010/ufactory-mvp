'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [form, setForm] = useState({ vin: '', name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Scroll-triggered fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const [loadingStep, setLoadingStep] = useState(0);
  const steps = [
    { label: 'VIN', msg: 'Validando formato de VIN...' },
    { label: 'Vehículo', msg: 'Identificando marca y modelo...' },
    { label: 'Piezas', msg: 'Buscando piezas en inventario...' },
    { label: 'Reporte', msg: 'Generando reporte completo...' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setError('');
    setResult(null);

    // Multi-step loading simulation for better UX (otherwise it's too fast)
    const runSteps = async () => {
      setLoadingStep(0);
      await new Promise(r => setTimeout(r, 800));
      setLoadingStep(1);
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStep(2);
      await new Promise(r => setTimeout(r, 1000));
      setLoadingStep(3);
      await new Promise(r => setTimeout(r, 800));
    };

    try {
      const [res] = await Promise.all([
        fetch('/api/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
        runSteps()
      ]);

      const data = await res.json();

      if (data.success) {
        setResult(data);
        setForm({ vin: '', name: '', email: '', phone: '' });
      } else {
        setError(data.error || 'Error procesando consulta');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const LoadingProgress = () => (
    <div className="progress-container">
      <div className="progress-steps-list">
        {steps.map((step, idx) => (
          <div key={idx} className={`progress-step-item ${idx === loadingStep ? 'active' : ''} ${idx < loadingStep ? 'completed' : ''}`}>
            <div className="step-dot">{idx < loadingStep ? '✓' : idx + 1}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}></div>
      </div>
      <div className="progress-message">{steps[loadingStep].msg}</div>
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* ─── Navbar ─── */}
      <nav className="nav">
        <div className="nav-content">
          <a href="/" className="nav-brand">🔧 <span className="text-accent">U-FACTORY</span> RADIATORS</a>
          <a href="/login" className="nav-link">Iniciar Sesión</a>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="landing-hero">
        {/* Floating particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <h1>
          Encuentra piezas para tu<br />
          <span className="text-gradient">vehículo al instante</span>
        </h1>
        <p className="subtitle">
          Ingresa el VIN de tu vehículo y recibe la disponibilidad de radiadores,
          condensadores y ventiladores directamente en tu correo electrónico.
        </p>

        {/* ─── VIN Form ─── */}
        <div className="lookup-card">
          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label className="form-label">🔍 Número VIN del Vehículo</label>
              <input type="text" className="form-input" placeholder="Ej: 1FTFW1ET5DFC10001"
                value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                maxLength={17} required style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '1.05rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">👤 Tu Nombre</label>
                <input type="text" className="form-input" placeholder="Nombre completo"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">📧 Email</label>
                <input type="email" className="form-input" placeholder="tu@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">📱 Teléfono (opcional)</label>
              <input type="tel" className="form-input" placeholder="+1 305 123 4567"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '4px', padding: '16px' }} disabled={loading}>
              {loading ? '⏳ Procesando...' : '🔍 Buscar Piezas Disponibles'}
            </button>

            {loading && <LoadingProgress />}

            {error && (
              <div className="alert alert-error" style={{ marginTop: '16px' }}>
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            {result && (
              <div className="alert alert-success" style={{ marginTop: '16px', flexDirection: 'column', gap: '4px' }}>
                <strong>✅ ¡Consulta exitosa!</strong>
                <p>Vehículo: {result.vehicle.year} {result.vehicle.make} {result.vehicle.model}</p>
                <p>Piezas encontradas: {result.partsCount}</p>
                <p>📧 {result.emailSent ? 'Resultados enviados a tu correo' : 'Revisa tu correo para los detalles'}</p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="trust-bar fade-in">
        <div className="trust-bar-inner">
          <div className="trust-item">
            <div className="trust-icon">🏆</div>
            <div className="trust-value">20+</div>
            <div className="trust-label">Años de Experiencia</div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">📦</div>
            <div className="trust-value">53+</div>
            <div className="trust-label">Piezas Disponibles</div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">📍</div>
            <div className="trust-value">Miami</div>
            <div className="trust-label">Florida, USA</div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">⚡</div>
            <div className="trust-value">24/7</div>
            <div className="trust-label">Soporte en Línea</div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="steps-section">
        <h2 className="fade-in">
          🛠️ <span className="text-gradient">Cómo Funciona</span>
        </h2>
        <div className="steps-grid">
          <div className="step-card card fade-in fade-in-delay-1">
            <div className="step-number">1</div>
            <h3>Ingresa tu VIN</h3>
            <p>Completa el formulario con el número VIN de 17 caracteres de tu vehículo y tu correo electrónico.</p>
          </div>
          <div className="step-card card fade-in fade-in-delay-2">
            <div className="step-number">2</div>
            <h3>Buscamos en Inventario</h3>
            <p>Identificamos tu vehículo automáticamente y verificamos radiadores, condensadores y ventiladores disponibles.</p>
          </div>
          <div className="step-card card fade-in fade-in-delay-3">
            <div className="step-number">3</div>
            <h3>Recibe por Correo</h3>
            <p>Recibes los resultados al instante en tu correo electrónico con precios, stock y disponibilidad.</p>
          </div>
        </div>
      </section>

      {/* ─── Phone CTA ─── */}
      <section className="cta-section fade-in">
        <div className="cta-card">
          <h2>📞 <span className="text-gradient">También por Teléfono</span></h2>
          <p>
            Llama a nuestro número y nuestro asistente de voz recolectará tu VIN.
            Recibirás la misma información por correo electrónico automáticamente.
          </p>
          <div className="cta-phone">(512) 768-9411</div>
          <br />
          <a href="tel:+15127689411" className="btn-cta">📞 Llamar Ahora</a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div>
            <h3>🔧 <span className="text-accent">U-FACTORY</span> RADIATORS</h3>
            <p>
              Distribuidora de autopartes especializada en radiadores, condensadores
              y ventiladores para todo tipo de vehículos. Más de 20 años sirviendo
              a la comunidad de Miami con piezas de la más alta calidad.
            </p>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>
              📍 4495 NW 37th Ave<br />Miami, FL 33142<br />
              📞 (512) 768-9411<br />
              🌐 radiadorsflorida.com
            </p>
          </div>
          <div>
            <h4>Horario</h4>
            <p>
              Lunes - Viernes<br />8:00 AM - 6:00 PM<br />
              Sábado<br />8:00 AM - 3:00 PM<br />
              Domingo: Cerrado
            </p>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>© 2026 U-FACTORY RADIATORS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
