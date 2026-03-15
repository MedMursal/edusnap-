import { motion } from "framer-motion"
import { Settings, ChevronRight, Flame, Zap, CheckCircle2, BookOpen, Brain } from "lucide-react"
import { useUser } from "../App"
import { buildTheme } from "../App"
import SettingsModal from "../components/ui/SettingsModal"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const LEVELS = [
  { level: 1,  xp: 0,      label: "Новичок",      emoji: "🌱" },
  { level: 2,  xp: 100,    label: "Ученик",        emoji: "📖" },
  { level: 3,  xp: 250,    label: "Знаток",        emoji: "🔍" },
  { level: 4,  xp: 500,    label: "Практик",       emoji: "⚗️"  },
  { level: 5,  xp: 900,    label: "Эксперт",       emoji: "🧠" },
  { level: 6,  xp: 1500,   label: "Мастер",        emoji: "🎯" },
  { level: 7,  xp: 2500,   label: "Профи",         emoji: "🚀" },
  { level: 8,  xp: 4000,   label: "Гений",         emoji: "💡" },
  { level: 9,  xp: 6000,   label: "Легенда",       emoji: "⭐" },
  { level: 10, xp: 9000,   label: "Исследователь", emoji: "🔬" },
  { level: 11, xp: 13000,  label: "Академик",      emoji: "🏛️" },
  { level: 12, xp: 18000,  label: "Учёный",        emoji: "🧬" },
  { level: 13, xp: 25000,  label: "Доцент",        emoji: "📐" },
  { level: 14, xp: 33000,  label: "Профессор",     emoji: "👨‍🏫" },
  { level: 15, xp: 43000,  label: "Доктор наук",   emoji: "🎓" },
  { level: 16, xp: 55000,  label: "Нобелевский",   emoji: "🏅" },
  { level: 17, xp: 68000,  label: "Эйнштейн",      emoji: "⚛️" },
  { level: 18, xp: 82000,  label: "Ломоносов",     emoji: "🦅" },
  { level: 19, xp: 93000,  label: "Олимпиец",      emoji: "🥇" },
  { level: 20, xp: 100000, label: "ЕГЭ 100",       emoji: "🏆" },
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

const THEMES = [
  { key: "coral",    emoji: "🪸", name: "Коралл",  color: "#FF6B4A" },
  { key: "sage",     emoji: "🌿", name: "Шалфей",  color: "#4DAA7A" },
  { key: "ocean",    emoji: "🌊", name: "Океан",   color: "#3A9BD5" },
  { key: "lavender", emoji: "💜", name: "Лаванда", color: "#9B72CF" },
  { key: "dusk",     emoji: "🌅", name: "Закат",   color: "#E8845A" },
]

function ThemePicker({ theme, setTheme, mode, setMode, t }) {
  return (
    <div style={{
      background: t.surface, borderRadius: 24,
      border: `1.5px solid ${t.border}`, padding: "16px 18px",
      marginBottom: 12,
    }}>
      <div style={{ fontWeight: 800, fontSize: 14, color: t.text, marginBottom: 14 }}>🎨 Оформление</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Цвет
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {THEMES.map(th => (
            <motion.button
              key={th.key}
              whileTap={{ scale: 0.88 }}
              className="duo-btn"
              onClick={() => setTheme(th.key)}
              title={th.name}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 14,
                background: theme === th.key ? `${th.color}22` : t.surfaceUp,
                border: `2px solid ${theme === th.key ? th.color : t.border}`,
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "all 0.2s",
                boxShadow: theme === th.key ? `0 3px 12px ${th.color}44` : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>{th.emoji}</span>
              {theme === th.key && (
                <motion.div
                  layoutId="theme-dot"
                  style={{ width: 6, height: 6, borderRadius: 999, background: th.color }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Режим
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["dark", "🌙 Тёмный"], ["light", "☀️ Светлый"]].map(([m, label]) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.95 }}
              className="duo-btn"
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "11px",
                borderRadius: 14, cursor: "pointer",
                background: mode === m ? t.primary : t.surfaceUp,
                border: `2px solid ${mode === m ? t.primary : t.border}`,
                color: mode === m ? "#fff" : t.textMuted,
                fontWeight: 700, fontSize: 13,
                transition: "all 0.2s",
                boxShadow: mode === m ? `0 3px 12px ${t.primaryGlow}` : "none",
                fontFamily: "inherit",
              }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Profile({ t, theme, setTheme, mode, setMode }) {
  const { tgUser, dbUser, userLoading, isInTelegram } = useUser()
  const [userData, setUserData] = useState(null)
  const [dueCount, setDueCount] = useState(0)
  const navigate = useNavigate()

  const displayName = tgUser
    ? [tgUser.firstName, tgUser.lastName].filter(Boolean).join(" ")
    : "Гость"

  useEffect(() => {
    const userId = tgUser?.id || dbUser?.id
    if (!userId) return
    supabase.from("users").select("xp, streak, total_tasks").eq("id", userId).single()
      .then(({ data }) => { if (data) setUserData(data) })
    supabase.from("spaced_repetition")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString())
      .then(({ count }) => setDueCount(count || 0))
  }, [tgUser?.id, dbUser?.id])

  const xp         = userData?.xp         ?? dbUser?.xp         ?? 0
  const totalTasks = userData?.total_tasks ?? dbUser?.total_tasks ?? 0
  const streak     = userData?.streak     ?? dbUser?.streak     ?? 0
  const { level, label, emoji: levelEmoji, progress } = getLevelInfo(xp)

  const stats = [
    { icon: "🔥", value: streak,     sub: streak < 5 && streak !== 1 ? "дня" : streak === 1 ? "день" : "дней", color: "#FF6B4A", bg: "#FF6B4A18" },
    { icon: "⚡",  value: xp,        sub: "XP",       color: t.primary,  bg: t.secondary },
    { icon: "✅", value: totalTasks, sub: "заданий",  color: "#58CC02",  bg: "#58CC0218" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: t.bg, paddingBottom: 110 }}>

      <div style={{
        background: t.surface,
        borderBottom: `1.5px solid ${t.border}`,
        padding: "20px 16px 16px",
        marginBottom: 16,
      }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: t.text }}>Профиль</h1>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* Баннер привязки Telegram — показывается только в браузере */}
        {!isInTelegram && (
          <motion.a
            href="https://t.me/ege_bio_sprint_bot"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "linear-gradient(135deg, #229ED922, #1a7fb522)",
              border: "1.5px solid #229ED944",
              borderRadius: 20, padding: "14px 16px",
              marginBottom: 12, textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "#229ED922", border: "1.5px solid #229ED944",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              📊
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#229ED9", marginBottom: 2 }}>
                Привязать Telegram
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Для отслеживания прогресса, стриков и XP
              </div>
            </div>
            <ChevronRight size={18} color="#229ED9" />
          </motion.a>
        )}

        {/* Аватар */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: t.surface,
            borderRadius: 24, padding: "18px 18px",
            border: `1.5px solid ${t.border}`,
            marginBottom: 12,
            display: "flex", alignItems: "center", gap: 16,
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 22,
              background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 900, color: "white",
              boxShadow: `0 4px 18px ${t.primaryGlow}`,
              overflow: "hidden",
            }}>
              {tgUser?.photoUrl
                ? <img src={tgUser.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : displayName[0]?.toUpperCase() || "?"}
            </div>
            <div style={{
              position: "absolute", bottom: -6, right: -6,
              background: t.primary, color: "#fff",
              borderRadius: 10, width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 900,
              border: `2px solid ${t.bg}`,
              boxShadow: `0 2px 8px ${t.primaryGlow}`,
            }}>
              {level}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 900, fontSize: 18, color: t.text, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userLoading ? "..." : displayName}
            </p>
            {tgUser?.username && (
              <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 8px" }}>@{tgUser.username}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: t.primary, fontWeight: 700 }}>{levelEmoji} {label}</span>
              <div style={{ flex: 1, height: 5, background: t.surfaceUp, borderRadius: 999, overflow: "hidden" }}>
                <motion.div
                  key={xp}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: "100%", borderRadius: 999,
                    background: `linear-gradient(90deg, ${t.primary}, ${t.primaryBright})`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Статы */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 280 }}
              style={{
                background: t.surface,
                border: `1.5px solid ${t.border}`,
                borderRadius: 18, padding: "14px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 3, fontWeight: 700 }}>{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Тема-пикер */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ThemePicker theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} t={t} />
        </motion.div>

        {/* Разделы */}
        {[
          {
            emoji: "📝", title: "Работа над ошибками", sub: "Персонализированный тест",
            color: t.error, path: "/errors", delay: 0.2,
          },
          {
            emoji: "🧠", title: "Интервальное повторение", sub: dueCount > 0 ? `${dueCount} заданий ждут` : "Умный алгоритм",
            color: t.primary, path: "/repeat", delay: 0.25, badge: dueCount > 0 ? dueCount : null,
          },
        ].map(({ emoji, title, sub, color, path, delay, badge }) => (
          <motion.button
            key={path}
            className="duo-btn"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(path)}
            style={{
              width: "100%", padding: "15px 18px",
              borderRadius: 20, marginBottom: 10,
              background: t.surface,
              border: `1.5px solid ${badge ? color + "66" : t.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", textAlign: "left",
              boxShadow: badge ? `0 2px 12px ${color}22` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: `${color}18`,
                border: `1.5px solid ${color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>
                {emoji}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: t.text, marginBottom: 2 }}>{title}</div>
                <div style={{ fontWeight: 600, fontSize: 12, color: badge ? color : t.textMuted }}>{sub}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {badge && (
                <div style={{
                  background: color, color: "#fff",
                  borderRadius: 999, padding: "2px 10px",
                  fontSize: 12, fontWeight: 900,
                }}>{badge}</div>
              )}
              <ChevronRight size={18} color={t.textMuted} />
            </div>
          </motion.button>
        ))}

      </div>
    </div>
  )
}