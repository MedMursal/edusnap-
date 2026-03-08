import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECT_EMOJIS = {
  "Биология": "🧬", "Химия": "⚗️", "Физика": "⚡", "Математика": "📐",
  "Русский язык": "📝", "История": "📜", "Обществознание": "🏛️", "Информатика": "💻",
};

// Названия линий ЕГЭ по биологии
const LINE_NAMES = {
  1: "Биология как наука",
  2: "Клеточная теория",
  3: "Химический состав клетки",
  4: "Строение клетки",
  5: "Метаболизм",
  6: "Наследственная информация",
  7: "Деление клетки",
  8: "Организм как биологическая система",
  9: "Размножение организмов",
  10: "Онтогенез",
  11: "Генетика",
  12: "Закономерности наследования",
  13: "Изменчивость",
  14: "Селекция",
  15: "Эволюция",
  16: "Происхождение жизни",
  17: "Систематика растений",
  18: "Систематика животных",
  19: "Грибы и бактерии",
  20: "Вирусы",
  21: "Растения",
  22: "Животные",
  23: "Человек: опора и движение",
  24: "Человек: внутренние органы",
  25: "Человек: регуляция",
  26: "Экология",
  27: "Задание с рисунком",
  28: "Задание с таблицей",
};

export default function EgeTasks({ t }) {
  const navigate = useNavigate();
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [mode, setMode] = useState("topics"); // "topics" | "lines"
  const [topic, setTopic] = useState(null);
  const [subtopic, setSubtopic] = useState(null);
  const [line, setLine] = useState(null);

  useEffect(() => { fetchMeta(); }, []);

  async function fetchMeta() {
    setLoading(true);
    const { data } = await supabase.from("ege_tasks").select("subject, topic, subtopic, line_number");
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

  // Линии для выбранного предмета
  const lines = subject
    ? [...new Set(meta.filter(x => x.subject === subject && x.line_number).map(x => x.line_number))].sort((a, b) => a - b)
    : [];

  function countFor(s, to, st) {
    return meta.filter(x =>
      (!s || x.subject === s) && (!to || x.topic === to) && (!st || x.subtopic === st)
    ).length;
  }

  function countForLine(s, ln) {
    return meta.filter(x => (!s || x.subject === s) && x.line_number === ln).length;
  }

  function buildQuery(s, to, st, ln) {
    const params = new URLSearchParams();
    if (s) params.set("subject", s);
    if (to) params.set("topic", to);
    if (st) params.set("subtopic", st);
    if (ln) params.set("line", ln);
    const q = params.toString();
    return q ? `/ege/test?${q}` : "/ege/test";
  }

  function selectSubject(s) {
    setSubject(s === subject ? null : s);
    setTopic(null); setSubtopic(null); setLine(null);
  }
  function selectTopic(tp) { setTopic(tp === topic ? null : tp); setSubtopic(null); }
  function switchMode(m) { setMode(m); setTopic(null); setSubtopic(null); setLine(null); }

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

  const showSubtopicView = subject && topic && mode === "topics";

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

          {/* Предмет */}
          {!showSubtopicView && (
            <div style={{ marginBottom: 20 }}>
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
          )}

          {/* Переключатель По темам / По линиям */}
          {subject && !showSubtopicView && (
            <div style={{
              display: "flex", gap: 6, marginBottom: 20,
              background: t.surfaceUp, borderRadius: 999, padding: 4,
            }}>
              {[
                { value: "topics", label: "📚 По темам" },
                { value: "lines",  label: "🔢 По линиям" },
              ].map(({ value, label }) => (
                <button key={value} onClick={() => switchMode(value)}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 999,
                    background: mode === value ? t.primary : "transparent",
                    color: mode === value ? "white" : t.textMuted,
                    border: "none", cursor: "pointer",
                    fontWeight: 700, fontSize: 13,
                    transition: "all 0.2s",
                    boxShadow: mode === value ? `0 2px 8px ${t.primaryGlow}` : "none",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── РЕЖИМ: ПО ТЕМАМ ── */}
          {subject && mode === "topics" && !showSubtopicView && topics.length > 0 && (
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

          {/* ── РЕЖИМ: ПО ЛИНИЯМ ── */}
          {subject && mode === "lines" && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                Линия задания
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {lines.map(ln => (
                  <button key={ln} onClick={() => setLine(line === ln ? null : ln)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: line === ln ? t.secondary : t.surface,
                      border: `1.5px solid ${line === ln ? t.primary : t.border}`,
                      color: line === ln ? t.primary : t.text,
                      borderRadius: 999, padding: "10px 16px",
                      cursor: "pointer", fontSize: 14,
                      fontWeight: line === ln ? 700 : 400,
                      transition: "all 0.15s", textAlign: "left", width: "100%",
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                      background: line === ln ? t.primary : t.surfaceUp,
                      color: line === ln ? "white" : t.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {ln}
                    </div>
                    <span style={{ flex: 1 }}>{LINE_NAMES[ln] || `Линия ${ln}`}</span>
                    <Badge count={countForLine(subject, ln)} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ПОДТЕМЫ (режим По темам) ── */}
          {showSubtopicView && (
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
                  Подтема
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => navigate(buildQuery(subject, topic, null, null))} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: t.secondary, border: `1.5px solid ${t.primary}`,
                    color: t.primary, borderRadius: 999, padding: "12px 16px",
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

      {/* Кнопка старт — подтема */}
      {subtopic && mode === "topics" && (
        <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, padding: "12px 20px", background: `linear-gradient(to top, ${t.bg} 60%, transparent)` }}>
          <button onClick={() => navigate(buildQuery(subject, topic, subtopic, null))}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
              color: "#fff", border: "none", borderRadius: 999, padding: "16px",
              fontWeight: 700, fontSize: 16, cursor: "pointer",
              boxShadow: `0 4px 24px ${t.primaryGlow}`,
            }}>
            🚀 Начать тест
            <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              · {countFor(subject, topic, subtopic)} заданий
            </span>
          </button>
        </div>
      )}

      {/* Кнопка старт — линия */}
      {line && mode === "lines" && (
        <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, padding: "12px 20px", background: `linear-gradient(to top, ${t.bg} 60%, transparent)` }}>
          <button onClick={() => navigate(buildQuery(subject, null, null, line))}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
              color: "#fff", border: "none", borderRadius: 999, padding: "16px",
              fontWeight: 700, fontSize: 16, cursor: "pointer",
              boxShadow: `0 4px 24px ${t.primaryGlow}`,
            }}>
            🚀 Линия {line} — начать
            <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              · {countForLine(subject, line)} заданий
            </span>
          </button>
        </div>
      )}
    </div>
  );
}