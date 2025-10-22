'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Calendar, CloudRain, Heart, Moon, Sun, Sparkles, Star, User, Zap, Activity, Clock, CloudSun, Wind, Snowflake } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

const LS_KEY = 'ddh_profile_v1'
const initialProfile = {
  name:'', age:'', city:'', cap:'',
  relationship:'single', work_status:'full_time',
  interests:['passeggiate','aperitivi','cinema'],
  chronotype:'neutral',
  sleep:{bedtime:'23:30', waketime:'07:30'},
  budget_per_outing:15, mobility:['piedi'],
  risk_novelty:'medio', indoor_on_rain:true
}
const weatherOptions = [
  { id:'sunny', label:'Sole', icon: Sun },
  { id:'cloudy', label:'Variabile', icon: CloudSun },
  { id:'rain', label:'Pioggia', icon: CloudRain },
  { id:'wind', label:'Vento', icon: Wind },
  { id:'hot', label:'Molto caldo', icon: Zap },
  { id:'cold', label:'Freddo', icon: Snowflake },
]
const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, Math.round(n)))

// ——— Meteo: mapping Open-Meteo → nostre categorie ———
function mapOpenMeteoToCategory({ weathercode, temperature_2m, windspeed_10m }){
  if (typeof temperature_2m === 'number') {
    if (temperature_2m >= 30) return 'hot'
    if (temperature_2m <= 5) return 'cold'
  }
  if ([0].includes(weathercode)) return 'sunny'
  if ([1,2,3,45,48].includes(weathercode)) return 'cloudy'
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99,71,73,75,77].includes(weathercode)) return 'rain'
  if (typeof windspeed_10m === 'number' && windspeed_10m >= 40) return 'wind'
  return 'cloudy'
}

export default function Home() {
  const [profile, setProfile] = useState(() => {
    try { const raw = localStorage.getItem(LS_KEY); return raw ? { ...initialProfile, ...JSON.parse(raw) } : initialProfile } catch { return initialProfile }
  })
  const [sleepHours, setSleepHours] = useState(7)
  const [mood, setMood] = useState(3)
  const [timeBudget, setTimeBudget] = useState(90)
  const [moneyBudget, setMoneyBudget] = useState(10)
  const [weather, setWeather] = useState('sunny')
  const [userEmail, setUserEmail] = useState('')
  const [sessionEmail, setSessionEmail] = useState(null)

  // Responsive: 1 elemento per riga su mobile, 2 su schermo grande
  const [cols, setCols] = useState(1)
  useEffect(()=>{
    const onResize = () => setCols(window.innerWidth < 720 ? 1 : 2)
    onResize(); window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Meteo reale con geolocalizzazione (permesso dell'utente)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | loading | ok | err
  async function getWeatherFromBrowser(){
    try{
      setGeoStatus('loading')
      const pos = await new Promise((res, rej)=> navigator.geolocation ? navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy:false, timeout:8000 }) : rej(new Error('no geo')))
      const { latitude, longitude } = pos.coords
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
      const r = await fetch(url)
      const data = await r.json()
      const cur = data.current || {}
      const cat = mapOpenMeteoToCategory({ weathercode: cur.weather_code, temperature_2m: cur.temperature_2m, windspeed_10m: cur.wind_speed_10m })
      setWeather(cat)
      setGeoStatus('ok')
    }catch(e){ setGeoStatus('err') }
  }

  useEffect(()=>{ const id=setTimeout(()=>localStorage.setItem(LS_KEY, JSON.stringify(profile)),250); return ()=>clearTimeout(id) }, [profile])

  const scores = useMemo(()=>{
    let energy=50; energy+=(sleepHours-7)*6; const age=Number(profile.age||35); if(age<30) energy+=4; else if(age>=55) energy-=4; if(['hot','cold'].includes(weather)) energy-=4; if(weather==='sunny') energy+=3
    let moodScore=45+(mood-3)*10; if(weather==='sunny') moodScore+=4; if(weather==='rain') moodScore-= profile.indoor_on_rain?1:3
    let social=40; social+= profile.relationship==='single'?6:2; if(timeBudget>=90) social+=8; else if(timeBudget>=45) social+=4; if(profile.chronotype==='evening') social+=3
    let stress=40; if(sleepHours<6) stress+=12; if(timeBudget<45) stress+=8; if(['hot','wind'].includes(weather)) stress+=4
    return { energy:clamp(energy), mood:clamp(moodScore), social:clamp(social), stress:clamp(stress) }
  }, [sleepHours,mood,timeBudget,profile,weather])

  const windows = useMemo(()=>{
    const res=[]; const push=(label,Icon)=>res.push({label,Icon})
    if(profile.chronotype==='morning'){ push('08:30–10:30 • Focus/commissioni',Sun); push('18:00–20:00 • Social leggero', CloudSun) }
    else if(profile.chronotype==='evening'){ push('10:00–12:00 • Focus',Sun); push('19:00–21:30 • Social/tempo libero', Moon) }
    else { push('10:00–12:00 • Focus', Sun); push('17:30–19:30 • Social leggero', CloudSun) }
    return res
  }, [profile.chronotype])

  const tips = useMemo(()=>{
    const arr=[]
    if(scores.social>=60 && timeBudget>=60){
      if(weather==='rain' && profile.indoor_on_rain){ arr.push({ title:'Serata sociale indoor', reason:'Socialità alta + pioggia', action:`Cinema o aperitivo in ${profile.city||'zona'} (budget €${moneyBudget}).`, Icon:Heart }) }
      else { arr.push({ title:'Invito last-minute', reason:'Hai tempo e voglia', action:'Scrivi a 2 amici per un caffè o passeggiata al tramonto.', Icon:Heart }) }
    }
    if(scores.energy>=55){ arr.push({ title:"30' movimento leggero", reason:'Energia buona', action: weather==='sunny'?'Camminata all’aperto':'Stretching a casa', Icon:Activity }) }
    else { arr.push({ title:'Recovery intelligente', reason:'Energia bassa', action:"Idratazione + 10' respirazione 4-7-8 + a letto 30' prima.", Icon:Moon }) }
    arr.push({ title:"Blocco focus 45'", reason: windows[0]?.label||'', action:'Modalità aereo + to-do 3 elementi.', Icon:Calendar })
    return arr.slice(0,3)
  }, [scores,timeBudget,weather,profile,windows,moneyBudget])

  async function signInWithEmail(){
    if(!supabase) return alert('Configura Supabase nelle variabili .env')
    if(!userEmail) return alert('Inserisci email')
    const { error } = await supabase.auth.signInWithOtp({ email: userEmail, options: { emailRedirectTo: (typeof window!=='undefined' ? window.location.origin : '') } })
    if(error) alert(error.message); else alert('Controlla la tua email per il link di accesso')
  }

  useEffect(()=>{ if(!supabase) return; const { data } = supabase.auth.onAuthStateChange((_event, session)=>{ setSessionEmail(session?.user?.email||null) }); return ()=>{ data.subscription.unsubscribe() } },[])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 12px' }}>
      <header style={{ display:'flex', flexDirection: cols===1 ? 'column' : 'row', alignItems: cols===1 ? 'flex-start' : 'center', justifyContent: cols===1 ? 'flex-start' : 'space-between', gap: cols===1 ? 8 : 0, marginBottom: 16 }}>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ padding:8, borderRadius:16, background:'#4f46e5', color:'#fff' }}><Sparkles size={18}/></div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Oroscopo Data-Driven</h1>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {sessionEmail ? <span style={{ fontSize:12 }}>Connesso: {sessionEmail}</span> : (
            <div style={{ display:'flex', gap:6 }}>
              <input placeholder="la-tua-email" value={userEmail} onChange={(e)=>setUserEmail(e.target.value)} style={{ padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:12 }}/>
              <button onClick={signInWithEmail} style={{ padding:'8px 12px', borderRadius:12, background:'#4f46e5', color:'#fff' }}>Accedi</button>
            </div>
          )}
          <button onClick={()=>alert('Profilo rapido: compila i campi qui sotto')} style={{ padding:'8px 12px', borderRadius:12, border:'1px solid #d1d5db', background:'#fff' }}>Profilo</button>
        </div>
      </header>

      <main style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
        <Card title="Check-in di oggi" Icon={Calendar} subtitle="Aggiorna in 10 secondi">
          <div style={{ display:'grid', gap:12 }}>
            <Range label="Ore dormite" min={3} max={10} step={0.5} value={sleepHours} onChange={setSleepHours} suffix="h"/>
            <Range label="Umore ora" min={1} max={5} value={mood} onChange={setMood} />
            {/* 1 elemento per riga su mobile; 2 su desktop */}
            <div style={{ display:'grid', gridTemplateColumns: cols===1?'1fr':'1fr 1fr', gap:12 }}>
              <NumberField label="Tempo libero (min)" value={timeBudget} onChange={setTimeBudget} />
              <NumberField label="Budget (€)" value={moneyBudget} onChange={setMoneyBudget} />
            </div>
            <div>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Meteo</span>
                <button onClick={getWeatherFromBrowser} style={{ padding:'6px 10px', borderRadius:10, border:'1px solid #d1d5db', background:'#fff' }}>
                  {geoStatus==='loading' ? 'Rilevo…' : 'Rileva meteo attuale'}
                </button>
                <span style={{ fontSize:11, color:'#94a3b8' }}>(usa la tua posizione, chiede il permesso)</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: cols===1?'1fr':'1fr 1fr 1fr', gap:8 }}>
                {weatherOptions.map(w=>{
                  const Icon = w.icon; const active = weather===w.id
                  return (
                    <button key={w.id} onClick={()=>setWeather(w.id)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:12, border:'1px solid', borderColor: active?'#4f46e5':'#e5e7eb', background: active?'#eef2ff':'#fff' }}>
                      <Icon size={16}/><span style={{ fontSize:12 }}>{w.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Il tuo oroscopo di oggi (data-driven)" Icon={Sparkles} subtitle="0–100, più alto è meglio.">
          <div style={{ display:'grid', gridTemplateColumns: cols===1?'1fr':'1fr 1fr', gap:8 }}>
            <Score label="Energia" value={scores.energy} Icon={Zap} />
            <Score label="Umore" value={scores.mood} Icon={Sun} />
            <Score label="Socialità" value={scores.social} Icon={Heart} />
            <Score label="Stress" value={scores.stress} Icon={Activity} />
          </div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:8 }}>*Meteo reale disponibile con pulsante “Rileva meteo attuale”.</div>
        </Card>

        <Card title="Consigli personalizzati" Icon={Star} subtitle="Tre azioni concrete">
          <div style={{ display:'grid', gap:8 }}>
            {tips.map((t,i)=>{
              const I=t.Icon
              return (
                <div key={i} style={{ padding:12, borderRadius:16, border:'1px solid #e5e7eb', background:'#fff' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}><I size={16}/><strong style={{ fontSize:14 }}>{t.title}</strong></div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{t.reason}</div>
                  <div style={{ marginTop:6, fontSize:14 }}>{t.action}</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Finestre ideali" Icon={Clock} subtitle="Quando rendi meglio oggi">
          <div style={{ display:'grid', gap:8 }}>
            {windows.map((w,i)=>{
              const I = w.Icon
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:10, borderRadius:12, background:'#f8fafc', border:'1px solid #e5e7eb' }}>
                  <I size={16}/><span style={{ fontSize:14 }}>{w.label}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Profilo rapido" Icon={User} subtitle="Dati minimi">
          <div style={{ display:'grid', gap:10 }}>
            <div style={{ display:'grid', gridTemplateColumns: cols===1?'1fr':'1fr 1fr', gap:10 }}>
              <TextField label="Nome" value={profile.name} onChange={v=>setProfile(p=>({...p,name:v}))}/>
              <TextField label="Età" type="number" value={profile.age} onChange={v=>setProfile(p=>({...p,age:v}))}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: cols===1?'1fr':'1fr 1fr 1fr', gap:10 }}>
              <TextField label="Città" value={profile.city} onChange={v=>setProfile(p=>({...p,city:v}))}/>
              <TextField label="CAP" value={profile.cap} onChange={v=>setProfile(p=>({...p,cap:v}))}/>
              <Select label="Relazione" value={profile.relationship} onChange={v=>setProfile(p=>({...p,relationship:v}))} options={[['single','Single'],['couple','In coppia'],['genitore','Genitore']]}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: cols===1?'1fr':'1fr 1fr', gap:10 }}>
              <Select label="Lavoro" value={profile.work_status} onChange={v=>setProfile(p=>({...p,work_status:v}))} options={[["full_time","Full-time"],["part_time","Part-time"],["studente","Studente"],["turni","Turni"],["disoccupato","Non occupato"]]}/>
              <Select label="Cronotipo" value={profile.chronotype} onChange={v=>setProfile(p=>({...p,chronotype:v}))} options={[["neutral","Neutro"],["morning","Mattiniero"],["evening","Serale"]]}/>
            </div>
          </div>
        </Card>
      </main>

      <footer style={{ marginTop:24, fontSize:12, color:'#64748b' }}>
        Prototipo non medico. Suggerimenti di benessere/socialità basati sui dati inseriti.
      </footer>
    </div>
  )
}

function Card({ title, subtitle, Icon, children }){
  return (
    <section style={{ background:'#ffffffcc', backdropFilter:'blur(6px)', border:'1px solid #e5e7eb', borderRadius:20, padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        {Icon && <Icon size={18} color="#334155"/>}
        <h2 style={{ fontSize:16, fontWeight:600 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize:12, color:'#64748b', marginTop:-4, marginBottom:8 }}>{subtitle}</p>}
      {children}
    </section>
  )
}
function TextField({ label, value, onChange, type='text' }){
  return (
    <label style={{ display:'grid', gap:6 }}>
      <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} style={{ padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:12 }}/>
    </label>
  )
}
function NumberField({ label, value, onChange }){
  return (
    <label style={{ display:'grid', gap:6 }}>
      <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
      <input type="number" value={value} onChange={e=>onChange(parseInt(e.target.value||'0'))} style={{ padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:12 }}/>
    </label>
  )
}
function Select({ label, value, onChange, options }){
  return (
    <label style={{ display:'grid', gap:6 }}>
      <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:12 }}>
        {options.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}
function Range({ label, value, onChange, min=0, max=100, step=1, suffix='' }){
  return (
    <label style={{ display:'grid', gap:6 }}>
      <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{ width:'100%' }}/>
      <div style={{ fontSize:12, color:'#64748b' }}>{value}{suffix}</div>
    </label>
  )
}

function Score({ label, value, Icon }) {
  const bg = value >= 70 ? '#dcfce7' : value >= 40 ? '#fef9c3' : '#fee2e2';
  const fg = value >= 70 ? '#166534' : value >= 40 ? '#854d0e' : '#991b1b';
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      gap:8, padding:12, borderRadius:12, background:bg, color:fg
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        {Icon && <Icon size={16} />}
        <span style={{ fontWeight:600 }}>{label}</span>
      </div>
      <strong style={{ fontVariantNumeric:'tabular-nums' }}>{value}</strong>
    </div>
  );
}
