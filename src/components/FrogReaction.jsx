// src/components/FrogReaction.jsx
// Варианты: "jump" | "like" | "angry" | "cry" | "eyeroll"

export default function FrogReaction({ t, variant = "jump", size = 120 }) {
    const main  = t?.primary       || "#3DBE6B"
    const dark  = t?.primaryBright || "#2A8A40"
    const glow  = t?.primaryGlow   || "rgba(61,190,107,0.5)"
  
    const id = `fr-${variant}` // уникальный префикс для анимаций
  
    const styles = {
      jump: `
        @keyframes ${id}-body { 0%,100%{transform:translateY(0) scaleX(1) scaleY(1)} 20%{transform:translateY(4px) scaleX(1.15) scaleY(0.85)} 45%{transform:translateY(-36px) scaleX(0.92) scaleY(1.1)} 70%{transform:translateY(-8px) scaleX(1) scaleY(1)} 85%{transform:translateY(0) scaleX(1.08) scaleY(0.92)} }
        @keyframes ${id}-leg  { 0%,100%{transform:rotate(0deg)} 45%{transform:rotate(-30deg)} }
        @keyframes ${id}-shine{ 0%,100%{opacity:0.9} 50%{opacity:0.4} }
        @keyframes ${id}-glow { 0%,100%{filter:drop-shadow(0 8px 20px ${glow})} 45%{filter:drop-shadow(0 20px 40px ${glow})} }
        .${id}-wrap { animation: ${id}-glow 1s ease-in-out infinite; }
        .${id}-body { animation: ${id}-body 1s cubic-bezier(0.22,1,0.36,1) infinite; transform-origin: center bottom; }
        .${id}-leg-l{ animation: ${id}-leg  1s ease-in-out infinite; transform-origin: top center; }
        .${id}-leg-r{ animation: ${id}-leg  1s ease-in-out infinite 0.05s; transform-origin: top center; }
        .${id}-shine{ animation: ${id}-shine 1s ease-in-out infinite; }
      `,
      like: `
        @keyframes ${id}-body { 0%,100%{transform:rotate(0deg) scale(1)} 30%{transform:rotate(-4deg) scale(1.04)} 60%{transform:rotate(3deg) scale(1.02)} }
        @keyframes ${id}-arm  { 0%,100%{transform:rotate(0deg)} 40%{transform:rotate(-50deg) translateY(-6px)} 70%{transform:rotate(-45deg) translateY(-5px)} }
        @keyframes ${id}-thumb{ 0%,100%{transform:scale(1)} 40%,70%{transform:scale(1.3)} }
        @keyframes ${id}-shine{ 0%,100%{opacity:0.9} 50%{opacity:0.4} }
        @keyframes ${id}-glow { 0%,100%{filter:drop-shadow(0 8px 20px ${glow})} 50%{filter:drop-shadow(0 12px 32px ${glow})} }
        .${id}-wrap  { animation: ${id}-glow 1.2s ease-in-out infinite; }
        .${id}-body  { animation: ${id}-body 1.2s ease-in-out infinite; transform-origin: center; }
        .${id}-arm-r { animation: ${id}-arm  1.2s cubic-bezier(0.34,1.56,0.64,1) infinite; transform-origin: 154px 142px; }
        .${id}-thumb { animation: ${id}-thumb 1.2s ease-in-out infinite; transform-origin: center; }
        .${id}-shine { animation: ${id}-shine 1.2s ease-in-out infinite; }
      `,
      angry: `
        @keyframes ${id}-body { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes ${id}-brow { 0%,100%{transform:rotate(-18deg) translateY(0)} 50%{transform:rotate(-22deg) translateY(2px)} }
        @keyframes ${id}-shine{ 0%,100%{opacity:0.9} 50%{opacity:0.4} }
        @keyframes ${id}-steam{ 0%{opacity:0;transform:translateY(0) scale(0.5)} 30%{opacity:1;transform:translateY(-8px) scale(1)} 100%{opacity:0;transform:translateY(-20px) scale(1.5)} }
        @keyframes ${id}-glow { 0%,100%{filter:drop-shadow(0 8px 20px rgba(255,80,80,0.4))} 50%{filter:drop-shadow(0 10px 30px rgba(255,80,80,0.7))} }
        .${id}-wrap  { animation: ${id}-glow 0.6s ease-in-out infinite; }
        .${id}-body  { animation: ${id}-body 0.5s ease-in-out infinite; transform-origin: center; }
        .${id}-brow-l{ animation: ${id}-brow 0.5s ease-in-out infinite; transform-origin: center; }
        .${id}-brow-r{ animation: ${id}-brow 0.5s ease-in-out infinite 0.05s; transform-origin: center; }
        .${id}-steam { animation: ${id}-steam 1s ease-out infinite; }
        .${id}-shine { animation: ${id}-shine 0.6s ease-in-out infinite; }
      `,
      cry: `
        @keyframes ${id}-body  { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-3px) rotate(-2deg)} }
        @keyframes ${id}-tear-l{ 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(22px);opacity:0} }
        @keyframes ${id}-tear-r{ 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(22px);opacity:0} }
        @keyframes ${id}-sob   { 0%,100%{transform:scaleX(1) scaleY(1)} 50%{transform:scaleX(0.9) scaleY(1.1)} }
        @keyframes ${id}-shine { 0%,100%{opacity:0.9} 50%{opacity:0.4} }
        @keyframes ${id}-glow  { 0%,100%{filter:drop-shadow(0 8px 20px rgba(80,120,255,0.35))} 50%{filter:drop-shadow(0 10px 28px rgba(80,120,255,0.55))} }
        .${id}-wrap  { animation: ${id}-glow 1.5s ease-in-out infinite; }
        .${id}-body  { animation: ${id}-body 1.5s ease-in-out infinite; transform-origin: center; }
        .${id}-tear-l{ animation: ${id}-tear-l 1s ease-in infinite; }
        .${id}-tear-r{ animation: ${id}-tear-r 1s ease-in infinite 0.3s; }
        .${id}-sob   { animation: ${id}-sob 1.5s ease-in-out infinite; transform-origin: center; }
        .${id}-shine { animation: ${id}-shine 1.5s ease-in-out infinite; }
      `,
      eyeroll: `
        @keyframes ${id}-body  { 0%,100%{transform:rotate(0deg)} 30%{transform:rotate(-3deg)} 70%{transform:rotate(2deg)} }
        @keyframes ${id}-pupil { 0%,20%,100%{transform:translate(0,0)} 40%,80%{transform:translate(0,-10px)} }
        @keyframes ${id}-lid   { 0%,20%,100%{transform:scaleY(1)} 35%,75%{transform:scaleY(0.25)} }
        @keyframes ${id}-arm   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(20deg)} }
        @keyframes ${id}-shine { 0%,100%{opacity:0.9} 50%{opacity:0.2} }
        @keyframes ${id}-glow  { 0%,100%{filter:drop-shadow(0 8px 20px ${glow})} 50%{filter:drop-shadow(0 10px 28px ${glow})} }
        .${id}-wrap  { animation: ${id}-glow 2s ease-in-out infinite; }
        .${id}-body  { animation: ${id}-body 2s ease-in-out infinite; transform-origin: center; }
        .${id}-pupil-l{ animation: ${id}-pupil 2s ease-in-out infinite; }
        .${id}-pupil-r{ animation: ${id}-pupil 2s ease-in-out infinite 0.1s; }
        .${id}-lid-l { animation: ${id}-lid 2s ease-in-out infinite; transform-origin: center top; }
        .${id}-lid-r { animation: ${id}-lid 2s ease-in-out infinite 0.1s; transform-origin: center top; }
        .${id}-arm-l { animation: ${id}-arm 2s ease-in-out infinite; transform-origin: 48px 142px; }
        .${id}-shine { animation: ${id}-shine 2s ease-in-out infinite; }
      `,
    }
  
    // Цвет лягушки меняется под настроение
    const bodyColor = variant === "angry" ? "#E84040"
      : variant === "cry"     ? "#5B9BD5"
      : main
  
    const darkColor = variant === "angry" ? "#B02020"
      : variant === "cry"     ? "#3A6EA0"
      : dark
  
    const w = size
    const h = Math.round(size * 1.1)
  
    return (
      <>
        <style>{styles[variant]}</style>
        <svg
          className={`${id}-wrap`}
          viewBox="0 0 200 220"
          width={w} height={h}
          style={{ overflow: "visible" }}
        >
          {/* Пар у злой лягушки */}
          {variant === "angry" && <>
            <circle cx="70"  cy="44" r="6" fill="#FF6060" opacity="0.7" className={`${id}-steam`} style={{ animationDelay: "0s" }}/>
            <circle cx="100" cy="34" r="5" fill="#FF6060" opacity="0.7" className={`${id}-steam`} style={{ animationDelay: "0.3s" }}/>
            <circle cx="130" cy="44" r="6" fill="#FF6060" opacity="0.7" className={`${id}-steam`} style={{ animationDelay: "0.6s" }}/>
          </>}
  
          <ellipse cx="100" cy="216" rx="44" ry="7" fill="rgba(0,0,0,0.12)"/>
  
          <g className={`${id}-body`}>
  
            {/* Задние лапки */}
            <g className={`${id}-leg-l`} style={{ transformOrigin: "58px 162px" }}>
              <ellipse cx="52" cy="178" rx="20" ry="11" fill={bodyColor}/>
              <ellipse cx="36" cy="186" rx="11" ry="7" fill={darkColor}/>
              <circle cx="27" cy="186" r="5" fill={darkColor}/>
              <circle cx="34" cy="192" r="5" fill={darkColor}/>
              <circle cx="43" cy="193" r="5" fill={darkColor}/>
            </g>
            <g className={`${id}-leg-r`} style={{ transformOrigin: "142px 162px" }}>
              <ellipse cx="148" cy="178" rx="20" ry="11" fill={bodyColor}/>
              <ellipse cx="164" cy="186" rx="11" ry="7" fill={darkColor}/>
              <circle cx="173" cy="186" r="5" fill={darkColor}/>
              <circle cx="166" cy="192" r="5" fill={darkColor}/>
              <circle cx="157" cy="193" r="5" fill={darkColor}/>
            </g>
  
            {/* Тело */}
            <ellipse cx="100" cy="155" rx="56" ry="48" fill={bodyColor}/>
            <ellipse cx="100" cy="163" rx="36" ry="33" fill="rgba(255,255,255,0.18)"/>
  
            {/* Левая лапка — обычная (кроме like) */}
            <g className={`${id}-arm-l`} style={{ transformOrigin: "48px 142px" }}>
              <ellipse cx="46" cy="155" rx="11" ry="8" fill={bodyColor} transform="rotate(-20,46,155)"/>
              <circle cx="36" cy="161" r="6" fill={darkColor}/>
              <circle cx="30" cy="154" r="5" fill={darkColor}/>
              <circle cx="33" cy="147" r="5" fill={darkColor}/>
            </g>
  
            {/* Правая лапка */}
            {variant === "like" ? (
              // Лайк — правая лапка поднята с большим пальцем
              <g className={`${id}-arm-r`}>
                <ellipse cx="154" cy="145" rx="11" ry="8" fill={bodyColor} transform="rotate(-40,154,145)"/>
                {/* Кулак */}
                <circle cx="162" cy="132" r="12" fill={darkColor}/>
                {/* Большой палец вверх */}
                <g className={`${id}-thumb`}>
                  <rect x="156" y="112" width="10" height="18" rx="5" fill={bodyColor}/>
                  <rect x="157" y="113" width="8" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>
                </g>
              </g>
            ) : (
              <g className={`${id}-arm-r`} style={{ transformOrigin: "152px 142px" }}>
                <ellipse cx="154" cy="155" rx="11" ry="8" fill={bodyColor} transform="rotate(20,154,155)"/>
                <circle cx="164" cy="161" r="6" fill={darkColor}/>
                <circle cx="170" cy="154" r="5" fill={darkColor}/>
                <circle cx="167" cy="147" r="5" fill={darkColor}/>
              </g>
            )}
  
            {/* Слёзы */}
            {variant === "cry" && <>
              <ellipse cx="58" cy="108" rx="5" ry="7" fill="#A8D4FF" className={`${id}-tear-l`}/>
              <ellipse cx="142" cy="108" rx="5" ry="7" fill="#A8D4FF" className={`${id}-tear-r`}/>
            </>}
  
            {/* Голова */}
            <ellipse cx="100" cy="110" rx="54" ry="50" fill={bodyColor}/>
            <ellipse cx="82" cy="90" rx="15" ry="9" fill="rgba(255,255,255,0.13)" transform="rotate(-20,82,90)"/>
  
            {/* ══ ГЛАЗА ══ */}
            {/* Левый бугор */}
            <circle cx="68"  cy="72" r="28" fill={bodyColor}/>
            <circle cx="68"  cy="72" r="22" fill="white"/>
  
            {variant === "eyeroll" ? (
              <g>
                <g className={`${id}-pupil-l`}>
                  <circle cx="68" cy="74" r="14" fill="#1a1a1a"/>
                  <circle cx="68" cy="74" r="8"  fill="#111"/>
                  <circle cx="62" cy="68" r="5"  fill="white" className={`${id}-shine`}/>
                </g>
                {/* Полуопущенное веко */}
                <g className={`${id}-lid-l`}>
                  <ellipse cx="68" cy="62" rx="22" ry="14" fill={bodyColor}/>
                </g>
              </g>
            ) : (
              <g>
                <circle cx="68" cy="74" r="14" fill={variant === "angry" ? "#CC0000" : "#1a1a1a"}/>
                <circle cx="68" cy="74" r="8"  fill="#111"/>
                <circle cx="62" cy="68" r="5"  fill="white" className={`${id}-shine`}/>
                <circle cx="74" cy="79" r="2"  fill="rgba(255,255,255,0.5)"/>
              </g>
            )}
  
            {/* Правый бугор */}
            <circle cx="132" cy="72" r="28" fill={bodyColor}/>
            <circle cx="132" cy="72" r="22" fill="white"/>
  
            {variant === "eyeroll" ? (
              <g>
                <g className={`${id}-pupil-r`}>
                  <circle cx="132" cy="74" r="14" fill="#1a1a1a"/>
                  <circle cx="132" cy="74" r="8"  fill="#111"/>
                  <circle cx="126" cy="68" r="5"  fill="white" className={`${id}-shine`}/>
                </g>
                <g className={`${id}-lid-r`}>
                  <ellipse cx="132" cy="62" rx="22" ry="14" fill={bodyColor}/>
                </g>
              </g>
            ) : (
              <g>
                <circle cx="132" cy="74" r="14" fill={variant === "angry" ? "#CC0000" : "#1a1a1a"}/>
                <circle cx="132" cy="74" r="8"  fill="#111"/>
                <circle cx="126" cy="68" r="5"  fill="white" className={`${id}-shine`}/>
                <circle cx="138" cy="79" r="2"  fill="rgba(255,255,255,0.5)"/>
              </g>
            )}
  
            {/* Брови — злой */}
            {variant === "angry" && <>
              <rect x="44" y="54" width="36" height="6" rx="3" fill="#880000"
                className={`${id}-brow-l`} transform="rotate(-20,62,57)"/>
              <rect x="120" y="54" width="36" height="6" rx="3" fill="#880000"
                className={`${id}-brow-r`} transform="rotate(20,138,57)"/>
            </>}
  
            {/* Брови — закатывание глаз */}
            {variant === "eyeroll" && <>
              <path d="M 46 56 Q 68 48 88 58" stroke="rgba(0,0,0,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M 112 58 Q 132 48 154 56" stroke="rgba(0,0,0,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            </>}
  
            {/* Ноздри */}
            <circle cx="92"  cy="120" r="3.5" fill="rgba(0,0,0,0.25)"/>
            <circle cx="108" cy="120" r="3.5" fill="rgba(0,0,0,0.25)"/>
  
            {/* Рот */}
            {(variant === "jump" || variant === "like") && (
              // Радостный — большая улыбка
              <path d="M 72 126 Q 100 150 128 126" stroke="rgba(0,0,0,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            )}
            {variant === "angry" && (
              // Злой — перевёрнутая дуга
              <path d="M 76 138 Q 100 124 124 138" stroke="rgba(0,0,0,0.4)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            )}
            {variant === "cry" && (
              // Плачущий — трясущаяся губа
              <g className={`${id}-sob`}>
                <path d="M 78 136 Q 100 122 122 136" stroke="rgba(0,0,0,0.35)" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </g>
            )}
            {variant === "eyeroll" && (
              // Скучающий — прямая линия
              <path d="M 80 134 Q 100 136 120 134" stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            )}
  
            {/* Румянец (только у радостных) */}
            {(variant === "jump" || variant === "like") && <>
              <ellipse cx="62"  cy="125" rx="12" ry="7" fill="#FF9999" opacity="0.4"/>
              <ellipse cx="138" cy="125" rx="12" ry="7" fill="#FF9999" opacity="0.4"/>
            </>}
  
            {/* Звёздочки у злой */}
            {variant === "angry" && <>
              <text x="30" y="145" fontSize="16" style={{ animation: `${id}-steam 0.8s ease-out infinite` }}>💢</text>
            </>}
  
            {/* Лайк — иконка сердечка рядом */}
            {variant === "like" && (
              <text x="155" y="125" fontSize="18">❤️</text>
            )}
  
          </g>
        </svg>
      </>
    )
  }