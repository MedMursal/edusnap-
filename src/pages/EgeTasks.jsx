import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECT_EMOJIS = {
  "Биология": "🧬", "Химия": "⚗️", "Физика": "⚡", "Математика": "📐",
  "Русский язык": "📝", "История": "📜", "Обществознание": "🏛️", "Информатика": "💻",
};

export default function EgeTasks() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [subtopic, setSubtopic] = useState(null);

  useEffect(() => { fetchMeta(); }, []);

  async function fetchMeta() {
    setLoading(true);
    const { data } = await supabase.from("ege_tasks").select("subject, topic, subtopic");
    setMeta(data || []);
    setLoading(false);
  }

  const totalCount = meta.length;
  const subjects = [...new Set(meta.map(t => t.subject).filter(Boolean))].sort();
  const topics = subject
    ? [...new Set(meta.filter(t => t.subject === subject).map(t => t.topic).filter(Boolean))].sort()
    : [];
  const subtopics = subject && topic
    ? [...new Set(meta.filter(t => t.subject === subject && t.topic === topic).map(t => t.subtopic).filter(Boolean))].sort()
    : [];

  function countFor(s, to, st) {
    return meta.filter(t =>
      (!s || t.subject === s) &&
      (!to || t.topic === to) &&
      (!st || t.subtopic === st)
    ).length;
  }

  function buildQuery() {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (topic) params.set("topic", topic);
    if (subtopic) params.set("subtopic", subtopic);
    const q = params.toString();
    return q ? `/ege/test?${q}` : "/ege/test";
  }

  function selectSubject(s) {
    setSubject(s === subject ? null : s);
    setTopic(null);
    setSubtopic(null);
  }

  function selectTopic(t) {
    setTopic(t === topic ? null : t);
    setSubtopic(null);
  }

  const selectedCount = countFor(subject, topic, subtopic);

  function Chip({ label, active, onClick, count }) {
    return (
      <button onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: active ? "rgba(124,58,237,0.2)" : "#1a1a1a",
        border: `1.5px solid ${active ? "#7c3aed" : "#2d2d2d"}`,
        color: active ? "#c4b5fd" : "#ccc",
        borderRadius: 12, padding: "10px 14px",
        cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400,
        transition: "all 0.15s", textAlign: "left", width: "100%",
      }}>
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && (
          <span style={{ fontSize: 11, color: "#555", background: "#2d2d2d", borderRadius: 8, padding: "2px 7px" }}>
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif", paddingBottom: 140 }}>

      <div style={{ padding: "28px 20px 20px" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Задания ЕГЭ</h1>
        <p style={{ margin: "5px 0 0", color: "#555", fontSize: 14 }}>{totalCount} заданий в базе</p>
      </div>

      {loading ? (
        <p style={{ color: "#555", textAlign: "center", marginTop: 60 }}>Загрузка...</p>
      ) : (
        <div style={{ padding: "0 20px" }}>

          {/* Предмет */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Предмет
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {subjects.map(s => (
                <button key={s} onClick={() => selectSubject(s)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: subject === s ? "rgba(124,58,237,0.2)" : "#1a1a1a",
                  border: `1.5px solid ${subject === s ? "#7c3aed" : "#2d2d2d"}`,
                  color: subject === s ? "#c4b5fd" : "#ccc",
                  borderRadius: 14, padding: "12px 14px",
                  cursor: "pointer", fontSize: 14, fontWeight: subject === s ? 600 : 400,
                  transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 20 }}>{SUBJECT_EMOJIS[s] || "📚"}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{s}</span>
                  <span style={{ fontSize: 11, color: "#555", background: "#2d2d2d", borderRadius: 8, padding: "2px 7px" }}>
                    {countFor(s, null, null)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Тема */}
          {subject && topics.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                Тема
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {topics.map(t => (
                  <Chip key={t} label={t} active={topic === t} onClick={() => selectTopic(t)} count={countFor(subject, t, null)} />
                ))}
              </div>
            </div>
          )}

          {/* Подтема */}
          {subject && topic && subtopics.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                Подтема
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {subtopics.map(st => (
                  <Chip key={st} label={st} active={subtopic === st} onClick={() => setSubtopic(subtopic === st ? null : st)} count={countFor(subject, topic, st)} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Кнопка старт */}
      <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, padding: "12px 20px", background: "linear-gradient(to top, #0f0f0f 60%, transparent)" }}>
        <button
          onClick={() => navigate(buildQuery())}
          style={{
            width: "100%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff", border: "none", borderRadius: 16, padding: "16px",
            fontWeight: 700, fontSize: 16, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
          }}
        >
          🚀 Начать тест
          {selectedCount > 0 && (
            <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              · {selectedCount} заданий
            </span>
          )}
        </button>
      </div>
    </div>
  );
}