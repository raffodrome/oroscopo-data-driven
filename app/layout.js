export const metadata = {
  title: 'Oroscopo Data-Driven',
  description: 'Previsioni personalizzate basate sui dati',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ background: 'linear-gradient(#eef2ff,#f0f9ff,#ffffff)', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
