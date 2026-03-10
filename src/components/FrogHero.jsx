// src/components/FrogHero.jsx
export default function FrogHero({ t, style, name, quote }) {
  const main   = t?.primary       || "#3DBE6B"
  const dark   = t?.primaryBright || "#2A8A40"
  const glow   = t?.primaryGlow   || "rgba(61,190,107,0.5)"
  const bg     = t?.surface       || "#1C1C1C"
  const border = t?.border        || "#2E2E2E"
  const text   = t?.text          || "#FFFFFF"
  const muted  = t?.textMuted     || "#888888"

  const greeting = name ? `Привет, ${name}! 👋` : "Привет! 👋"

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", position: "relative",
      ...style
    }}>
      <style>{`
        @keyframes fh-breathe { 0%,100%{transform:scaleY(1) scaleX(1)} 50%{transform:scaleY(1.04) scaleX(0.97)} }
        @keyframes fh-blink   { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.06)} }
        @keyframes fh-float   { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes fh-leg-l   { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(-18deg)} }
        @keyframes fh-leg-r   { 0%,100%{transform:rotate(8deg)} 50%{transform:rotate(18deg)} }
        @keyframes fh-arm-l   { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(10deg)} }
        @keyframes fh-arm-r   { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(10deg)} }
        @keyframes fh-tongue  { 0%,80%,100%{transform:scaleY(0);opacity:0} 88%,96%{transform:scaleY(1);opacity:1} }
        @keyframes fh-shine   { 0%,100%{opacity:0.9} 50%{opacity:0.35} }
        @keyframes fh-glow    { 0%,100%{filter:drop-shadow(0 10px 24px ${glow})} 50%{filter:drop-shadow(0 16px 44px ${glow})} }
        @keyframes fh-dot     { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes fh-blush   { 0%,100%{opacity:0.28} 50%{opacity:0.48} }
        @keyframes fh-bubble  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }
        @keyframes fh-bubble-in { from{opacity:0;transform:scale(0.85) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .fh-svg    { animation: fh-glow 3.5s ease-in-out infinite; }
        .fh-body   { animation: fh-breathe 3s ease-in-out infinite, fh-float 4s ease-in-out infinite; transform-origin: center; }
        .fh-eye-l  { animation: fh-blink 4s ease-in-out infinite; transform-origin: 68px 72px; }
        .fh-eye-r  { animation: fh-blink 4s ease-in-out infinite 0.15s; transform-origin: 132px 72px; }
        .fh-arm-l  { animation: fh-arm-l 3s ease-in-out infinite; transform-origin: top center; }
        .fh-arm-r  { animation: fh-arm-r 3s ease-in-out infinite 1.5s; transform-origin: top center; }
        .fh-leg-l  { animation: fh-leg-l 3.5s ease-in-out infinite; }
        .fh-leg-r  { animation: fh-leg-r 3.5s ease-in-out infinite 0.8s; }
        .fh-tongue { animation: fh-tongue 5s ease-in-out infinite 2s; transform-origin: top center; }
        .fh-shine  { animation: fh-shine 3s ease-in-out infinite; }
        .fh-dot1   { animation: fh-dot 2s ease-in-out infinite 0s; }
        .fh-dot2   { animation: fh-dot 2s ease-in-out infinite 0.7s; }
        .fh-dot3   { animation: fh-dot 2s ease-in-out infinite 1.4s; }
        .fh-blush  { animation: fh-blush 2.5s ease-in-out infinite; }
        .fh-bubble { animation: fh-bubble 3s ease-in-out infinite, fh-bubble-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.3s; }
      `}</style>

      {/* Речевой пузырь */}
      <div className="fh-bubble" style={{
        position: "absolute",
        top: 8, left: 0, right: 4,
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: "16px 16px 16px 4px",
        padding: "10px 13px",
        boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px ${main}22`,
        zIndex: 20,
      }}>
        {/* Хвостик — верхний слой (граница) */}
        <div style={{
          position: "absolute", bottom: -11, left: 16,
          width: 0, height: 0,
          borderLeft: "11px solid transparent",
          borderTop: `11px solid ${border}`,
        }}/>
        {/* Хвостик — нижний слой (заливка) */}
        <div style={{
          position: "absolute", bottom: -9, left: 17,
          width: 0, height: 0,
          borderLeft: "9px solid transparent",
          borderTop: `9px solid ${bg}`,
        }}/>

        <div style={{
          fontWeight: 900, fontSize: 12,
          color: main, marginBottom: 3,
          fontFamily: "'Nunito', sans-serif",
          whiteSpace: "nowrap",
        }}>
          {greeting}
        </div>

        {quote && (
          <div style={{
            fontWeight: 600, fontSize: 10,
            color: muted, lineHeight: 1.5,
            fontFamily: "'Nunito', sans-serif",
          }}>
            {quote}
          </div>
        )}
      </div>

      {/* Лягушка */}
      <div style={{ marginTop: 48 }}>
        <svg className="fh-svg" viewBox="0 0 200 220" width="145" height="160" style={{ overflow: "visible" }}>
          <ellipse cx="100" cy="216" rx="44" ry="7" fill="rgba(0,0,0,0.15)"/>
          <g className="fh-body">
            <g className="fh-leg-l" style={{ transformOrigin: "58px 162px" }}>
              <ellipse cx="52" cy="178" rx="20" ry="11" fill={main}/>
              <ellipse cx="36" cy="186" rx="11" ry="7" fill={dark}/>
              <circle cx="27" cy="186" r="5" fill={dark}/><circle cx="34" cy="192" r="5" fill={dark}/><circle cx="43" cy="193" r="5" fill={dark}/>
            </g>
            <g className="fh-leg-r" style={{ transformOrigin: "142px 162px" }}>
              <ellipse cx="148" cy="178" rx="20" ry="11" fill={main}/>
              <ellipse cx="164" cy="186" rx="11" ry="7" fill={dark}/>
              <circle cx="173" cy="186" r="5" fill={dark}/><circle cx="166" cy="192" r="5" fill={dark}/><circle cx="157" cy="193" r="5" fill={dark}/>
            </g>
            <ellipse cx="100" cy="155" rx="56" ry="48" fill={main}/>
            <ellipse cx="100" cy="163" rx="36" ry="33" fill="rgba(255,255,255,0.18)"/>
            <g className="fh-arm-l" style={{ transformOrigin: "48px 142px" }}>
              <ellipse cx="46" cy="155" rx="11" ry="8" fill={main} transform="rotate(-20,46,155)"/>
              <circle cx="36" cy="161" r="6" fill={dark}/><circle cx="30" cy="154" r="5" fill={dark}/><circle cx="33" cy="147" r="5" fill={dark}/>
            </g>
            <g className="fh-arm-r" style={{ transformOrigin: "152px 142px" }}>
              <ellipse cx="154" cy="155" rx="11" ry="8" fill={main} transform="rotate(20,154,155)"/>
              <circle cx="164" cy="161" r="6" fill={dark}/><circle cx="170" cy="154" r="5" fill={dark}/><circle cx="167" cy="147" r="5" fill={dark}/>
            </g>
            <ellipse cx="100" cy="110" rx="54" ry="50" fill={main}/>
            <ellipse cx="82" cy="90" rx="15" ry="9" fill="rgba(255,255,255,0.13)" transform="rotate(-20,82,90)"/>
            <circle cx="68"  cy="72" r="28" fill={main}/><circle cx="68"  cy="72" r="22" fill="white"/>
            <g className="fh-eye-l">
              <circle cx="68" cy="74" r="14" fill="#1a1a1a"/><circle cx="68" cy="74" r="8" fill="#111"/>
              <circle cx="62" cy="68" r="5" fill="white" className="fh-shine"/><circle cx="74" cy="79" r="2" fill="rgba(255,255,255,0.5)"/>
            </g>
            <circle cx="132" cy="72" r="28" fill={main}/><circle cx="132" cy="72" r="22" fill="white"/>
            <g className="fh-eye-r">
              <circle cx="132" cy="74" r="14" fill="#1a1a1a"/><circle cx="132" cy="74" r="8" fill="#111"/>
              <circle cx="126" cy="68" r="5" fill="white" className="fh-shine"/><circle cx="138" cy="79" r="2" fill="rgba(255,255,255,0.5)"/>
            </g>
            <circle cx="92"  cy="120" r="3.5" fill="rgba(0,0,0,0.25)"/>
            <circle cx="108" cy="120" r="3.5" fill="rgba(0,0,0,0.25)"/>
            <path d="M 78 132 Q 100 148 122 132" stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <g className="fh-tongue" style={{ transformOrigin: "100px 136px" }}>
              <path d="M 88 137 Q 100 156 112 137" fill="#FF6B8A" stroke="#E05070" strokeWidth="1.5"/>
            </g>
            <circle cx="84"  cy="162" r="7" fill="rgba(0,0,0,0.1)" className="fh-dot1"/>
            <circle cx="116" cy="167" r="6" fill="rgba(0,0,0,0.1)" className="fh-dot2"/>
            <circle cx="100" cy="174" r="5" fill="rgba(0,0,0,0.1)" className="fh-dot3"/>
            <ellipse cx="62"  cy="125" rx="12" ry="7" fill="#FF9999" className="fh-blush"/>
            <ellipse cx="138" cy="125" rx="12" ry="7" fill="#FF9999" className="fh-blush"/>
          </g>
        </svg>
      </div>
    </div>
  )
}