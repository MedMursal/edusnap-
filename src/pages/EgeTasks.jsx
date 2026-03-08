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
  const [line, setLine] = useState(null);

  useEffect(() => { fetchMeta(); }, []);

  async function fetchMeta() {
    setLoading(true);
    const { data } = await supabase.from("ege_tasks").select("subject, topic, line_number");
    setMeta(data || []);
    setLoading(false);
  }

  const totalCount = meta.length;
  const subjects = [...new Set(meta.map(x => x.subject).filter(Boolean))].sort();

  const topics = subject
    ? [...new Set(meta.filter(x => x.subject === subject).map(x => x.topic).filter(Boolean))].sort()
    : [];

  // Lines filtered by subject + optional topic
  const lines = subject
    ? [...new Set(
        meta
          .filter(x => x.subject === subject && (!topic || x.topic === topic) && x.line_number != null)
          .map(x => x.line_number)
      )].sort((a, b) => a - b)
    : [];

  function countTasks(s, tp, ln) {
    return meta.filter(x =>
      (!s || x.subject === s) &&
      (!tp || x.topic === tp) &&
      (!ln || x.line_number === ln)
    ).length;
  }

  function countTopicLines(tp) {
    return [...new Set(
      meta.filter(x => x.subject === subject && x.topic === tp && x.line_number != null).map(x => x.line_number)
    )].length;
  }

  function selectSubject(s) { setSubject(s === subject ? null : s); setTopic(null); setLine(null); }
  function selectTopic(tp) { setTopic(tp === topic ? null : tp); setLine(null); }
  function selectLine(ln) { setLine(ln === line ? null : ln); }

  const canStart = subject && (topic || line);
  const startCount = countTasks(subject, topic, line);

  function doStart() {
    const params = new URLSearchParams();
    params.set("subject", subject);
    if (topic) params.set("topic", topic);
    if (line) params.set("line", line);
    navigate(`/ege/test?${params.toString()}`);
  }

  function Badge({ count, active }) {
    return (
      <span style={{
        fontSize: 11, borderRadius: 99, padding: "2px 8px", flexShrink: 0,
        color: active ? t.primary : t.textMuted,
        background: active ? `${t.primary}22` : t.surfaceUp,
      }}>{count}</span>
    );
  }

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

          {/* ПРЕДМЕТ */}
          <Section label="Предмет" t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {subjects.map(s => {
                const active = subject === s;
                return (
                  <button key={s} onClick={() => selectSubject(s)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: active ? t.secondary : t.surface,
                    border: `1.5px solid ${active ? t.primary : t.border}`,
                    color: active ? t.primary : t.text,
                    borderRadius: 20, padding: "12px 14px",
                    cursor: "pointer", fontSize: 14,
                    fontWeight: active ? 700 : 400, transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 20 }}>{SUBJECT_EMOJIS[s] || "📚"}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{s}</span>
                    <Badge count={countTasks(s, null, null)} active={active} />
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ТЕМА (необязательно) */}
          {subject && topics.length > 0 && (
            <Section label="Тема (необязательно)" t={t}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {topics.map(tp => {
                  const active = topic === tp;
                  const lineCount = countTopicLines(tp);
                  return (
                    <button key={tp} onClick={() => selectTopic(tp)} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: active ? t.secondary : t.surface,
                      border: `1.5px solid ${active ? t.primary : t.border}`,
                      color: active ? t.primary : t.text,
                      borderRadius: 999, padding: "11px 16px",
                      cursor: "pointer", fontSize: 14,
                      fontWeight: active ? 700 : 400, transition: "all 0.15s", textAlign: "left",
                    }}>
                      <span style={{ flex: 1 }}>{tp}</span>
                      {lineCount > 0 && (
                        <span style={{ fontSize: 11, color: active ? t.primary : t.textMuted, marginRight: 4 }}>
                          {lineCount} лин.
                        </span>
                      )}
                      <Badge count={countTasks(subject, tp, null)} active={active} />
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ЛИНИЯ (необязательно) */}
          {subject && lines.length > 0 && (
            <Section label={topic ? `Линии · ${topic}` : "Линия (необязательно)"} t={t}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {lines.map(ln => {
                  const active = line === ln;
                  const count = countTasks(subject, topic, ln);
                  return (
                    <button key={ln} onClick={() => selectLine(ln)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 3,
                      background: active ? t.secondary : t.surface,
                      border: `1.5px solid ${active ? t.primary : t.border}`,
                      borderRadius: 18, padding: "12px 6px",
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: active ? `0 2px 10px ${t.primaryGlow}` : "none",
                    }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: active ? t.primary : t.text }}>{ln}</span>
                      <span style={{ fontSize: 10, color: active ? t.primary : t.textMuted }}>{count} зад.</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {subject && !topic && !line && (
            <p style={{ color: t.textMuted, fontSize: 13, textAlign: "center", marginTop: 4 }}>
              Выбери тему, линию или оба фильтра сразу
            </p>
          )}

        </div>
      )}

      {/* КНОПКА СТАРТ */}
      {canStart && (
        <div style={{
          position: "fixed", bottom: 70, left: 0, right: 0,
          padding: "12px 20px",
          background: `linear-gradient(to top, ${t.bg} 60%, transparent)`,
        }}>
          <button onClick={doStart} style={{
            width: "100%",
            background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
            color: "#fff", border: "none", borderRadius: 999,
            padding: "16px", fontWeight: 700, fontSize: 16,
            cursor: "pointer", boxShadow: `0 4px 24px ${t.primaryGlow}`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span>🚀 Начать тест</span>
            {topic && <span style={{ opacity: 0.8, fontWeight: 400, fontSize: 13 }}>· {topic}</span>}
            {line && <span style={{ opacity: 0.8, fontWeight: 400, fontSize: 13 }}>· Линия {line}</span>}
            <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 12 }}>({startCount} зад.)</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ label, t, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        margin: "0 0 10px", fontSize: 11,
        color: t.textMuted, textTransform: "uppercase",
        letterSpacing: "0.08em", fontWeight: 700,
      }}>{label}</p>
      {children}
    </div>
  );
}