import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECT_EMOJIS = {
  "Биология": "🧬", "Химия": "⚗️", "Физика": "⚡", "Математика": "📐",
  "Русский язык": "📝", "История": "📜", "Обществознание": "🏛️", "Информатика": "💻",
};

const LINE_NAMES = {
  1: "Биология как наука",
  2: "Клеточная теория",
  3: "Химический состав",
  4: "Строение клетки",
  5: "Обмен веществ",
  6: "ДНК и РНК",
  7: "Деление клетки",
  8: "Размножение",
  9: "Онтогенез",
  10: "Генетика. Законы Менделя",
  11: "Генетика. Задачи",
  12: "Изменчивость",
  13: "Биотехнологии. Селекция",
  14: "Многообразие организмов",
  15: "Растения",
  16: "Животные",
  17: "Человек. Опора и движение",
  18: "Человек. Внутренние органы",
  19: "Человек. Нервная система",
  20: "Человек. Гуморальная регуляция",
  21: "Человек. Иммунитет",
  22: "Эволюция",
  23: "Происхождение жизни",
  24: "Экосистемы",
  25: "Биосфера",
  26: "Задание с рисунком",
  27: "Задание с таблицей",
  28: "Обобщающее задание",
};

export default function EgeTasks({ t }) {
  const navigate = useNavigate();
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [line, setLine] = useState(null);

  useEffect(() => { fetchMeta(); }, []);

  async function fetchMeta() {
    setLoading(true);
    const { data } = await supabase.from("ege_tasks").select("subject, line_number");
    setMeta(data || []);
    setLoading(false);
  }

  const totalCount = meta.length;
  const subjects = [...new Set(meta.map(x => x.subject).filter(Boolean))].sort();

  // Линии для выбранного предмета
  const lines = subject
    ? [...new Set(meta.filter(x => x.subject === subject && x.line_number != null).map(x => x.line_number))].sort((a, b) => a - b)
    : [];

  function countForLine(s, ln) {
    return meta.filter(x => x.subject === s && x.line_number === ln).length;
  }

  function countForSubject(s) {
    return meta.filter(x => x.subject === s).length;
  }

  function selectSubject(s) {
    setSubject(s === subject ? null : s);
    setLine(null);
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

          {/* Предмет */}
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
                  <span style={{ fontSize: 11, color: t.textMuted, background: t.surfaceUp, borderRadius: 99, padding: "2px 8px" }}>
                    {countForSubject(s)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Линии */}
          {subject && lines.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                Линия задания
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {lines.map(ln => {
                  const active = line === ln;
                  const count = countForLine(subject, ln);
                  return (
                    <button key={ln} onClick={() => setLine(line === ln ? null : ln)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: active ? t.secondary : t.surface,
                        border: `1.5px solid ${active ? t.primary : t.border}`,
                        color: active ? t.primary : t.text,
                        borderRadius: 999, padding: "10px 14px",
                        cursor: "pointer", transition: "all 0.15s",
                        textAlign: "left", width: "100%",
                      }}>
                      {/* Номер линии */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                        background: active ? t.primary : t.surfaceUp,
                        color: active ? "white" : t.textMuted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800,
                        boxShadow: active ? `0 2px 8px ${t.primaryGlow}` : "none",
                        transition: "all 0.15s",
                      }}>
                        {ln}
                      </div>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 700 : 400 }}>
                        {LINE_NAMES[ln] || `Линия ${ln}`}
                      </span>
                      <span style={{
                        fontSize: 11, color: active ? t.primary : t.textMuted,
                        background: active ? `${t.primary}22` : t.surfaceUp,
                        borderRadius: 99, padding: "2px 8px", flexShrink: 0,
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {subject && lines.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: t.textMuted }}>
              <p style={{ fontSize: 14 }}>Нет заданий с номерами линий</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Запусти парсер заново</p>
            </div>
          )}

        </div>
      )}

      {/* Кнопка старт */}
      {line && (
        <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, padding: "12px 20px", background: `linear-gradient(to top, ${t.bg} 60%, transparent)` }}>
          <button
            onClick={() => navigate(`/ege/test?subject=${encodeURIComponent(subject)}&line=${line}`)}
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