import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../supabase"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f0f13", card: "#1a1a22", border: "#2a2a38",
  accent: "#6c63ff", green: "#22c55e", red: "#ef4444",
  text: "#f1f0ff", muted: "#8884a8", yellow: "#facc15",
}

// ─── Text Block ───────────────────────────────────────────────────────────────
function TextBlock({ content }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, padding: 20,
      border: `1px solid ${C.border}`, marginBottom: 12,
    }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, fontWeight: 600 }}>
        📝 Текст
      </div>
      <p style={{ color: C.text, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
        {content?.text || ""}
      </p>
    </div>
  )
}

// ─── Video Block ──────────────────────────────────────────────────────────────
function VideoBlock({ content }) {
  const url = content?.url || ""
  const embedUrl = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/")

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, fontWeight: 600 }}>
        🎬 Видео
      </div>
      {url ? (
        <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9",
          border: `1px solid ${C.border}` }}>
          <iframe src={embedUrl} style={{ width: "100%", height: "100%", border: "none" }}
            allowFullScreen />
        </div>
      ) : (
        <div style={{ background: C.card, borderRadius: 14, padding: 32,
          textAlign: "center", color: C.muted, border: `1px solid ${C.border}` }}>
          Видео не добавлено
        </div>
      )}
    </div>
  )
}

// ─── Quiz Block ───────────────────────────────────────────────────────────────
function QuizBlock({ content }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  const question = content?.question || ""
  const options = content?.options || []
  const correct = content?.correct ?? 0

  const check = () => { if (selected !== null) setAnswered(true) }
  const reset = () => { setSelected(null); setAnswered(false) }

  const isCorrect = selected === correct

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 20,
      border: `1px solid ${C.border}`, marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, fontWeight: 600 }}>
        ❓ Квиз
      </div>
      <p style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
        {question}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, i) => {
          let bg = "#12121a"
          let border = C.border
          let color = C.text
          if (answered) {
            if (i === correct) { bg = "#14532d"; border = C.green; color = C.green }
            else if (i === selected) { bg = "#2a1a1a"; border = C.red; color = C.red }
          } else if (selected === i) {
            bg = C.accent + "22"; border = C.accent; color = C.text
          }

          return (
            <motion.button key={i} whileTap={{ scale: 0.98 }}
              onClick={() => !answered && setSelected(i)}
              style={{
                background: bg, border: `2px solid ${border}`, borderRadius: 10,
                padding: "12px 16px", color, fontSize: 14, fontWeight: 500,
                cursor: answered ? "default" : "pointer", textAlign: "left",
                fontFamily: "inherit", transition: "all .2s",
              }}>
              {answered && i === correct && "✓ "}
              {answered && i === selected && i !== correct && "✗ "}
              {opt}
            </motion.button>
          )
        })}
      </div>

      {!answered ? (
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={check} disabled={selected === null}
          style={{
            marginTop: 14, width: "100%", padding: "12px", borderRadius: 10,
            background: selected !== null ? C.accent : C.border,
            border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: selected !== null ? "pointer" : "not-allowed", fontFamily: "inherit",
          }}>
          Проверить
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 14 }}>
          <div style={{
            padding: "12px 16px", borderRadius: 10,
            background: isCorrect ? "#14532d" : "#2a1a1a",
            border: `1px solid ${isCorrect ? C.green : C.red}`,
            color: isCorrect ? C.green : C.red,
            fontSize: 14, fontWeight: 600, marginBottom: 8,
          }}>
            {isCorrect ? "🎉 Правильно!" : "❌ Неправильно"}
          </div>
          <button onClick={reset}
            style={{ background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 16px", color: C.muted,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Попробовать снова
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [blocks, setBlocks] = useState({}) // { lesson_id: [blocks] }
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState([])

  useEffect(() => {
    const load = async () => {
      // Загружаем курс
      const { data: courseData } = await supabase
        .from("courses").select("*").eq("id", id).single()
      setCourse(courseData)

      // Загружаем уроки
      const { data: lessonsData } = await supabase
        .from("lessons").select("*").eq("course_id", id).order("order_index")
      setLessons(lessonsData || [])

      if (lessonsData?.length > 0) {
        setActiveLesson(lessonsData[0].id)

        // Загружаем блоки для всех уроков
        const { data: blocksData } = await supabase
          .from("blocks").select("*")
          .in("lesson_id", lessonsData.map(l => l.id))
          .order("order_index")

        // Группируем блоки по урокам
        const grouped = {}
        for (const b of (blocksData || [])) {
          if (!grouped[b.lesson_id]) grouped[b.lesson_id] = []
          grouped[b.lesson_id].push(b)
        }
        setBlocks(grouped)
      }

      setLoading(false)
    }
    load()
  }, [id])

  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(p => [...p, lessonId])
    }
    // Переходим к следующему уроку
    const idx = lessons.findIndex(l => l.id === lessonId)
    if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1].id)
  }

  const progress = lessons.length > 0
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", color: C.text }}>
      Загрузка курса...
    </div>
  )

  if (!course) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", color: C.text }}>
      Курс не найден
    </div>
  )

  const activeLessonData = lessons.find(l => l.id === activeLesson)
  const activeBlocks = blocks[activeLesson] || []

  return (
    <div style={{ minHeight: "100vh", background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif", color: C.text,
      padding: "20px 16px 100px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Назад */}
        <button onClick={() => navigate("/")}
          style={{ background: "transparent", border: "none", color: C.muted,
            fontSize: 14, cursor: "pointer", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          ← Назад
        </button>

        {/* Шапка курса */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>{course.emoji}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{course.title}</h1>
            <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>
              {course.category} · {course.level}
            </p>
          </div>
        </div>

        {/* Прогресс */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16,
          border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Прогресс</span>
            <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ background: C.border, borderRadius: 99, height: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{ background: C.accent, height: 8, borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
            {completedLessons.length} из {lessons.length} уроков пройдено
          </div>
        </div>

        {/* Список уроков */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {lessons.map((l, i) => (
            <motion.button key={l.id} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveLesson(l.id)}
              style={{
                padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                background: activeLesson === l.id ? C.accent : C.card,
                border: `1px solid ${activeLesson === l.id ? C.accent : C.border}`,
                color: activeLesson === l.id ? "#fff" : C.muted,
              }}>
              {completedLessons.includes(l.id) ? "✓ " : ""}{i + 1}. {l.title}
            </motion.button>
          ))}
        </div>

        {/* Активный урок */}
        <AnimatePresence mode="wait">
          {activeLessonData && (
            <motion.div key={activeLesson}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}>

              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                {activeLessonData.title}
              </h2>

              {activeBlocks.length === 0 ? (
                <div style={{ background: C.card, borderRadius: 14, padding: 32,
                  textAlign: "center", color: C.muted, border: `1px solid ${C.border}` }}>
                  В этом уроке пока нет контента
                </div>
              ) : (
                activeBlocks.map(block => (
                  <div key={block.id}>
                    {block.type === "text"  && <TextBlock  content={block.content} />}
                    {block.type === "video" && <VideoBlock content={block.content} />}
                    {block.type === "quiz"  && <QuizBlock  content={block.content} />}
                  </div>
                ))
              )}

              {/* Кнопка завершить урок */}
              {!completedLessons.includes(activeLesson) && (
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => completeLesson(activeLesson)}
                  style={{
                    marginTop: 20, width: "100%", padding: 16, borderRadius: 14,
                    border: "none", background: `linear-gradient(135deg, ${C.accent}, #a855f7)`,
                    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", boxShadow: `0 8px 32px ${C.accent}44`,
                  }}>
                  ✅ Завершить урок
                </motion.button>
              )}

              {completedLessons.includes(activeLesson) && (
                <div style={{ marginTop: 20, padding: 16, borderRadius: 14,
                  background: "#14532d", border: `1px solid ${C.green}`,
                  color: C.green, textAlign: "center", fontWeight: 700, fontSize: 15 }}>
                  🎉 Урок пройден!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Курс пройден */}
        {progress === 100 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: 24, padding: 24, borderRadius: 16,
              background: "linear-gradient(135deg, #14532d, #1a1a22)",
              border: `1px solid ${C.green}`, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <h3 style={{ color: C.green, fontWeight: 800, fontSize: 20, margin: 0 }}>
              Курс завершён!
            </h3>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>
              Ты прошёл все уроки
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}