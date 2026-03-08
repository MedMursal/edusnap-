import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECTS = ["Математика", "Русский язык", "Физика", "Химия", "Биология", "История", "Обществознание", "Информатика"];

const diffColor = { "Лёгкое": "#22c55e", "Среднее": "#f59e0b", "Сложное": "#ef4444" };

export default function EgeTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("Все");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase.from("ege_tasks").select("*");
    setTasks(data || []);
    setLoading(false);
  }

  const filtered = filterSubject === "Все" ? tasks : tasks.filter((t) => t.subject === filterSubject);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Задания ЕГЭ</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{tasks.length} заданий</p>
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <button
          onClick={() => navigate(`/ege/test${filterSubject !== "Все" ? `?subject=${filterSubject}` : ""}`)}
          style={{
            width: "100%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff", border: "none", borderRadius: 14, padding: "14px",
            fontWeight: 700, fontSize: 16, cursor: "pointer", letterSpacing: 0.3,
          }}
        >
          🚀 Начать тест {filterSubject !== "Все" ? `· ${filterSubject}` : ""}
        </button>
      </div>

      <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {["Все", ...SUBJECTS].map((s) => (
          <button key={s} onClick={() => setFilterSubject(s)} style={{
            background: filterSubject === s ? "#7c3aed" : "#1e1e1e",
            color: filterSubject === s ? "#fff" : "#aaa",
            border: "none", borderRadius: 20, padding: "6px 14px",
            cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 500,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: 60 }}>Загрузка...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: 60 }}>Нет заданий.</p>
        ) : (
          filtered.map((task) => (
            <div key={task.id} style={{ background: "#1a1a1a", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
              <div onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                style={{ padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#2d2d2d", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#ccc" }}>{task.subject}</span>
                    {task.topic && <span style={{ background: "#2d2d2d", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#ccc" }}>{task.topic}</span>}
                    {task.subtopic && <span style={{ background: "#2d2d2d", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#aaa" }}>{task.subtopic}</span>}
                    {task.difficulty && (
                      <span style={{ borderRadius: 8, padding: "3px 10px", fontSize: 12, color: diffColor[task.difficulty] || "#aaa", background: "#2d2d2d" }}>
                        {task.difficulty}
                      </span>
                    )}
                    {(() => { try { const o = task.options ? JSON.parse(task.options) : []; return Array.isArray(o) && o.length >= 2; } catch { return false; } })() && (
                      <span style={{ background: "#1a3a2a", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#4ade80" }}>с вариантами</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#e5e5e5" }}>
                    {task.question.length > 120 && expandedId !== task.id
                      ? task.question.slice(0, 120) + "..."
                      : task.question}
                  </p>
                </div>
                <span style={{ color: "#555", marginLeft: 12, fontSize: 18 }}>{expandedId === task.id ? "▲" : "▼"}</span>
              </div>

              {expandedId === task.id && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #2a2a2a" }}>
                  {task.image_url && (
                    <img src={task.image_url} alt="задание" style={{ width: "100%", borderRadius: 10, marginTop: 14, objectFit: "contain", maxHeight: 300 }} />
                  )}
                  <div style={{ marginTop: 14, background: "#222", borderRadius: 10, padding: 14 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Ответ</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "#22c55e", fontSize: 16 }}>{task.answer}</p>
                  </div>
                  {task.solution && (
                    <div style={{ marginTop: 10, background: "#222", borderRadius: 10, padding: 14 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Решение</p>
                      <p style={{ margin: 0, color: "#ccc", fontSize: 14, lineHeight: 1.6 }}>{task.solution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}