import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECT_EMOJIS = {
  "Биология": "🧬", "Химия": "⚗️", "Физика": "⚡", "Математика": "📐",
  "Русский язык": "📝", "История": "📜", "Обществознание": "🏛️", "Информатика": "💻",
};

export default function EgeTasks({ t }) {
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
  const subjects = [...new Set(meta.map(x => x.subject).filter(Boolean))].sort();
  const topics = subject
    ? [...new Set(meta.filter(x => x.subject === subject).map(x => x.topic).filter(Boolean))].sort()
    : [];
  const subtopics = subject && topic
    ? [...new Set(meta.filter(x => x.subject === subject && x.topic === topic).map(x => x.subtopic).filter(Boolean))].sort()
    : [];

  function countFor(s, to, st) {
    return meta.filter(x =>
      (!s || x.subject === s) && (!to || x.topic === to) && (!st || x.subtopic === st)
    ).length;
  }

  function buildQuery(s, to, st) {
    const params = new URLSearchParams();
    if (s) params.set("subject", s);
    if (to) params.set("topic", to);
    if (st) params.set("subtopic", st);
    const q = params.toString();
    return q ? `/ege/test?${q}` : "/ege/test";
  }

  function selectSubject(s) { setSubject(s === subject ? null : s); setTopic(null); setSubtopic(null); }
  function selectTopic(tp) { setTopic(tp === topic ? null : tp); setSubtopic(null); }

  function Badge({ count }) {
    return (
      <span style={{
        fontSize: 11, color: t.textMuted,
        background: t.surfaceUp, borderRadius: 99,
        padding: "2px 8px", flexShrink: 0,
      }}>{count}</span>
    );
  }

  function Chip({ label, active, onClick, count }) {
    return (
      <button onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: active ? t.secondary : t.surface,
        border: `1.5px solid ${active ? t.primary : t.border}`,
        color: active ? t.primary : t.text,
        borderRadius: 999, padding: "10px 16px",
        cursor: "pointer", fontSize: 14,
        fontWeight: active ? 700 : 400,
        transition: "all 0.15s", textAlign: "left", width: "100%",
      }}>
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && <Badge count={count} />}
      </button>
    );
  }

  const showSubtopicView = subject && topic;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, paddingBottom: 140 }}>

      <div style={{ padding: "28px 20px 16px" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: t.text }}>Задания ЕГЭ</h1>
        <p style={{ margin: "5px 0 0", color: t.textMuted, fontSize: 14 }}>{totalCount} заданий в базе</p>
      </div>

      {loading ? (
        <p style={{ color: t.textMuted, textAlign: "center", marginTop: 60 }}>Загрузка...</p>
      ) : (
        <div style={{ padding: "0 16px" }}>

          {!showSubtopicView ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Предмет
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {subjects.map(s => (
                    <button key={s} onClick={() => selectSubject(s)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: subject === s ? t.secondary : t.surface,
                      border: `1.5px solid ${subject === s ? t.primary : t.border}`,
                      color: subject === s ? t.primary : t.text,
                      borderRadius: 20, padding: "12px 14px",
                      cursor: "pointer", fontSize: 14,
                      fontWeight: subject === s ? 700 : 400,
                      transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: 20 }}>{SUBJECT_EMOJIS[s] || "📚"}</span>
                      <span style={{ flex: 1, textAlign: "left" }}>{s}</span>
                      <Badge count={countFor(s, null, null)} />
                    </button>
                  ))}
                </div>
              </div>

              {subject && topics.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                    Тема
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {topics.map(tp => (
                      <Chip key={tp} label={tp} active={topic === tp} onClick={() => selectTopic(tp)} count={countFor(subject, tp, null)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <button onClick={() => { setTopic(null); setSubtopic(null); }} style={{
                  background: t.surface, border: `1.5px solid ${t.border}`,
                  color: t.textMuted, borderRadius: 999,
                  width: 36, height: 36, cursor: "pointer", fontSize: 17,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>←</button>
                <div>
                  <div style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{subject}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: t.primary }}>{topic}</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Выбери подтему
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => navigate(buildQuery(subject, topic, null))} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: t.secondary,
                    border: `1.5px solid ${t.primary}`,
                    color: t.primary,
                    borderRadius: 999, padding: "12px 16px",
                    cursor: "pointer", fontSize: 14, fontWeight: 700,
                    textAlign: "left", width: "100%",
                  }}>
                    <span style={{ flex: 1 }}>🚀 Все задания по теме</span>
                    <Badge count={countFor(subject, topic, null)} />
                  </button>

                  {subtopics.map(st => (
                    <Chip key={st} label={st} active={subtopic === st}
                      onClick={() => setSubtopic(subtopic === st ? null : st)}
                      count={countFor(subject, topic, st)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {subtopic && (
        <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, padding: "12px 20px", background: `linear-gradient(to top, ${t.bg} 60%, transparent)` }}>
          <button
            onClick={() => navigate(buildQuery(subject, topic, subtopic))}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
              color: "#fff", border: "none", borderRadius: 999, padding: "16px",
              fontWeight: 700, fontSize: 16, cursor: "pointer",
              boxShadow: `0 4px 24px ${t.primaryGlow}`,
            }}
          >
            🚀 Начать тест
            <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              · {countFor(subject, topic, subtopic)} заданий
            </span>
          </button>
        </div>
      )}
    </div>
  );
}