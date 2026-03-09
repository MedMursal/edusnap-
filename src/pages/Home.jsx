import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Settings } from "lucide-react"
import { supabase } from "../supabase"
import { SplineScene } from "../components/ui/SplineScene"
import SettingsModal from "../components/ui/SettingsModal"
import { useUser } from "../App"

const LEVELS = [
  { level: 1,  xp: 0,    label: "Новичок" },
  { level: 2,  xp: 50,   label: "Ученик" },
  { level: 3,  xp: 120,  label: "Знаток" },
  { level: 4,  xp: 250,  label: "Практик" },
  { level: 5,  xp: 450,  label: "Эксперт" },
  { level: 6,  xp: 700,  label: "Мастер" },
  { level: 7,  xp: 1000, label: "Профи" },
  { level: 8,  xp: 1400, label: "Гений" },
  { level: 9,  xp: 1900, label: "Легенда" },
  { level: 10, xp: 2500, label: "ЕГЭ 100" },
];

function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { current = LEVELS[i]; next = LEVELS[i + 1] || null; }
    else break;
  }
  const progress = next ? Math.min(Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100), 100) : 100;
  const toNext = next ? next.xp - xp : 0;
  return { level: current.level, label: current.label, progress, toNext, nextLevel: next };
}

const QUOTES = [
  { top: "Каждое задание", bottom: "приближает к 100 баллам ⚡" },
  { top: "Не сдавайся —", bottom: "ты уже лучше 90% 🔥" },
  { top: "Знания —", bottom: "твоё главное оружие 🧠" },
  { top: "Один шаг в день —", bottom: "это уже победа 🏆" },
  { top: "ЕГЭ — это", bottom: "просто следующий уровень 🎯" },
  { top: "Сегодня лучше", bottom: "чем вчера 💪" },
  { top: "Фокус и практика —", bottom: "вот твой секрет 🌟" },
];

export default function Home({ t, theme, setTheme, mode, setMode }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()
  const { tgUser, dbUser } = useUser()

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  
  useEffect(() => {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    supabase.from("users").select("xp, streak, total_tasks, first_name").eq("id", userId).single()
      .then(({ data }) => { if (data) setUserData(data); });
  }, [tgUser?.id, dbUser?.id]);

  useEffect(() => {
    supabase.from("courses").select("*, lessons(count)").order("created_at", { ascending: false })
      .then(({ data, error }) => { if (!error) setCourses(data || []); setLoading(false); })
  }, [])

  const xp = userData?.xp ?? dbUser?.xp ?? 0;
  const streak = userData?.streak ?? dbUser?.streak ?? 0;
  const firstName = userData?.first_name || tgUser?.first_name || dbUser?.first_name || "";
  const { level, label, progress, toNext, nextLevel } = getLevelInfo(xp);

  return (
    <div style={{ padding: "0 0 100px" }}>

      {/* HERO */}
      <div style={{
        position: "relative", height: 280, overflow: "hidden",
        borderRadius: "0 0 36px 36px",
        background: `linear-gradient(135deg, ${t.surface} 0%, ${t.surfaceUp} 100%)`,
        border: `1px solid ${t.border}`, borderTop: "none",
      }}>
        <div style={{
          position: "absolute", top: -60, left: -40,
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${t.primaryGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 30,
            background: t.surfaceUp, border: `1px solid ${t.border}`,
            borderRadius: 999, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: t.textMuted,
          }}
        >
          <Settings size={18} />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute", left: 20, top: 0, bottom: 0,
            display: "flex", flexDirection: "column",
            justifyContent: "center", zIndex: 10, maxWidth: "52%",
          }}
        >
          <p style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, marginBottom: 4, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {quote.top}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, color: t.text, marginBottom: 8 }}>
            {firstName ? `${firstName}! 👋` : "Привет! 👋"}
          </h1>
          <p style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>{quote.bottom}</p>
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 16,
                background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
                color: "white", borderRadius: 999,
                padding: "8px 16px", fontSize: 12, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 6,
                boxShadow: `0 4px 16px ${t.primaryGlow}`,
                width: "fit-content",
              }}
            >
              🔥 {streak} {streak === 1 ? "день подряд" : streak < 5 ? "дня подряд" : "дней подряд"}
            </motion.div>
          )}
        </motion.div>

        <div style={{ position: "absolute", right: -20, top: 0, width: "55%", height: "100%", zIndex: 5 }}>
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
          background: `linear-gradient(to top, ${t.bg}, transparent)`,
          pointerEvents: "none", zIndex: 20,
        }} />
      </div>

      <div style={{ padding: "20px 16px 0" }}>

        {/* XP БЛОК */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{
            background: t.surface, borderRadius: 24, padding: 18,
            marginBottom: 20, border: `1px solid ${t.border}`
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>⚡ {xp} XP</span>
              <span style={{
                background: `${t.primary}22`, color: t.primary,
                fontSize: 10, fontWeight: 700, padding: "2px 8px",
                borderRadius: 999, border: `1px solid ${t.primary}44`
              }}>
                {level} · {label}
              </span>
            </div>
            <span style={{ fontSize: 12, color: t.textMuted }}>
              {nextLevel ? `до «${nextLevel.label}»: ${toNext} XP` : "🏆 Макс. уровень"}
            </span>
          </div>
          <div style={{ background: t.surfaceUp, borderRadius: 999, height: 8 }}>
            <motion.div
              key={xp}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              style={{
                background: `linear-gradient(90deg, ${t.primary}, ${t.primaryBright})`,
                height: 8, borderRadius: 999,
                boxShadow: `0 0 8px ${t.primaryGlow}`
              }}
            />
          </div>
        </motion.div>

        {/* ЕГЭ CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/ege")}
          style={{
            background: `linear-gradient(135deg, ${t.primary}22, ${t.primaryBright}11)`,
            border: `1.5px solid ${t.primary}44`,
            borderRadius: 24, padding: "20px",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: t.text, marginBottom: 4 }}>📚 Задания ЕГЭ</p>
            <p style={{ fontSize: 13, color: t.textMuted }}>Биология, Химия, Физика</p>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
            color: "white", borderRadius: 999,
            padding: "10px 18px", fontSize: 13, fontWeight: 700,
            boxShadow: `0 2px 10px ${t.primaryGlow}`,
          }}>Начать →</div>
        </motion.div>
      </div>

      {showSettings && (
        <SettingsModal
          t={t} theme={theme} setTheme={setTheme}
          mode={mode} setMode={setMode}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}