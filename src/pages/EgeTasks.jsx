import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";

const SUBJECTS = {
  "Биология":      { emoji: "🧬", color: "#4ade80", bg: "#052e16" },
  "Химия":         { emoji: "⚗️",  color: "#fb923c", bg: "#1c0a00" },
  "Физика":        { emoji: "⚡",  color: "#facc15", bg: "#1a1500" },
  "Математика":    { emoji: "📐",  color: "#60a5fa", bg: "#0a1628" },
  "Русский язык":  { emoji: "📝",  color: "#f472b6", bg: "#1a0011" },
  "История":       { emoji: "📜",  color: "#c084fc", bg: "#120820" },
  "Обществознание":{ emoji: "🏛️",  color: "#34d399", bg: "#021a0e" },
  "Информатика":   { emoji: "💻",  color: "#38bdf8", bg: "#001520" },
};

function Select({ label, value, onChange, options, placeholder, t }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 11, color: t.textMuted,
        textTransform: "uppercase", letterSpacing: "0.08em",
        fontWeight: 700, marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value || ""}
          onChange={e => onChange(e.target.value || null)}
          style={{
            width: "100%", appearance: "none", WebkitAppearance: "none",
            background: t.surface, border: `1.5px solid ${value ? t.primary : t.border}`,
            color: value ? t.primary : t.textMuted,
            borderRadius: 16, padding: "13px 44px 13px 16px",
            fontSize: 15, fontWeight: value ? 700 : 400,
            cursor: "pointer", outline: "none",
            boxShadow: value ? `0 0 0 3px ${t.primary}22` : "none",
            transition: "all 0.15s",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)",
          color: value ? t.primary : t.textMuted,
          fontSize: 18, pointerEvents: "none",
        }}>⌄</span>
      </div>
    </div>
  );
}

/* ── Чипы для подтем ── */
function SubtopicChips({ subtopics, selected, onSelect, countFn, t, accentColor }) {
  if (!subtopics.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 11, color: t.textMuted,
        textTransform: "uppercase", letterSpacing: "0.08em",
        fontWeight: 700, marginBottom: 10,
      }}>
        Подтема{selected ? "" : " (необязательно)"}
      </label>

      {/* «Все подтемы» */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          onClick={() => onSelect(null)}
          style={{
            padding: "7px 14px",
            borderRadius: 99,
            border: `1.5px solid ${!selected ? accentColor : t.border}`,
            background: !selected ? `${accentColor}22` : t.surface,
            color: !selected ? accentColor : t.textMuted,
            fontWeight: !selected ? 700 : 400,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
            boxShadow: !selected ? `0 0 0 3px ${accentColor}18` : "none",
          }}
        >
          Все ({countFn(null)})
        </button>

        {subtopics.map(st => {
          const active = selected === st;
          const count = countFn(st);
          return (
            <button
              key={st}
              onClick={() => onSelect(active ? null : st)}
              style={{
                padding: "7px 14px",
                borderRadius: 99,
                border: `1.5px solid ${active ? accentColor : t.border}`,
                background: active ? `${accentColor}22` : t.surface,
                color: active ? accentColor : t.text,
                fontWeight: active ? 700 : 400,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: active ? `0 0 0 3px ${accentColor}18` : "none",
                maxWidth: 220,
                textAlign: "left",
                lineHeight: "1.3",
              }}
            >
              {st} <span style={{ opacity: 0.5, fontWeight: 400 }}>({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function EgeTasks({ t }) {
  const navigate = useNavigate();
  const { tgUser, dbUser } = useUser();

  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject]   = useState(null);
  const [topic, setTopic]       = useState(null);
  const [subtopic, setSubtopic] = useState(null);   // ← НОВОЕ
  const [line, setLine]         = useState(null);
  const [randomLoading, setRandomLoading] = useState(false);

  useEffect(() => { fetchMeta(); }, []);

  async function fetchMeta() {
    setLoading(true);
    let all = [];
    let from = 0;
    const BATCH = 1000;
    while (true) {
      const { data } = await supabase
        .from("ege_tasks")
        .select("subject, topic, subtopic, line_number")  // ← добавили subtopic
        .range(from, from + BATCH - 1);
      if (!data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < BATCH) break;
      from += BATCH;
    }
    setMeta(all);
    setLoading(false);
  }

  async function startRandom() {
    setRandomLoading(true);
    const userId = tgUser?.id || dbUser?.id;

    let solvedIds = [];
    if (userId) {
      const { data: solved } = await supabase
        .from("user_answers")
        .select("task_id")
        .eq("user_id", userId)
        .eq("is_correct", true);
      solvedIds = (solved || []).map(a => a.task_id);
    }

    let allIds = [];
    let from = 0;
    const BATCH = 1000;
    while (true) {
      let query = supabase.from("ege_tasks").select("id").range(from, from + BATCH - 1);
      if (subject)              query = query.eq("subject", subject);
      if (solvedIds.length > 0) query = query.not("id", "in", `(${solvedIds.slice(0, 200).join(",")})`);
      const { data } = await query;
      if (!data || data.length === 0) break;
      allIds = allIds.concat(data.map(x => x.id));
      if (data.length < BATCH) break;
      from += BATCH;
    }

    const shuffled = allIds.sort(() => Math.random() - 0.5).slice(0, 20);
    setRandomLoading(false);
    navigate(`/ege/test?ids=${shuffled.join(",")}`);
  }

  const totalCount = meta.length;
  const subjects = [...new Set(meta.map(x => x.subject).filter(Boolean))].sort();

  const topics = subject
    ? [...new Set(meta.filter(x => x.subject === subject).map(x => x.topic).filter(Boolean))].sort()
    : [];

  // ── Подтемы: только для выбранного предмета + темы ──
  const subtopics = (subject && topic)
    ? [...new Set(
        meta
          .filter(x => x.subject === subject && x.topic === topic && x.subtopic)
          .map(x => x.subtopic)
      )].sort()
    : [];

  const lines = subject
    ? [...new Set(
        meta
          .filter(x =>
            x.subject === subject &&
            (!topic    || x.topic    === topic) &&
            (!subtopic || x.subtopic === subtopic) &&
            x.line_number != null
          )
          .map(x => x.line_number)
      )].sort((a, b) => a - b)
    : [];

  function countTasks(s, tp, st, ln) {
    return meta.filter(x =>
      (!s  || x.subject     === s)  &&
      (!tp || x.topic       === tp) &&
      (!st || x.subtopic    === st) &&
      (!ln || x.line_number === ln)
    ).length;
  }

  function handleSubject(s) {
    setSubject(s === subject ? null : s);
    setTopic(null); setSubtopic(null); setLine(null);
  }
  function handleTopic(tp) {
    setTopic(tp); setSubtopic(null); setLine(null);
  }
  function handleSubtopic(st) { setSubtopic(st); setLine(null); }
  function handleLine(ln)     { setLine(ln ? parseInt(ln) : null); }

  const canStart  = subject && (topic || line);
  const startCount = countTasks(subject, topic, subtopic, line);

  function doStart() {
    const params = new URLSearchParams();
    params.set("subject", subject);
    if (topic)    params.set("topic",    topic);
    if (subtopic) params.set("subtopic", subtopic);   // ← передаём subtopic
    if (line)     params.set("line",     line);
    navigate(`/ege/test?${params.toString()}`);
  }

  const subjectInfo = subject
    ? (SUBJECTS[subject] || { emoji: "📚", color: t.primary, bg: t.surface })
    : null;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, paddingBottom: 140 }}>

      <div style={{ padding: "28px 20px 20px" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Задания ЕГЭ</h1>
        <p style={{ margin: "5px 0 0", color: t.textMuted, fontSize: 14 }}>{totalCount} заданий в базе</p>
      </div>

      {loading ? (
        <p style={{ color: t.textMuted, textAlign: "center", marginTop: 60 }}>Загрузка...</p>
      ) : (
        <div style={{ padding: "0 16px" }}>

          {/* ── ВЫБОР ПРЕДМЕТА ── */}
          {!subject && (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                Выбери предмет
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {subjects.map(s => {
                  const info  = SUBJECTS[s] || { emoji: "📚", color: t.primary, bg: t.surface };
                  const count = countTasks(s, null, null, null);
                  return (
                    <button key={s} onClick={() => handleSubject(s)} style={{
                      background: info.bg,
                      border: `2px solid ${info.color}33`,
                      borderRadius: 24, padding: "24px 16px 20px",
                      cursor: "pointer", transition: "all 0.18s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                      boxShadow: `0 4px 24px ${info.color}18`,
                    }}>
                      <span style={{ fontSize: 52, lineHeight: 1 }}>{info.emoji}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: info.color, textAlign: "center" }}>{s}</span>
                      <span style={{
                        fontSize: 11, color: info.color, opacity: 0.7,
                        background: `${info.color}18`, borderRadius: 99,
                        padding: "2px 10px", fontWeight: 600,
                      }}>{count} зад.</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── ПОСЛЕ ВЫБОРА ПРЕДМЕТА ── */}
          {subject && (
            <>
              {/* Заголовок предмета */}
              <button onClick={() => handleSubject(subject)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                background: subjectInfo.bg,
                border: `2px solid ${subjectInfo.color}55`,
                borderRadius: 20, padding: "14px 18px",
                cursor: "pointer", marginBottom: 16,
                boxShadow: `0 4px 20px ${subjectInfo.color}22`,
              }}>
                <span style={{ fontSize: 36 }}>{subjectInfo.emoji}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: subjectInfo.color }}>{subject}</div>
                  <div style={{ fontSize: 12, color: subjectInfo.color, opacity: 0.6, marginTop: 1 }}>нажми чтобы сменить</div>
                </div>
                <span style={{ fontSize: 20, color: subjectInfo.color, opacity: 0.5 }}>✕</span>
              </button>

              {/* 🎲 Случайные задания */}
              <button
                onClick={startRandom}
                disabled={randomLoading}
                style={{
                  width: "100%", marginBottom: 16,
                  background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`,
                  border: "none", borderRadius: 20, padding: "16px 20px",
                  cursor: randomLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: `0 4px 24px ${t.primaryGlow}`,
                  opacity: randomLoading ? 0.7 : 1,
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                    {randomLoading ? "⏳ Подбираем..." : "🎲 Случайные задания"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
                    20 новых · только те что ещё не решал
                  </div>
                </div>
                <span style={{ fontSize: 24, color: "#fff" }}>→</span>
              </button>

              {/* Разделитель */}
              <p style={{ margin: "0 0 12px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                Или выбери тему / линию
              </p>

              {/* Тема */}
              {topics.length > 0 && (
                <Select
                  label="Тема (необязательно)"
                  value={topic}
                  onChange={handleTopic}
                  placeholder="— все темы —"
                  t={t}
                  options={topics.map(tp => ({
                    value: tp,
                    label: `${tp}  (${countTasks(subject, tp, null, null)})`,
                  }))}
                />
              )}

              {/* ── ПОДТЕМА — показываем только если выбрана тема и есть подтемы ── */}
              {topic && subtopics.length > 0 && (
                <SubtopicChips
                  subtopics={subtopics}
                  selected={subtopic}
                  onSelect={handleSubtopic}
                  countFn={st => countTasks(subject, topic, st, null)}
                  t={t}
                  accentColor={subjectInfo.color}
                />
              )}

              {/* Линия */}
              {lines.length > 0 && (
                <Select
                  label={
                    topic
                      ? subtopic
                        ? `Линия · ${subtopic}`
                        : `Линия · ${topic}`
                      : "Линия (необязательно)"
                  }
                  value={line != null ? String(line) : ""}
                  onChange={handleLine}
                  placeholder="— все линии —"
                  t={t}
                  options={lines.map(ln => ({
                    value: String(ln),
                    label: `Линия ${ln}  (${countTasks(subject, topic, subtopic, ln)} зад.)`,
                  }))}
                />
              )}

              {!topic && !line && (
                <p style={{ color: t.textMuted, fontSize: 13, textAlign: "center", marginTop: 8 }}>
                  Выбери тему, линию или оба фильтра сразу
                </p>
              )}

              {/* Превью выбранного */}
              {canStart && (
                <div style={{
                  marginTop: 8, background: t.surface,
                  border: `1.5px solid ${t.border}`, borderRadius: 20,
                  padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 28 }}>{subjectInfo.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{subject}</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2, lineHeight: "1.5" }}>
                      {topic    && <span>{topic}</span>}
                      {topic && subtopic && <span style={{ margin: "0 5px", opacity: 0.4 }}>›</span>}
                      {subtopic && <span style={{ color: subjectInfo.color }}>{subtopic}</span>}
                      {(topic || subtopic) && line && <span style={{ margin: "0 5px", opacity: 0.4 }}>·</span>}
                      {line     && <span>Линия {line}</span>}
                    </div>
                  </div>
                  <div style={{
                    background: `${subjectInfo.color}22`, color: subjectInfo.color,
                    borderRadius: 99, padding: "4px 12px", fontWeight: 700, fontSize: 14,
                  }}>{startCount}</div>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {/* ── Кнопка старта ── */}
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
          }}>
            🚀 Начать · {startCount} заданий
          </button>
        </div>
      )}
    </div>
  );
}