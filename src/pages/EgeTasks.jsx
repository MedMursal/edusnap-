import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECT_EMOJIS = {
  "Биология": "🧬", "Химия": "⚗️", "Физика": "⚡", "Математика": "📐",
  "Русский язык": "📝", "История": "📜", "Обществознание": "🏛️", "Информатика": "💻",
};

function Select({ label, value, onChange, options, placeholder, t }) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>
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
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          color: value ? t.primary : t.textMuted, fontSize: 18, pointerEvents: "none",
        }}>⌄</span>
      </div>
    </div>
  );
}

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

  function handleSubject(s) { setSubject(s); setTopic(null); setLine(null); }
  function handleTopic(tp) { setTopic(tp); setLine(null); }
  function handleLine(ln) { setLine(ln ? parseInt(ln) : null); }

  const canStart = subject && (topic || line);
  const startCount = countTasks(subject, topic, line);

  function doStart() {
    const params = new URLSearchParams();
    params.set("subject", subject);
    if (topic) params.set("topic", topic);
    if (line) params.set("line", line);
    navigate(`/ege/test?${params.toString()}`);
  }

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

          {/* ПРЕДМЕТ */}
          <Select
            label="Предмет"
            value={subject}
            onChange={handleSubject}
            placeholder="— выбери предмет —"
            t={t}
            options={subjects.map(s => ({
              value: s,
              label: `${SUBJECT_EMOJIS[s] || "📚"} ${s}  (${countTasks(s, null, null)})`,
            }))}
          />

          {/* ТЕМА */}
          {subject && topics.length > 0 && (
            <Select
              label="Тема (необязательно)"
              value={topic}
              onChange={handleTopic}
              placeholder="— все темы —"
              t={t}
              options={topics.map(tp => ({
                value: tp,
                label: `${tp}  (${countTasks(subject, tp, null)})`,
              }))}
            />
          )}

          {/* ЛИНИЯ */}
          {subject && lines.length > 0 && (
            <Select
              label={topic ? `Линия · ${topic}` : "Линия (необязательно)"}
              value={line != null ? String(line) : ""}
              onChange={handleLine}
              placeholder="— все линии —"
              t={t}
              options={lines.map(ln => ({
                value: String(ln),
                label: `Линия ${ln}  (${countTasks(subject, topic, ln)} зад.)`,
              }))}
            />
          )}

          {/* Подсказка */}
          {subject && !topic && !line && (
            <p style={{ color: t.textMuted, fontSize: 13, textAlign: "center", marginTop: 12 }}>
              Выбери тему, линию или оба фильтра сразу
            </p>
          )}

          {/* Карточка-превью */}
          {canStart && (
            <div style={{
              marginTop: 8, background: t.surface,
              border: `1.5px solid ${t.border}`, borderRadius: 20,
              padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ fontSize: 32 }}>{SUBJECT_EMOJIS[subject] || "📚"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{subject}</div>
                <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
                  {topic && <span>{topic}</span>}
                  {topic && line && <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>}
                  {line && <span>Линия {line}</span>}
                </div>
              </div>
              <div style={{
                background: `${t.primary}22`, color: t.primary,
                borderRadius: 99, padding: "4px 12px", fontWeight: 700, fontSize: 14,
              }}>{startCount}</div>
            </div>
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
          }}>
            🚀 Начать · {startCount} заданий
          </button>
        </div>
      )}
    </div>
  );
}