import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Settings, Crown, Zap, Target, Calendar } from "lucide-react"
import { useUser } from "../App"
import SettingsModal from "../components/ui/SettingsModal"
import { useState } from "react"

export default function Profile({ t, theme, setTheme, mode, setMode }) {
  const { tgUser, dbUser, userLoading, tasksToday, freeLimit, isInTelegram } = useUser()
  const [showSettings, setShowSettings] = useState(false)
  const navigate = useNavigate()

  const displayName = tgUser
    ? [tgUser.firstName, tgUser.lastName].filter(Boolean).join(" ")
    : "Гость"

  const isPremium = dbUser?.is_premium || false
  const xp = dbUser?.xp || 0
  const totalTasks = dbUser?.total_tasks || 0
  const streak = dbUser?.streak || 0

  return (
    <div style={{ padding: "24px 16px 100px" }}>

      {/* Header */}
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
        {/* Аватар */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <p style={{ fontWeight: 800, fontSize: 18, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userLoading ? "..." : displayName}
            </p>
            {isPremium && (
              <div style={{ background: `linear-gradient(135deg, #FFB347, #FF6B4A)`, borderRadius: 999, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                <Crown size={11} color="white" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>PRO</span>
              </div>
            )}
          </div>
          {tgUser?.username && (
            <p style={{ fontSize: 13, color: t.textMuted }}>@{tgUser.username}</p>
          )}
          {!isInTelegram && (
            <p style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
              Открой в Telegram для авторизации
            </p>
          )}
        </div>
      </motion.div>

      {/* Лимит заданий */}
      {!isPremium && (
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
          {tasksToday >= freeLimit && (
            <p style={{ fontSize: 12, color: t.error, marginTop: 8, fontWeight: 600 }}>
              Лимит исчерпан. Обнови до PRO для неограниченного доступа.
            </p>
          )}
        </motion.div>
      )}

      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}
      >
        {[
          { icon: Zap, label: "XP", value: xp },
          { icon: Target, label: "Решено", value: totalTasks },
          { icon: Calendar, label: "Стрик", value: `${streak}🔥` },
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

      {/* PRO кнопка */}
      {!isPremium && (
        <motion.button
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, #FFB347, #FF6B4A)`,
            color: "white", border: "none", borderRadius: 999,
            padding: "16px", fontSize: 15, fontWeight: 800,
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(255,107,74,0.4)",
          }}
        >
          <Crown size={18} />
          Получить PRO — 299 ₽/мес
        </motion.button>
      )}

      {isPremium && (
        <div style={{
          background: `linear-gradient(135deg, #FFB34722, #FF6B4A11)`,
          border: "1.5px solid #FFB347",
          borderRadius: 20, padding: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Crown size={20} color="#FFB347" />
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: t.text }}>PRO активен</p>
            <p style={{ fontSize: 12, color: t.textMuted }}>Неограниченный доступ</p>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}