'use client'
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
