import './globals.css';

export const metadata = {
  title: 'U-FACTORY RADIATORS | Consulta de Piezas por VIN',
  description: 'Encuentra radiadores, condensadores y ventiladores para tu vehículo. Ingresa tu VIN y recibe disponibilidad al instante por correo electrónico.',
  keywords: 'radiadores, condensadores, ventiladores, autopartes, Miami, VIN, U-FACTORY',
  openGraph: {
    title: 'U-FACTORY RADIATORS',
    description: 'Distribuidora de autopartes en Miami. Consulta piezas por VIN.',
    type: 'website',
    locale: 'es_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
