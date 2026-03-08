import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { SplineScene } from "../components/ui/SplineScene"

const themeNames = {
  coral: "🪸 Коралл", sage: "🌿 Шалфей", ocean: "🌊 Океан",
  lavender: "💜 Лаванда", dusk: "🌅 Закат"
}

export default function Home({ t, theme, setTheme, themes }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
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

      {/* ── HERO с 3D персонажем ── */}
      <div style={{
        position: "relative",
        height: 280,
        overflow: "hidden",
        borderRadius: "0 0 32px 32px",
        background: `linear-gradient(135deg, ${t.surface} 0%, ${t.surfaceUp} 100%)`,
        border: `1px solid ${t.border}`,
        borderTop: "none",
      }}>
        {/* Spotlight glow */}
        <div style={{
          position: "absolute",
          top: -60, left: -40,
          width: 300, height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.primaryGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Левый текст */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            left: 20, top: 0, bottom: 0,
            display: "flex", flexDirection: "column",
            justifyContent: "center", zIndex: 10,
            maxWidth: "50%",
          }}
        >
          <p style={{ color: t.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4, letterSpacing: 1 }}>
            ДОБРО ПОЖАЛОВАТЬ
          </p>
          <h1 style={{
            fontSize: 26, fontWeight: 900, lineHeight: 1.2,
            color: t.text, marginBottom: 8
          }}>
            Привет! 👋
          </h1>
          <p style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>
            Продолжай учиться
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: 16,
              background: t.primary,
              color: "white",
              borderRadius: 12,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: `0 4px 16px ${t.primaryGlow}`,
              width: "fit-content",
            }}
          >
            🔥 5 дней подряд
          </motion.div>
        </motion.div>

        {/* Spline 3D персонаж справа */}
        <div style={{
          position: "absolute",
          right: -20, top: 0,
          width: "55%", height: "100%",
          zIndex: 5,
        }}>
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Нижний fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
          background: `linear-gradient(to top, ${t.bg}, transparent)`,
          pointerEvents: "none", zIndex: 20,
        }} />
      </div>

      <div style={{ padding: "20px 16px 0" }}>

        {/* XP прогресс */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ background: t.surface, borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${t.border}` }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>⚡ 340 XP</span>
            <span style={{ fontSize: 12, color: t.textMuted }}>до уровня 4: 160 XP</span>
          </div>
          <div style={{ background: t.surfaceUp, borderRadius: 99, height: 8 }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: "68%" }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{ background: `linear-gradient(90deg, ${t.primary}, ${t.primaryBright})`, height: 8, borderRadius: 99 }}
            />
          </div>
        </motion.div>

        {/* Темы */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: t.textMuted }}>🎨 Тема</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(themes).map(([key, val]) => (
              <button key={key} onClick={() => setTheme(key)}
                style={{
                  background: theme === key ? val.primary : val.surface,
                  color: theme === key ? "white" : val.textMuted,
                  border: `1.5px solid ${theme === key ? val.primary : val.border}`,
                  borderRadius: 10, padding: "6px 12px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                {themeNames[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Курсы */}
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: t.textMuted }}>🔥 Популярные курсы</p>

        {loading && (
          <div style={{ textAlign: "center", color: t.textMuted, padding: 20 }}>Загрузка...</div>
        )}

        {!loading && courses.length === 0 && (
          <div style={{
            textAlign: "center", padding: 32,
            background: t.surface, borderRadius: 16,
            color: t.textMuted, border: `1px solid ${t.border}`
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
            <p style={{ fontWeight: 600 }}>Курсов пока нет</p>
            <p style={{ fontSize: 13 }}>Создай первый курс!</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {courses.map((course, i) => (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/course/${course.id}`)}
              style={{
                background: t.surface, borderRadius: 16, padding: 16,
                border: `1px solid ${t.border}`, cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: t.secondary, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>
                  {course.emoji}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{course.title}</p>
                  <p style={{ fontSize: 12, color: t.textMuted }}>
                    {course.lessons?.[0]?.count || 0} уроков · {course.level}
                  </p>
                </div>
              </div>
              <div style={{
                background: t.primary, color: "white",
                borderRadius: 10, padding: "6px 14px",
                fontSize: 13, fontWeight: 700,
                boxShadow: `0 2px 8px ${t.primaryGlow}`,
              }}>▶</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}