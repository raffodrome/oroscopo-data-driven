export const metadata = {
  title: 'Oroscopo Data-Driven',
  description: 'Previsioni personalizzate basate sui dati',
  viewport: 'width=device-width, initial-scale=1', // 👈 fondamentale su mobile
  themeColor: '#4f46e5'
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body style={{ background: 'linear-gradient(#eef2ff,#f0f9ff,#ffffff)', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
