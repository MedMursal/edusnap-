import { motion } from "framer-motion"
import { Settings, Zap, Target, Calendar } from "lucide-react"
import { useUser } from "../App"
import SettingsModal from "../components/ui/SettingsModal"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Profile({ t, theme, setTheme, mode, setMode }) {
  const { tgUser, dbUser, userLoading, tasksToday, freeLimit, isInTelegram } = useUser()
  const [showSettings, setShowSettings] = useState(false)
  const navigate = useNavigate()

  const displayName = tgUser
    ? [tgUser.firstName, tgUser.lastName].filter(Boolean).join(" ")
    : "Гость"

  const xp = dbUser?.xp || 0
  const totalTasks = dbUser?.total_tasks || 0
  const streak = dbUser?.streak || 0

  return (
    <div style={{ padding: "24px 16px 100px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text }}>Профиль</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)}
          style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 999, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: t.textMuted,
          }}>
          <Settings size={18} />
        </motion.button>
      </div>

      {/* Аватар + имя */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: t.surface, borderRadius: 24, padding: 20,
          border: `1px solid ${t.border}`, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 16,
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 999,
          background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 800, color: "white",
          boxShadow: `0 4px 16px ${t.primaryGlow}`,
          overflow: "hidden", flexShrink: 0,
        }}>
          {tgUser?.photoUrl
            ? <img src={tgUser.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : displayName[0]?.toUpperCase() || "?"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 18, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userLoading ? "..." : displayName}
          </p>
          {tgUser?.username && (
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>@{tgUser.username}</p>
          )}
          {!isInTelegram && (
            <p style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
              Открой в Telegram для авторизации
            </p>
          )}
        </div>
      </motion.div>

      {/* Лимит */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: t.surface, borderRadius: 24, padding: 16,
          border: `1px solid ${t.border}`, marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={16} color={t.primary} />
            <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Задания сегодня</span>
          </div>
          <span style={{ fontSize: 13, color: tasksToday >= freeLimit ? t.error : t.textMuted, fontWeight: 600 }}>
            {tasksToday} / {freeLimit}
          </span>
        </div>
        <div style={{ background: t.surfaceUp, borderRadius: 999, height: 6 }}>
          <div style={{
            height: 6, borderRadius: 999,
            width: `${Math.min((tasksToday / freeLimit) * 100, 100)}%`,
            background: tasksToday >= freeLimit
              ? `linear-gradient(90deg, ${t.error}, #FF8C8C)`
              : `linear-gradient(90deg, ${t.primary}, ${t.primaryBright})`,
            transition: "width 0.4s ease",
          }} />
        </div>
      </motion.div>

      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}
      >
        {[
          { icon: Zap,      label: "XP",     value: xp },
          { icon: Target,   label: "Решено", value: totalTasks },
          { icon: Calendar, label: "Стрик",  value: `${streak}🔥` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            background: t.surface, borderRadius: 20, padding: "14px 12px",
            border: `1px solid ${t.border}`, textAlign: "center",
          }}>
            <Icon size={18} color={t.primary} style={{ marginBottom: 6 }} />
            <p style={{ fontWeight: 800, fontSize: 18, color: t.text }}>{value}</p>
            <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Работа над ошибками */}
      <motion.button
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/errors")}
        style={{
          width: "100%", padding: "16px 20px", borderRadius: 20,
          background: t.surface, border: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", color: t.text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${t.error}22`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>📝</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Работа над ошибками</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>Персонализированный тест</div>
          </div>
        </div>
        <span style={{ color: t.textMuted, fontSize: 18 }}>→</span>
      </motion.button>

      {showSettings && (
        <SettingsModal t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}