import { motion } from "framer-motion"
import { Settings } from "lucide-react"
import { useUser } from "../App"
import SettingsModal from "../components/ui/SettingsModal"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

export default function Profile({ t, theme, setTheme, mode, setMode }) {
  const { tgUser, dbUser, userLoading, isInTelegram } = useUser()
  const [showSettings, setShowSettings] = useState(false)
  const [userData, setUserData] = useState(null)
  const [dueCount, setDueCount] = useState(0)
  const navigate = useNavigate()

  const displayName = tgUser
    ? [tgUser.firstName, tgUser.lastName].filter(Boolean).join(" ")
    : "Гость"

  useEffect(() => {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    supabase.from("users").select("xp, streak, total_tasks")
      .eq("id", userId).single()
      .then(({ data }) => { if (data) setUserData(data); });
    supabase.from("spaced_repetition")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString())
      .then(({ count }) => setDueCount(count || 0));
  }, [tgUser?.id, dbUser?.id]);

  const xp = userData?.xp ?? dbUser?.xp ?? 0;
  const totalTasks = userData?.total_tasks ?? dbUser?.total_tasks ?? 0;
  const streak = userData?.streak ?? dbUser?.streak ?? 0;

  const stats = [
    { emoji: "🔥", value: streak, label: streak === 1 ? "день подряд" : streak < 5 ? "дня подряд" : "дней подряд", color: "#FF6B4A" },
    { emoji: "⚡", value: xp, label: "XP", color: "#FFB347" },
    { emoji: "✅", value: totalTasks, label: "заданий", color: "#52C97A" },
  ]

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

      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10, marginBottom: 16,
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            style={{
              background: t.surface, borderRadius: 20,
              border: `1px solid ${t.border}`,
              padding: "14px 10px", textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Работа над ошибками */}
      <motion.button
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/errors")}
        style={{
          width: "100%", padding: "16px 20px", borderRadius: 20, marginBottom: 10,
          background: t.surface, border: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", color: t.text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${t.error}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Работа над ошибками</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>Персонализированный тест</div>
          </div>
        </div>
        <span style={{ color: t.textMuted, fontSize: 18 }}>→</span>
      </motion.button>

      {/* Интервальное повторение */}
      <motion.button
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/repeat")}
        style={{
          width: "100%", padding: "16px 20px", borderRadius: 20, marginBottom: 10,
          background: t.surface, border: `1px solid ${dueCount > 0 ? t.primary : t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", color: t.text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${t.primary}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧠</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Интервальное повторение</div>
            <div style={{ fontSize: 12, color: dueCount > 0 ? t.primary : t.textMuted, marginTop: 2 }}>
              {dueCount > 0 ? `${dueCount} заданий ждут повторения` : "Умный алгоритм повторения"}
            </div>
          </div>
        </div>
        {dueCount > 0 && (
          <span style={{ background: t.primary, color: "#fff", borderRadius: 999, fontSize: 12, fontWeight: 700, padding: "3px 10px" }}>{dueCount}</span>
        )}
        {dueCount === 0 && <span style={{ color: t.textMuted, fontSize: 18 }}>→</span>}
      </motion.button>

      {showSettings && (
        <SettingsModal t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}