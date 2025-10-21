export const metadata = { title: 'Oroscopo Data‑Driven', description: 'Previsioni personalizzate basate sui dati' };
export default function RootLayout({ children }) {
return (
<html lang="it">
<body style={{ background: 'linear-gradient(#eef2ff,#f0f9ff,#ffffff)', minHeight: '100vh' }}>{children}</body>
</html>
);
}
