# Oroscopo Data-Driven (MVP)

Sito Next.js con Supabase (login email) e meteo reale (Open-Meteo). PWA installabile.

## Setup locale
1. `npm install`
2. Copia `.env.example` in `.env.local` e inserisci:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `npm run dev` → http://localhost:3000

## Deploy
- Collega il repo a **Vercel** → aggiungi le Environment Variables con i valori di Supabase → Deploy.

## PWA
- Manifest incluso (`app/manifest.webmanifest`), icone in `public/`. Su mobile: “Aggiungi a schermata Home”.
