import { useState, useEffect, useCallback } from "react";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  `}</style>
);

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0814; }
  :root {
    --bg: #0d0814; --surface: #130d1e; --surface2: #1a1228;
    --border: #2a1f40; --accent: #7c3aed; --accent2: #a78bfa;
    --green: #2ecc71; --text: #f0e8ff; --muted: #7050a0;
    --font-head: 'Syne', sans-serif; --font-mono: 'DM Mono', monospace;
  }
  @keyframes ticker { 0%{transform:translateY(0);opacity:1} 40%{transform:translateY(-6px);opacity:0} 60%{transform:translateY(6px);opacity:0} 100%{transform:translateY(0);opacity:1} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(124,58,237,.4)} 70%{box-shadow:0 0 0 14px rgba(124,58,237,0)} 100%{box-shadow:0 0 0 0 rgba(124,58,237,0)} }
  @keyframes fade-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fade-in { animation: fade-in .5s ease forwards; }
  .slide-up { animation: slide-up .4s ease forwards; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:24px; }
  .btn { display:inline-flex; align-items:center; gap:8px; font-family:var(--font-head); font-weight:700; font-size:14px; border-radius:10px; border:none; cursor:pointer; padding:10px 20px; transition:all .2s; }
  .btn-primary { background:var(--accent); color:#fff; }
  .btn-primary:hover { background:#6d28d9; transform:translateY(-1px); }
  .btn-ghost { background:var(--surface2); color:var(--text); border:1px solid var(--border); }
  .btn-ghost:hover { border-color:var(--accent2); color:var(--accent2); }
  input,select,textarea { background:var(--surface2); border:1px solid var(--border); color:var(--text); font-family:var(--font-mono); font-size:14px; border-radius:8px; padding:10px 14px; width:100%; outline:none; transition:border-color .2s; }
  input:focus,select:focus,textarea:focus { border-color:var(--accent); }
  label { font-family:var(--font-head); font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; display:block; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
`;

const fmt = (n) => n.toLocaleString("en-US", { style:"currency", currency:"USD", minimumFractionDigits:2 });
const fmtTime = (s) => {
  const d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sec=s%60;
  if(d>0) return `${d}d ${h}h ${m}m`;
  if(h>0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
};
const calcPrice = (base,max,pct) => base+(max-base)*pct;

function WidgetPreview({ config, ticking }) {
  const [secsLeft, setSecsLeft] = useState(config.durationSecs);
  const [prevPrice, setPrevPrice] = useState(null);
  const [flip, setFlip] = useState(false);

  useEffect(() => { setSecsLeft(config.durationSecs); }, [config.durationSecs]);
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => setSecsLeft((s) => Math.max(0, s-1)), 1000);
    return () => clearInterval(id);
  }, [ticking]);

  const pct = 1 - secsLeft / config.durationSecs;
  const price = calcPrice(config.basePrice, config.maxPrice, pct);

  useEffect(() => {
    if (prevPrice !== null && Math.abs(price - prevPrice) > 0.001) {
      setFlip(true); setTimeout(() => setFlip(false), 600);
    }
    setPrevPrice(price);
  }, [price]);

  const urgencyColor = pct>0.8?"#e879f9":pct>0.5?"#a78bfa":"#7c3aed";
  const barColor = pct>0.8?"linear-gradient(90deg,#a78bfa,#e879f9)":pct>0.5?"linear-gradient(90deg,#7c3aed,#a78bfa)":"linear-gradient(90deg,#5b21b6,#7c3aed)";

  return (
    <div style={{ background:config.darkMode?"#130d1e":"#ffffff", border:`2px solid ${urgencyColor}`, borderRadius:18, padding:28, maxWidth:340, fontFamily:"'Syne', sans-serif", boxShadow:`0 0 32px ${urgencyColor}33`, transition:"border-color .4s, box-shadow .4s" }}>
      <div style={{ fontSize:13, textTransform:"uppercase", letterSpacing:".1em", color:config.darkMode?"#7050a0":"#999", marginBottom:4 }}>{config.category}</div>
      <div style={{ fontSize:20, fontWeight:800, color:config.darkMode?"#f0e8ff":"#111", marginBottom:20 }}>{config.productName}</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:10, marginBottom:16 }}>
        <div style={{ fontSize:42, fontWeight:800, lineHeight:1, color:urgencyColor, animation:flip?"ticker .6s ease":"none", fontFamily:"'DM Mono', monospace", letterSpacing:"-.02em" }}>{fmt(price)}</div>
        <div style={{ fontSize:14, color:config.darkMode?"#7050a0":"#aaa", marginBottom:6, textDecoration:"line-through" }}>{fmt(config.maxPrice)}</div>
      </div>
      <div style={{ background:config.darkMode?"#2a1f40":"#f0f0f0", borderRadius:6, height:8, marginBottom:18, overflow:"hidden" }}>
        <div style={{ width:`${pct*100}%`, height:"100%", background:barColor, borderRadius:6, transition:"width 1s linear, background .4s" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <div style={{ fontSize:11, color:config.darkMode?"#7050a0":"#aaa", textTransform:"uppercase", letterSpacing:".08em" }}>Price locks in</div>
          <div style={{ fontSize:18, fontWeight:700, color:urgencyColor, fontFamily:"'DM Mono', monospace" }}>{secsLeft>0?fmtTime(secsLeft):"EXPIRED"}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:config.darkMode?"#7050a0":"#aaa", textTransform:"uppercase", letterSpacing:".08em" }}>Price rise</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#a78bfa", fontFamily:"'DM Mono', monospace" }}>+{fmt(config.maxPrice-config.basePrice)}</div>
        </div>
      </div>
      <button style={{ width:"100%", padding:"14px 0", background:urgencyColor, color:"#fff", border:"none", borderRadius:12, fontSize:16, fontWeight:800, fontFamily:"'Syne', sans-serif", cursor:"pointer", animation:pct>0.75?"pulse-ring 1.5s ease-in-out infinite":"none", transition:"background .4s" }}>{config.ctaText} {fmt(price)}</button>
      <div style={{ marginTop:12, fontSize:11, textAlign:"center", color:config.darkMode?"#3a2a50":"#ccc", fontFamily:"'DM Mono', monospace" }}>Price increases every second until deadline</div>
    </div>
  );
}

function AnalyticsPanel({ widgets }) {
  const totalRev = widgets.reduce((a,w) => a+w.revenue, 0);
  const totalConv = widgets.reduce((a,w) => a+w.conversions, 0);
  const activeWidgets = widgets.filter(w=>w.live).length;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
      {[
        { label:"Total Revenue", value:fmt(totalRev), sub:"Connect Stripe to track", color:"#2ecc71" },
        { label:"Conversions", value:totalConv, sub:"Sales tracked here", color:"#a78bfa" },
        { label:"Active Widgets", value:activeWidgets, sub:"Live right now", color:"#e879f9" },
      ].map((s) => (
        <div key={s.label} className="card" style={{ padding:20 }}>
          <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8, fontFamily:"var(--font-head)" }}>{s.label}</div>
          <div style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:"var(--font-mono)" }}>{s.value}</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:4, fontFamily:"var(--font-mono)" }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function WidgetRow({ w, onEdit, onDelete, onPreview }) {
  const urgencyColor = w.urgency>80?"#e879f9":w.urgency>50?"#a78bfa":"#7c3aed";
  return (
    <div className="card" style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", transition:"border-color .2s" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#3a2a50"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
      <div style={{ width:10, height:10, borderRadius:"50%", background:urgencyColor, flexShrink:0, animation:w.live?"pulse-ring 2s infinite":"none" }} />
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:15, color:"var(--text)" }}>{w.config.productName}</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--muted)", marginTop:2 }}>{fmt(w.config.basePrice)} → {fmt(w.config.maxPrice)} · {w.config.category}</div>
      </div>
      <div style={{ textAlign:"right", minWidth:90 }}>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:16, fontWeight:500, color:"var(--accent2)" }}>{fmt(w.revenue)}</div>
        <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--font-mono)" }}>{w.conversions} sales</div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button className="btn btn-ghost" style={{ padding:"6px 12px", fontSize:12 }} onClick={()=>onPreview(w)}>Preview</button>
        <button className="btn btn-ghost" style={{ padding:"6px 12px", fontSize:12 }} onClick={()=>onEdit(w)}>Edit</button>
        <button className="btn" style={{ padding:"6px 12px", fontSize:12, background:"transparent", color:"#e879f9", border:"1px solid #e879f933" }} onClick={()=>onDelete(w.id)}>✕</button>
      </div>
    </div>
  );
}

function BuilderModal({ initial, onSave, onClose }) {
  const DURATION_OPTIONS = [
    { label:"10 min", secs:600 },{ label:"30 min", secs:1800 },
    { label:"1 hour", secs:3600 },{ label:"6 hours", secs:21600 },
    { label:"24 hours", secs:86400 },{ label:"3 days", secs:259200 },
    { label:"7 days", secs:604800 },
  ];
  const [cfg, setCfg] = useState(initial || { productName:"", category:"Event", basePrice:29, maxPrice:99, durationSecs:3600, ctaText:"Buy Now for", darkMode:true });
  const [ticking, setTicking] = useState(false);
  const set = (k,v) => setCfg((c) => ({...c,[k]:v}));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div className="card fade-in" style={{ width:"min(92vw, 860px)", maxHeight:"90vh", overflowY:"auto", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:20, padding:0 }}>
        <div style={{ padding:"20px 28px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:18, color:"var(--text)" }}>{initial?"Edit Widget":"New Urgency Widget"}</div>
          <button className="btn btn-ghost" style={{ padding:"6px 12px" }} onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
          <div style={{ padding:28, borderRight:"1px solid var(--border)" }}>
            <div style={{ display:"grid", gap:18 }}>
              <div><label>Product / Service Name</label><input value={cfg.productName} onChange={e=>set("productName",e.target.value)} placeholder="e.g. VIP Concert Ticket" /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label>Category</label><select value={cfg.category} onChange={e=>set("category",e.target.value)}>{["Event","Service","Product","Booking","Course","Consultation"].map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label>Duration</label><select value={cfg.durationSecs} onChange={e=>set("durationSecs",Number(e.target.value))}>{DURATION_OPTIONS.map(o=><option key={o.secs} value={o.secs}>{o.label}</option>)}</select></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label>Starting Price ($)</label><input type="number" value={cfg.basePrice} onChange={e=>set("basePrice",Number(e.target.value))} /></div>
                <div><label>Max / Deadline Price ($)</label><input type="number" value={cfg.maxPrice} onChange={e=>set("maxPrice",Number(e.target.value))} /></div>
              </div>
              <div><label>CTA Button Text</label><input value={cfg.ctaText} onChange={e=>set("ctaText",e.target.value)} placeholder="Buy Now for" /></div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <label style={{ margin:0 }}>Dark Widget</label>
                <div onClick={()=>set("darkMode",!cfg.darkMode)} style={{ width:44, height:24, borderRadius:12, cursor:"pointer", background:cfg.darkMode?"var(--accent)":"var(--border)", position:"relative", transition:"background .2s" }}>
                  <div style={{ position:"absolute", top:3, left:cfg.darkMode?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .2s" }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop:24, display:"flex", gap:12 }}>
              <button className="btn btn-primary" onClick={()=>onSave(cfg)}>Save Widget</button>
              <button className="btn btn-ghost" onClick={()=>setTicking(t=>!t)}>{ticking?"⏸ Pause":"▶ Simulate"}</button>
            </div>
          </div>
          <div style={{ padding:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
            <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".1em", fontFamily:"var(--font-head)" }}>Live Preview</div>
            <WidgetPreview config={cfg} ticking={ticking} />
            <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--font-mono)", textAlign:"center" }}>Click ▶ Simulate to watch price rise</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedModal({ widget, onClose }) {
  const [copied, setCopied] = useState(false);
  const code = `<!-- PricePulse Widget: ${widget.config.productName} -->\n<div id="pp-widget-${widget.id}"></div>\n<script src="https://cdn.pricepulse.io/widget.js"\n  data-widget-id="${widget.id}"\n  data-api-key="YOUR_API_KEY">\n</script>`;
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div className="card fade-in" style={{ width:"min(92vw, 540px)", padding:28 }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:18, color:"var(--text)", marginBottom:8 }}>Embed Code</div>
        <div style={{ color:"var(--muted)", fontSize:13, marginBottom:20, fontFamily:"var(--font-mono)" }}>Paste into your website, Shopify store, or landing page.</div>
        <div style={{ background:"#0a0814", border:"1px solid var(--border)", borderRadius:10, padding:16, fontFamily:"var(--font-mono)", fontSize:13, color:"#a78bfa", whiteSpace:"pre-wrap", lineHeight:1.7, marginBottom:16 }}>{code}</div>
        <div style={{ display:"flex", gap:12 }}>
          <button className="btn btn-primary" onClick={copy}>{copied?"✓ Copied!":"Copy Code"}</button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [widgets, setWidgets] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editWidget, setEditWidget] = useState(null);
  const [previewWidget, setPreviewWidget] = useState(null);
  const [embedWidget, setEmbedWidget] = useState(null);
  const [nextId, setNextId] = useState(1);

  const saveWidget = useCallback((cfg) => {
    if (editWidget) {
      setWidgets(ws=>ws.map(w=>w.id===editWidget.id?{...w,config:cfg}:w));
      setEditWidget(null);
    } else {
      setWidgets(ws=>[...ws,{ id:`w${nextId}`, live:true, revenue:0, conversions:0, urgency:0, config:cfg }]);
      setNextId(n=>n+1);
    }
    setShowBuilder(false);
  }, [editWidget, nextId]);

  const deleteWidget = (id) => setWidgets(ws=>ws.filter(w=>w.id!==id));

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <FontLoader />
      <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"var(--font-head)" }}>
        <div style={{ position:"fixed", left:0, top:0, bottom:0, width:220, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", padding:"24px 0", zIndex:10 }}>
          <div style={{ padding:"0 24px 28px" }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-.02em" }}>
              <span style={{ color:"var(--accent2)" }}>Price</span><span style={{ color:"#e879f9" }}>Pulse</span>
            </div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:2, fontFamily:"var(--font-mono)" }}>Urgency Pricing Platform</div>
          </div>
          {[{ id:"dashboard",icon:"⬡",label:"Dashboard" },{ id:"widgets",icon:"◈",label:"My Widgets" },{ id:"analytics",icon:"◎",label:"Analytics" },{ id:"pricing",icon:"◆",label:"Plans" }].map(({id,icon,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 24px", background:"none", border:"none", cursor:"pointer", textAlign:"left", width:"100%", color:tab===id?"var(--accent2)":"var(--muted)", fontFamily:"var(--font-head)", fontWeight:600, fontSize:14, borderLeft:tab===id?"3px solid var(--accent2)":"3px solid transparent", transition:"all .15s" }}>
              <span style={{ fontSize:16 }}>{icon}</span> {label}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <div style={{ padding:"0 16px" }}>
            <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={()=>{ setEditWidget(null); setShowBuilder(true); }}>+ New Widget</button>
          </div>
        </div>

        <div style={{ marginLeft:220, padding:"32px 36px" }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:28, fontWeight:800, letterSpacing:"-.02em" }}>{{ dashboard:"Dashboard", widgets:"My Widgets", analytics:"Analytics", pricing:"Plans & Pricing" }[tab]}</div>
            <div style={{ color:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:13, marginTop:4 }}>{{ dashboard:"Your urgency pricing overview", widgets:"Manage your live pricing widgets", analytics:"Revenue & conversion insights", pricing:"Choose a plan that fits your business" }[tab]}</div>
          </div>

          {tab==="dashboard" && (
            <div className="fade-in" style={{ display:"grid", gap:24 }}>
              <AnalyticsPanel widgets={widgets} />
              {widgets.length===0?(
                <div className="card" style={{ textAlign:"center", padding:60 }}>
                  <div style={{ fontSize:40, marginBottom:16 }}>🚀</div>
                  <div style={{ fontWeight:800, fontSize:22, marginBottom:10 }}>You're live — now get your first customer</div>
                  <div style={{ color:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:14, marginBottom:28, maxWidth:480, margin:"0 auto 28px" }}>
                    Create your first widget, share the preview link, and watch your first sale come in.
                  </div>
                  <button className="btn btn-primary" style={{ fontSize:16, padding:"14px 32px" }} onClick={()=>{ setTab("widgets"); setShowBuilder(true); }}>
                    + Create Your First Widget
                  </button>
                </div>
              ):(
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Recent Sales</div>
                    <div style={{ color:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:13, textAlign:"center", padding:"24px 0" }}>No sales yet — your first is on the way! 💪</div>
                  </div>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>💡 Revenue Tips</div>
                    {[{ tip:"Short windows (1–6h) increase urgency conversion by ~3×",color:"#a78bfa" },{ tip:"Price gap of 2–3× base converts best for events",color:"#2ecc71" },{ tip:"Embed on checkout page, not product page, for +40% lift",color:"#e879f9" },{ tip:"Dark mode widgets outperform light on dark landing pages",color:"#7c3aed" }].map((t,i)=>(
                      <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<3?"1px solid var(--border)":"none" }}>
                        <div style={{ width:4, borderRadius:2, background:t.color, flexShrink:0 }} />
                        <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.5, fontFamily:"var(--font-mono)" }}>{t.tip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==="widgets" && (
            <div className="fade-in" style={{ display:"grid", gap:12 }}>
              {widgets.length===0&&(
                <div className="card" style={{ textAlign:"center", padding:48 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>◈</div>
                  <div style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>No widgets yet</div>
                  <div style={{ color:"var(--muted)", marginBottom:20, fontFamily:"var(--font-mono)", fontSize:13 }}>Create your first urgency pricing widget</div>
                  <button className="btn btn-primary" onClick={()=>setShowBuilder(true)}>+ Create Widget</button>
                </div>
              )}
              {widgets.map(w=>(<WidgetRow key={w.id} w={w} onEdit={w=>{setEditWidget(w);setShowBuilder(true);}} onDelete={deleteWidget} onPreview={setPreviewWidget} />))}
            </div>
          )}

          {tab==="analytics" && (
            <div className="fade-in" style={{ display:"grid", gap:24 }}>
              <AnalyticsPanel widgets={widgets} />
              <div className="card">
                <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Revenue by Widget</div>
                {widgets.length===0?(
                  <div style={{ color:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:13, textAlign:"center", padding:"24px 0" }}>No data yet — create a widget to start tracking.</div>
                ):(
                  widgets.map(w=>{ const maxRev=Math.max(...widgets.map(x=>x.revenue),1); const pct=(w.revenue/maxRev)*100; return (
                    <div key={w.id} style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
                        <span style={{ fontFamily:"var(--font-head)", fontWeight:600 }}>{w.config.productName}</span>
                        <span style={{ fontFamily:"var(--font-mono)", color:"var(--accent2)" }}>{fmt(w.revenue)}</span>
                      </div>
                      <div style={{ background:"var(--border)", borderRadius:4, height:8 }}>
                        <div style={{ width:`${pct}%`, height:"100%", borderRadius:4, background:"linear-gradient(90deg,var(--accent),var(--accent2))", transition:"width .6s ease" }} />
                      </div>
                    </div>
                  );})
                )}
              </div>
            </div>
          )}

          {tab==="pricing" && (
            <div className="fade-in" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
              {[
                { name:"Starter",price:"$29/mo",color:"#7050a0",features:["3 active widgets","Basic analytics","Email support","Embed on 1 domain"],cta:"Start Free Trial",link:"#" },
                { name:"Growth",price:"$79/mo",color:"var(--accent2)",highlight:true,features:["Unlimited widgets","Advanced analytics","A/B testing","5 domains","Priority support"],cta:"Get Growth",link:"#" },
                { name:"Agency",price:"$199/mo",color:"#e879f9",features:["Everything in Growth","White-label widgets","API access","Unlimited domains","Custom branding"],cta:"Contact Sales",link:"#" }
              ].map(p=>(
                <div key={p.name} className="card" style={{ border:p.highlight?`2px solid var(--accent2)`:"1px solid var(--border)", position:"relative", padding:28 }}>
                  {p.highlight&&(<div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"var(--accent2)", color:"#000", fontWeight:800, fontSize:11, padding:"3px 14px", borderRadius:20, whiteSpace:"nowrap", fontFamily:"var(--font-head)", textTransform:"uppercase" }}>Most Popular</div>)}
                  <div style={{ fontWeight:800, fontSize:18, color:p.color, marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontSize:30, fontWeight:800, marginBottom:20, fontFamily:"var(--font-mono)" }}>{p.price}</div>
                  {p.features.map(f=>(<div key={f} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:10, fontSize:13, color:"var(--muted)", fontFamily:"var(--font-mono)" }}><span style={{ color:p.color }}>✓</span> {f}</div>))}
                  <a href={p.link} style={{ textDecoration:"none" }}>
                    <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:20 }}>{p.cta}</button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginLeft:220, padding:"32px 36px 48px", borderTop:"1px solid var(--border)", marginTop:40, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--muted)" }}>
            © 2026 PricePulse · <a href="mailto:support@pricepulse.io" style={{ color:"var(--accent2)", textDecoration:"none" }}>support@pricepulse.io</a>
          </div>
          <div style={{ display:"flex", gap:24, fontFamily:"var(--font-mono)", fontSize:12 }}>
            <a href="#" onClick={e=>{e.preventDefault();alert("Refund Policy: All plans include a 7-day money-back guarantee. Contact support@pricepulse.io to request a refund.");}} style={{ color:"var(--muted)", textDecoration:"none", cursor:"pointer" }}>Refund Policy</a>
            <a href="#" onClick={e=>{e.preventDefault();alert("Cancellation Policy: Cancel anytime. No further charges after cancellation.");}} style={{ color:"var(--muted)", textDecoration:"none", cursor:"pointer" }}>Cancellation Policy</a>
            <a href="#" onClick={e=>{e.preventDefault();alert("Contact: support@pricepulse.io — We respond within 24 hours.");}} style={{ color:"var(--muted)", textDecoration:"none", cursor:"pointer" }}>Contact</a>
          </div>
        </div>
      </div>

      {showBuilder&&(<BuilderModal initial={editWidget?.config} onSave={saveWidget} onClose={()=>{ setShowBuilder(false); setEditWidget(null); }} />)}
      {previewWidget&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
          <div className="fade-in"><WidgetPreview config={previewWidget.config} ticking={true} /></div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn btn-primary" onClick={()=>{ setEmbedWidget(previewWidget); setPreviewWidget(null); }}>Get Embed Code</button>
            <button className="btn btn-ghost" onClick={()=>setPreviewWidget(null)}>Close</button>
          </div>
        </div>
      )}
      {embedWidget&&(<EmbedModal widget={embedWidget} onClose={()=>setEmbedWidget(null)} />)}
    </>
  );
}