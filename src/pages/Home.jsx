import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Settings } from "lucide-react"
import { supabase } from "../supabase"
import { SplineScene } from "../components/ui/SplineScene"
import SettingsModal from "../components/ui/SettingsModal"

export default function Home({ t, theme, setTheme, mode, setMode }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from("courses")
      .select("*, lessons(count)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setCourses(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: "0 0 100px" }}>

      {/* ── HERO ── */}
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
            Добро пожаловать
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, color: t.text, marginBottom: 8 }}>
            Привет! 👋
          </h1>
          <p style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>Продолжай учиться</p>
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
            🔥 5 дней подряд
          </motion.div>
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
        {/* XP */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ background: t.surface, borderRadius: 24, padding: 18, marginBottom: 20, border: `1px solid ${t.border}` }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>⚡ 340 XP</span>
            <span style={{ fontSize: 12, color: t.textMuted }}>до уровня 4: 160 XP</span>
          </div>
          <div style={{ background: t.surfaceUp, borderRadius: 999, height: 8 }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: "68%" }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              style={{ background: `linear-gradient(90deg, ${t.primary}, ${t.primaryBright})`, height: 8, borderRadius: 999, boxShadow: `0 0 8px ${t.primaryGlow}` }}
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