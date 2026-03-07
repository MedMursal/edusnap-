import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const themeNames = { blue: "🔵 Синяя", green: "🟢 Зелёная", purple: "🟣 Фиолетовая", orange: "🟠 Оранжевая", dark: "⚫ Тёмная" }

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
    <div style={{ padding: "24px 16px 100px" }}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Привет! 👋</h1>
          <p style={{ color: t.accent, fontSize: 14 }}>Продолжай учиться</p>
        </div>
        <div style={{
          background: t.primary, color: "white", borderRadius: 12,
          padding: "6px 14px", fontSize: 14, fontWeight: 700
        }}>🔥 5 дней</div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ background: t.secondary, borderRadius: 16, padding: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>⚡ 340 XP</span>
          <span style={{ fontSize: 13, color: t.accent }}>до уровня 4: 160 XP</span>
        </div>
        <div style={{ background: "white", borderRadius: 99, height: 10 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 1, delay: 0.3 }}
            style={{ background: t.primary, height: 10, borderRadius: 99 }} />
        </div>
      </motion.div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 700, marginBottom: 10 }}>🎨 Тема</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(themes).map(([key, val]) => (
            <button key={key} onClick={() => setTheme(key)}
              style={{
                background: val.primary, color: "white",
                border: theme === key ? "3px solid black" : "3px solid transparent",
                borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}>
              {themeNames[key]}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontWeight: 700, marginBottom: 12 }}>🔥 Популярные курсы</p>

      {loading && (
        <div style={{ textAlign:"center", color: t.accent, padding: 20 }}>Загрузка...</div>
      )}

      {!loading && courses.length === 0 && (
        <div style={{ textAlign:"center", padding: 32, background:"white",
          borderRadius:16, color:"#94A3B8" }}>
          <div style={{ fontSize:40, marginBottom:8 }}>📚</div>
          <p style={{ fontWeight:600 }}>Курсов пока нет</p>
          <p style={{ fontSize:13 }}>Создай первый курс!</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {courses.map((course, i) => (
          <motion.div key={course.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/course/${course.id}`)}
            style={{
              background: "white", borderRadius: 16, padding: 16,
              boxShadow: `0 4px 12px ${t.secondary}`, cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>{course.emoji}</span>
              <div>
                <p style={{ fontWeight: 700 }}>{course.title}</p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>
                  {course.lessons?.[0]?.count || 0} уроков · {course.level}
                </p>
              </div>
            </div>
            <div style={{
              background: t.primary, color: "white",
              borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 700
            }}>Start</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}