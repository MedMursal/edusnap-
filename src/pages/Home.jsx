import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Zap, Flame, ChevronRight } from "lucide-react"
import { supabase } from "../supabase"
import FrogHero from "../components/FrogHero"
import SettingsModal from "../components/ui/SettingsModal"
import { useUser } from "../App"

const LEVELS = [
  { level: 1,  xp: 0,    label: "Новичок",  emoji: "🌱" },
  { level: 2,  xp: 50,   label: "Ученик",   emoji: "📖" },
  { level: 3,  xp: 120,  label: "Знаток",   emoji: "🔍" },
  { level: 4,  xp: 250,  label: "Практик",  emoji: "⚗️"  },
  { level: 5,  xp: 450,  label: "Эксперт",  emoji: "🧠" },
  { level: 6,  xp: 700,  label: "Мастер",   emoji: "🎯" },
  { level: 7,  xp: 1000, label: "Профи",    emoji: "🚀" },
  { level: 8,  xp: 1400, label: "Гений",    emoji: "💡" },
  { level: 9,  xp: 1900, label: "Легенда",  emoji: "⭐" },
  { level: 10, xp: 2500, label: "ЕГЭ 100",  emoji: "🏆" },
]

function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1]
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { current = LEVELS[i]; next = LEVELS[i + 1] || null }
    else break
  }
  const progress = next ? Math.min(Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100), 100) : 100
  return { ...current, progress, toNext: next ? next.xp - xp : 0, nextLevel: next }
}

const QUOTES = [
  "Каждое задание — шаг к 100 баллам ⚡",
  "Ты уже лучше 90% 🔥",
  "Знания — твоё главное оружие 🧠",
  "Один шаг в день — это уже победа 🏆",
  "ЕГЭ — просто следующий уровень 🎯",
  "Сегодня лучше, чем вчера 💪",
]

function StreakFire({ streak, t }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "linear-gradient(135deg, #FF6B4A22, #FF8C4222)",
        border: "1.5px solid #FF6B4A44",
        borderRadius: 999, padding: "7px 14px",
        width: "fit-content",
      }}
    >
      <span style={{ fontSize: 20, display: "inline-block", animation: "fire-pulse 1.8s ease-in-out infinite" }}>🔥</span>
      <div>
        <span style={{ fontWeight: 900, fontSize: 16, color: "#FF6B4A" }}>{streak}</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#FF8C42", marginLeft: 4 }}>
          {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"}
        </span>
      </div>
    </motion.div>
  )
}

function XPBar({ xp, t }) {
  const { level, label, emoji, progress, toNext, nextLevel } = getLevelInfo(xp)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1,  y: 0  }}
      transition={{ delay: 0.2, duration: 0.4 }}
      style={{ background: t.surface, borderRadius: 24, padding: "16px 18px", border: `1.5px solid ${t.border}`, marginBottom: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 3px 12px ${t.primaryGlow}` }}>
            {emoji}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 13, color: t.text }}>{label}</div>
            <div style={{ fontWeight: 600, fontSize: 11, color: t.textMuted }}>Уровень {level}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Zap size={14} color={t.primary} fill={t.primary} />
          <span style={{ fontWeight: 900, fontSize: 15, color: t.primary }}>{xp}</span>
          <span style={{ fontWeight: 600, fontSize: 11, color: t.textMuted }}>XP</span>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ height: 10, background: t.surfaceUp, borderRadius: 999, overflow: "hidden", border: `1.5px solid ${t.border}` }}>
          <motion.div key={xp} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="xp-shimmer" style={{ height: "100%", borderRadius: 999 }} />
        </div>
        {nextLevel && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>{progress}%</span>
            <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>{toNext} XP до «{nextLevel.label}»</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ActionCard({ emoji, title, subtitle, color, onClick, delay = 0, badge }) {
  return (
    <motion.button
      className="duo-btn"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{ width: "100%", padding: "16px 18px", borderRadius: 20, marginBottom: 10, background: "var(--surface)", border: `2px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden", boxShadow: `0 2px 12px ${color}18` }}
    >
      <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}18, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}22`, border: `1.5px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {emoji}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{title}</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {badge && <div style={{ background: color, color: "#fff", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{badge}</div>}
        <ChevronRight size={18} color="var(--text-muted)" />
      </div>
    </motion.button>
  )
}

export default function Home({ t, theme, setTheme, mode, setMode }) {
  const [showSettings, setShowSettings] = useState(false)
  const [userData, setUserData] = useState(null)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const navigate = useNavigate()
  const { tgUser, dbUser } = useUser()

  useEffect(() => {
    const userId = tgUser?.id || dbUser?.id
    if (!userId) return
    supabase.from("users").select("xp, streak, total_tasks, first_name").eq("id", userId).single()
      .then(({ data }) => { if (data) setUserData(data) })
  }, [tgUser?.id, dbUser?.id])

  const xp        = userData?.xp        ?? dbUser?.xp        ?? 0
  const streak    = userData?.streak    ?? dbUser?.streak    ?? 0
  const firstName = userData?.first_name || tgUser?.first_name || dbUser?.first_name || ""

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 6)  return "Ночной режим 🌙"
    if (h < 12) return "Доброе утро ☀️"
    if (h < 17) return "Добрый день 👋"
    if (h < 22) return "Добрый вечер 🌆"
    return "Поздно, но продуктивно 🦉"
  })()

  return (
    <div style={{ minHeight: "100vh", background: t.bg, paddingBottom: 110 }}>

      {/* HERO HEADER */}
      <div style={{ position: "relative", background: t.surface, borderRadius: "0 0 32px 32px", border: `1px solid ${t.border}`, borderTop: "none", marginBottom: 20, overflow: "hidden", minHeight: 220 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 50%, ${t.primaryGlow} 0%, transparent 60%)`, pointerEvents: "none" }} />

        <div style={{ padding: "28px 20px 24px", position: "relative", zIndex: 10 }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            {greeting}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.5 }} style={{ fontSize: 28, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 8 }}>
            {firstName ? `${firstName}!` : "Привет!"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ fontSize: 13, fontWeight: 600, color: t.accent, marginBottom: 16 }}>
            {quote}
          </motion.p>
          {streak > 0 && <StreakFire streak={streak} t={t} />}
        </div>

        <div style={{ position: "absolute", right: -10, top: 0, bottom: 0, width: "52%", zIndex: 5 }}>
          <FrogHero t={t} name={firstName} quote={quote} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <XPBar xp={xp} t={t} />

        <motion.button
          className="duo-btn"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/ege")}
          style={{ width: "100%", marginBottom: 12, background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, border: "none", borderRadius: 20, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 6px 24px ${t.primaryGlow}`, cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📚</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", marginBottom: 2 }}>Задания ЕГЭ</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Биология · Химия · Физика</div>
            </div>
          </div>
          <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
            <ChevronRight size={22} color="#fff" strokeWidth={2.5} />
          </motion.div>
        </motion.button>

        <ActionCard emoji="📝" title="Работа над ошибками" subtitle="Персонализированный разбор" color={t.error} onClick={() => navigate("/errors")} delay={0.35} />
        <ActionCard emoji="🧠" title="Интервальное повторение" subtitle="Умный алгоритм запоминания" color={t.primary} onClick={() => navigate("/repeat")} delay={0.4} />
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}