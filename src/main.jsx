import React, { useMemo, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Maximize2, X, ChevronLeft, ChevronRight, Presentation, Menu, ExternalLink } from 'lucide-react'
import { slides, sections } from './data.js'
import './style.css'

const img = n => `${import.meta.env.BASE_URL}slides/slide-${String(n).padStart(2,'0')}.jpg`

function useKey(handler){
  useEffect(()=>{ const f=e=>handler(e); window.addEventListener('keydown',f); return()=>window.removeEventListener('keydown',f)},[handler])
}

function App(){
  const [query,setQuery]=useState('')
  const [active,setActive]=useState(1)
  const [lightbox,setLightbox]=useState(null)
  const [navOpen,setNavOpen]=useState(false)
  const filtered=useMemo(()=>slides.filter(s=>(s.title+s.text+s.n).toLowerCase().includes(query.toLowerCase())),[query])
  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) setActive(Number(e.target.dataset.slide)) })
    },{threshold:.58})
    document.querySelectorAll('.slide-card').forEach(el=>obs.observe(el))
    return()=>obs.disconnect()
  },[filtered])
  useKey(e=>{
    if(lightbox){
      if(e.key==='Escape') setLightbox(null)
      if(e.key==='ArrowRight') setLightbox(Math.min(50, lightbox+1))
      if(e.key==='ArrowLeft') setLightbox(Math.max(1, lightbox-1))
    }
  })
  const progress = Math.round(active/50*100)
  return <>
    <div className="progress" style={{width:`${progress}%`}} />
    <header className="hero">
      <button className="hamb" onClick={()=>setNavOpen(!navOpen)}><Menu size={20}/></button>
      <div className="hero-copy">
        <span className="eyebrow">CWA Earthquake Early Warning</span>
        <h1>臺灣地震預警系統的演進與發展</h1>
        <p>將原始50頁簡報轉為可搜尋、可放大、可用鍵盤導覽的動態互動網頁。保留所有圖文內容，並加入章節導覽、演講模式與重點互動時間軸。</p>
        <div className="hero-actions">
          <a href="#slides" className="primary">開始瀏覽</a>
          <button onClick={()=>setLightbox(active)} className="secondary"><Presentation size={18}/> 演講模式</button>
          <a className="secondary" href="https://github.com/oceanicdayi/cwa_eew_2026_gemini" target="_blank" rel="noreferrer">◆ GitHub</a>
        </div>
      </div>
      <div className="hero-panel">
        <div className="metric"><b>50</b><span>簡報頁面</span></div>
        <div className="metric"><b>7</b><span>主題章節</span></div>
        <div className="metric"><b>102→7秒</b><span>警報時效演進</span></div>
      </div>
    </header>

    <aside className={navOpen?'nav open':'nav'}>
      <h2>章節導覽</h2>
      {sections.map(sec=><a key={sec.id} href={`#${sec.id}`} onClick={()=>setNavOpen(false)}>
        <strong>{sec.title}</strong><span>第{sec.range[0]}–{sec.range[1]}頁</span>
      </a>)}
    </aside>

    <main>
      <section className="interactive" id="overview">
        <h2>互動重點</h2>
        <div className="cards">
          <Feature title="警報發布時效" value="102秒 → 7秒" text="盲區半徑由35公里縮減到25公里，提升都會區應變時間。" />
          <Feature title="海嘯警報作業" value="6分區 / 4級" text="依威脅、海底地形與行政區域建立分區與波高分級。" />
          <Feature title="防救災串接" value="4500+單位" text="地震速報資訊直送學校、公路、軌道與防救災單位。" />
          <Feature title="AI現地型預警" value="P波 + ML" text="使用初期波形與機器學習模型預估震度。" />
        </div>
      </section>

      <section className="timeline">
        <h2>與地震波賽跑：系統演進</h2>
        <div className="rail">
          {['1994–2003 系統建置','2003–2009 測站加密','2009–2020 技術革新','2020–2025 發布精緻化','2025–迄今 AI與現地預警'].map((t,i)=><div className="milestone" key={t}><span>{i+1}</span><p>{t}</p></div>)}
        </div>
      </section>

      <section className="searchbar" id="slides">
        <div><h2>完整簡報內容</h2><p>所有頁面以高解析圖片保留，可點擊放大檢查細節。</p></div>
        <label><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜尋頁碼、標題或關鍵字…" /></label>
      </section>

      {sections.map(sec=>{
        const list=filtered.filter(s=>s.section===sec.id)
        if(!list.length) return null
        return <section className="deck-section" id={sec.id} key={sec.id}>
          <div className="section-title"><span>第{sec.range[0]}–{sec.range[1]}頁</span><h2>{sec.title}</h2><p>{sec.accent}</p></div>
          <div className="slide-grid">
            {list.map(s=><article className="slide-card" data-slide={s.n} key={s.n}>
              <button className="image-button" onClick={()=>setLightbox(s.n)} aria-label={`放大第${s.n}頁`}>
                <img src={img(s.n)} alt={`第${s.n}頁：${s.title}`} loading="lazy" />
                <span className="zoom"><Maximize2 size={16}/> 點擊放大</span>
              </button>
              <div className="caption"><span>Page {String(s.n).padStart(2,'0')}</span><h3>{s.title}</h3><p>{s.text}</p></div>
            </article>)}
          </div>
        </section>
      })}
    </main>
    <footer>© 中央氣象署地震測報中心簡報轉製 · GitHub Pages ready <ExternalLink size={14}/></footer>
    {lightbox && <Lightbox n={lightbox} set={setLightbox}/>} 
  </>
}
function Feature({title,value,text}){return <article className="feature"><span>{title}</span><b>{value}</b><p>{text}</p></article>}
function Lightbox({n,set}){
  const s=slides.find(x=>x.n===n)
  return <div className="lightbox" role="dialog" aria-modal="true">
    <div className="lb-top"><div><b>第{n}頁</b><span>{s?.title}</span></div><button onClick={()=>set(null)}><X/></button></div>
    <button className="arrow left" onClick={()=>set(Math.max(1,n-1))} disabled={n===1}><ChevronLeft/></button>
    <img src={img(n)} alt={`第${n}頁放大`} />
    <button className="arrow right" onClick={()=>set(Math.min(50,n+1))} disabled={n===50}><ChevronRight/></button>
    <div className="lb-help">← → 切換頁面，Esc 關閉</div>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
