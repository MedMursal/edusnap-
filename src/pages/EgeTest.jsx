import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";

const S = {
  bg: "#030712",
  surface: "#111827",
  surfaceUp: "#1f2937",
  border: "#374151",
  primary: "#6366f1",
  text: "#f9fafb",
  textMuted: "#9ca3af",
  textDim: "#6b7280",
  greenBorder: "#16a34a",
  greenText: "#4ade80",
  redBorder: "#dc2626",
  redText: "#f87171",
};

function EgeStyles() {
  return (
    <style>{`
      .ege-question table{width:100%;border-collapse:collapse;margin:16px 0;font-size:18px;}
      .ege-question td,.ege-question th{border:1px solid #374151;padding:12px 16px;color:#e5e7eb;}
      .ege-question th{background:#1f2937;font-weight:600;}
      .ege-question tr:nth-child(even) td{background:#0f172a;}
      .ege-question img{max-width:100%;height:auto;border-radius:12px;margin:12px 0;display:block;}
      .ege-question p{margin-bottom:8px;}
      .ege-question ol,.ege-question ul{padding-left:24px;margin:8px 0;}
      .ege-question li{margin-bottom:6px;}
      .ege-opt-btn:hover{border-color:#6366f1 !important;}
      .ege-skip-btn:hover{border-color:#6b7280 !important; color:#f9fafb !important;}
    `}</style>
  );
}

function MatchWidget({ rows, cols, answers, onChange }) {
  const [selected, setSelected] = useState(null);
  const leftRefs = useRef([]);
  const rightRefs = useRef([]);
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  useEffect(() => { setTimeout(computeLines, 50); }, [answers]);

  function computeLines() {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const newLines = [];
    rows.forEach((_, i) => {
      const col = answers[i];
      if (!col) return;
      const colIdx = parseInt(col) - 1;
      const lEl = leftRefs.current[i];
      const rEl = rightRefs.current[colIdx];
      if (!lEl || !rEl) return;
      const lRect = lEl.getBoundingClientRect();
      const rRect = rEl.getBoundingClientRect();
      newLines.push({
        x1: lRect.right - cRect.left,
        y1: lRect.top + lRect.height / 2 - cRect.top,
        x2: rRect.left - cRect.left,
        y2: rRect.top + rRect.height / 2 - cRect.top,
        key: i,
      });
    });
    setLines(newLines);
  }

  function handleLeft(i) { setSelected(selected === i ? null : i); }
  function handleRight(c) {
    if (selected === null) return;
    onChange({ ...answers, [selected]: String(c) });
    setSelected(null);
    setTimeout(computeLines, 50);
  }
  function clearLine(i) {
    const next = { ...answers }; delete next[i]; onChange(next);
    setTimeout(computeLines, 50);
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 }}>
          {rows.map((row, i) => (
            <button key={i} ref={el => leftRefs.current[i] = el} onClick={() => handleLeft(i)}
              style={{
                display: "flex", alignItems: "center", gap: 12, borderRadius: 14,
                padding: "14px 16px", textAlign: "left", fontSize: 17, cursor: "pointer",
                background: selected === i ? "#312e81" : answers[i] ? S.surfaceUp : S.surface,
                border: `2px solid ${selected === i ? "#818cf8" : answers[i] ? "#6366f1" : S.border}`,
                color: S.text, width: "100%",
              }}>
              <span style={{ fontWeight: 700, color: "#a5b4fc", width: 24, flexShrink: 0, fontSize: 18 }}>{row.label})</span>
              <span style={{ lineHeight: 1.4, flex: 1 }}>{row.text}</span>
              {answers[i] && (
                <span onClick={e => { e.stopPropagation(); clearLine(i); }}
                  style={{ marginLeft: 4, fontSize: 14, color: S.textDim, cursor: "pointer" }}>✕</span>
              )}
            </button>
          ))}
        </div>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10, overflow: "visible", pointerEvents: "none" }}>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
            </marker>
          </defs>
          {lines.map(l => <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2 - 2} y2={l.y2} stroke="#6366f1" strokeWidth="2" markerEnd="url(#arr)" />)}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          {cols.map((c, ci) => (
            <button key={ci} ref={el => rightRefs.current[ci] = el} onClick={() => handleRight(c)}
              style={{
                width: 52, height: 52, borderRadius: 14, fontSize: 20, fontWeight: 700,
                cursor: "pointer", background: selected !== null ? "#312e81" : Object.values(answers).includes(String(c)) ? S.surfaceUp : S.surface,
                border: `2px solid ${selected !== null ? "#818cf8" : Object.values(answers).includes(String(c)) ? "#6366f1" : S.border}`,
                color: S.text,
              }}>{c}</button>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div style={{ textAlign: "center", fontSize: 15, color: "#a5b4fc", marginTop: 10 }}>
          «{rows[selected]?.label})» — теперь нажми цифру справа
        </div>
      )}
    </div>
  );
}

export default function EgeTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const [tasks, setTasks] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedMulti, setSelectedMulti] = useState([]);
  const [matchAnswers, setMatchAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    let query = supabase.from("ege_tasks").select("*");
    if (subjectParam) query = query.eq("subject", subjectParam);
    const { data } = await query;
    const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, 20);
    setTasks(shuffled);
    setLoading(false);
  }

  function getOptions(task) {
    if (!task.options) return null;
    const parts = task.options.split("||").map(s => s.trim()).filter(s => s.length > 0);
    return parts.length >= 2 ? parts : null;
  }

  function getTaskType(task) {
    const answer = (task.answer || "").replace(/\s/g, "");
    const opts = getOptions(task);
    const plainText = task.question.replace(/<[^>]+>/g, " ");
    const isSequence = /последовательност/i.test(plainText);
    const hasAbvTable = task.question.includes("<table") && /[АБВ]/.test(plainText);
    if (/^\d{2,}$/.test(answer) && hasAbvTable) return "match";
    if (/^\d{2,6}$/.test(answer) && isSequence) return "sequence";
    if (/^\d{2,4}$/.test(answer) && opts) return "multiselect";
    if (opts) return "single";
    return "text";
  }

  function getMatchRows(task) {
    const text = task.question.replace(/<[^>]+>/g, " ");
    const freeMatches = text.match(/[АБВ]\)\s*[^\n]{5,}/g) || [];
    if (freeMatches.length >= 2) {
      return freeMatches.map((m, i) => ({ label: String.fromCharCode(1040 + i), text: m.replace(/^[АБВ]\)\s*/, "").trim().slice(0, 100) }));
    }
    const tdMatches = [];
    const tdRe = /<tr[^>]*>.*?<td[^>]*>(.*?)<\/td>/gis;
    let m;
    while ((m = tdRe.exec(task.question)) !== null) {
      const cell = m[1].replace(/<[^>]+>/g, "").trim();
      if (cell && cell.length > 2 && !/^\d+$/.test(cell)) tdMatches.push(cell);
    }
    if (tdMatches.length >= 2) return tdMatches.slice(0, 6).map((text, i) => ({ label: String.fromCharCode(1040 + i), text: text.slice(0, 100) }));
    return null;
  }

  function getMatchCols(task) {
    const answer = (task.answer || "").replace(/\s/g, "");
    const digits = answer.split("").map(Number).filter(n => !isNaN(n) && n > 0);
    const max = digits.length > 0 ? Math.max(...digits) : 3;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  function norm(a) { return (a || "").trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, "."); }

  function checkAnswer(override) {
    const task = tasks[current];
    const type = getTaskType(task);
    let given = "";
    if (type === "multiselect") given = [...selectedMulti].sort().join("");
    else if (type === "match") { const rows = getMatchRows(task) || []; given = rows.map((_, i) => matchAnswers[i] || "0").join(""); }
    else given = norm(override || userAnswer);
    const correctRaw = norm(task.answer.replace(/\s/g, ""));
    const variants = task.answer.split(/,\s*|\/\s*|\|\|/).map(v => norm(v)).filter(Boolean);
    const correct = variants.some(v => v === norm(given)) || norm(given) === correctRaw;
    setIsCorrect(correct); setAnswered(true); setUserAnswer(given);
    setResults(prev => [...prev, { task, userAnswer: given, correct }]);
  }

  function nextTask() {
    if (current + 1 >= tasks.length) { setFinished(true); return; }
    setCurrent(c => c + 1);
    setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({});
    setAnswered(false); setIsCorrect(null); setShowSolution(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setCurrent(0); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({});
    setResults([]); setFinished(false); setAnswered(false); setIsCorrect(null); setShowSolution(false);
    fetchTasks(); window.scrollTo({ top: 0 });
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: S.text, fontSize: 24 }}>Загружаем задания...</span>
      <EgeStyles />
    </div>
  );

  if (tasks.length === 0) return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <span style={{ color: S.text, fontSize: 24 }}>Нет заданий</span>
      <button onClick={() => navigate("/ege")} style={{ background: S.primary, color: "#fff", padding: "16px 32px", borderRadius: 16, fontSize: 18, cursor: "pointer", border: "none" }}>Назад</button>
      <EgeStyles />
    </div>
  );

  // ── РЕЗУЛЬТАТЫ ──────────────────────────────────────────────────────────────
  if (finished) {
    const score = results.filter(r => r.correct).length;
    const percent = Math.round((score / results.length) * 100);
    return (
      <div style={{ minHeight: "100vh", background: S.bg, color: S.text, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{percent >= 80 ? "🏆" : percent >= 50 ? "💪" : "📚"}</div>
            <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 8 }}>{score} / {results.length}</div>
            <div style={{ color: S.textMuted, fontSize: 20, marginBottom: 16 }}>{percent}% правильных</div>
            <div style={{ height: 12, background: S.surfaceUp, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", background: S.primary, borderRadius: 8, width: `${percent}%` }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <button onClick={restart} style={{ flex: 1, background: S.primary, color: "#fff", padding: 20, borderRadius: 16, fontSize: 20, fontWeight: 600, cursor: "pointer", border: "none" }}>Ещё раз</button>
            <button onClick={() => navigate("/ege")} style={{ flex: 1, background: S.surfaceUp, color: S.text, padding: 20, borderRadius: 16, fontSize: 20, fontWeight: 600, cursor: "pointer", border: "none" }}>К заданиям</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {results.map((r, i) => (
              <div key={i} style={{ borderRadius: 16, padding: 20, border: `1px solid ${r.correct ? S.greenBorder : S.redBorder}`, background: r.correct ? "rgba(22,101,52,0.3)" : "rgba(127,29,29,0.3)" }}>
                <div style={{ fontSize: 14, color: S.textMuted, marginBottom: 8 }}>{i + 1}. {r.task.topic}</div>
                <div className="ege-question" style={{ fontSize: 17, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: r.task.question }} />
                <div style={{ fontSize: 17 }}><span style={{ color: S.textMuted }}>Твой: </span><span style={{ color: r.correct ? S.greenText : S.redText }}>{r.userAnswer || "—"}</span></div>
                {!r.correct && <div style={{ fontSize: 17, marginTop: 6 }}><span style={{ color: S.textMuted }}>Правильно: </span><span style={{ color: S.greenText }}>{r.task.answer}</span></div>}
                {r.task.solution && <div style={{ marginTop: 12, fontSize: 15, color: S.textMuted, background: S.surfaceUp, borderRadius: 10, padding: "10px 14px" }}>💡 {r.task.solution}</div>}
              </div>
            ))}
          </div>
        </div>
        <EgeStyles />
      </div>
    );
  }

  // ── ТЕСТ ────────────────────────────────────────────────────────────────────
  const task = tasks[current];
  const type = getTaskType(task);
  const options = getOptions(task);
  const progress = (current / tasks.length) * 100;
  const LABELS = ["A", "B", "C", "D", "E", "F"];
  const canSubmit =
    type === "multiselect" ? selectedMulti.length > 0 :
    type === "match" ? (() => { const rows = getMatchRows(task); return rows ? rows.every((_, i) => matchAnswers[i]) : userAnswer.length >= 2; })() :
    type === "sequence" ? userAnswer.length >= 2 :
    userAnswer.trim().length > 0;

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text }}>

      {/* ── ХЕДЕР — фиксированный, всё в max-width контейнере по центру ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: S.bg, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => navigate("/ege")} style={{
              background: S.surfaceUp, border: "none", color: S.textMuted,
              width: 44, height: 44, borderRadius: 12, fontSize: 22, lineHeight: 1,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <span style={{ color: S.text, fontSize: 22, fontWeight: 600 }}>{current + 1} / {tasks.length}</span>
            <span style={{ color: S.primary, fontSize: 22, fontWeight: 700, minWidth: 56, textAlign: "right" }}>
              {results.filter(r => r.correct).length} ✓
            </span>
          </div>
          <div style={{ height: 8, background: S.surfaceUp, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", background: S.primary, borderRadius: 8, width: `${progress}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {/* ── КОНТЕНТ ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "104px 24px 80px" }}>

        {/* Карточка вопроса */}
        <div style={{ background: S.surface, borderRadius: 24, padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            {task.subject && <span style={{ fontSize: 15, background: "rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "6px 14px", borderRadius: 20, fontWeight: 500 }}>{task.subject}</span>}
            {task.topic && <span style={{ fontSize: 15, background: S.surfaceUp, color: S.textMuted, padding: "6px 14px", borderRadius: 20 }}>{task.topic}</span>}
            {task.difficulty && <span style={{ fontSize: 15, background: S.surfaceUp, color: "#fbbf24", padding: "6px 14px", borderRadius: 20 }}>★ {task.difficulty}</span>}
          </div>
          <div className="ege-question" style={{ color: S.text, fontSize: 20, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: task.question }} />
        </div>

        {/* ── ОТВЕТ ── */}
        {!answered && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {type === "multiselect" && (<>
              <div style={{ fontSize: 16, color: S.textMuted, paddingLeft: 4 }}>Выберите все правильные варианты</div>
              {options.map((opt, i) => {
                const n = String(i + 1);
                const sel = selectedMulti.includes(n);
                return (
                  <button key={i} className="ege-opt-btn"
                    onClick={() => setSelectedMulti(prev => sel ? prev.filter(x => x !== n) : [...prev, n])}
                    style={{
                      display: "flex", alignItems: "center", gap: 16, borderRadius: 18,
                      padding: "18px 22px", textAlign: "left", cursor: "pointer",
                      background: sel ? "rgba(99,102,241,0.2)" : S.surface,
                      border: `2px solid ${sel ? S.primary : S.border}`,
                      color: S.text, width: "100%",
                    }}>
                    <span style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 17, fontWeight: 700, flexShrink: 0, background: sel ? S.primary : S.surfaceUp, color: sel ? "#fff" : S.textMuted }}>{n}</span>
                    <span style={{ fontSize: 19 }}>{opt}</span>
                  </button>
                );
              })}
            </>)}

            {type === "single" && options.map((opt, i) => (
              <button key={i} className="ege-opt-btn" onClick={() => checkAnswer(opt)}
                style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 18, padding: "18px 22px", textAlign: "left", cursor: "pointer", background: S.surface, border: `2px solid ${S.border}`, color: S.text, width: "100%" }}>
                <span style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 17, fontWeight: 700, flexShrink: 0, background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>{LABELS[i]}</span>
                <span style={{ fontSize: 19 }}>{opt}</span>
              </button>
            ))}

            {type === "sequence" && (<>
              <div style={{ fontSize: 16, color: S.textMuted, paddingLeft: 4 }}>Введите последовательность цифр, например: 534621</div>
              <input type="text" value={userAnswer} autoFocus
                onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={e => e.key === "Enter" && canSubmit && checkAnswer()}
                placeholder="Введи цифры по порядку..."
                style={{ width: "100%", background: S.surface, border: `2px solid ${S.border}`, color: S.text, borderRadius: 18, padding: "22px 24px", fontSize: 36, letterSpacing: 8, textAlign: "center", outline: "none" }} />
            </>)}

            {type === "match" && (() => {
              const rows = getMatchRows(task); const cols = getMatchCols(task);
              return rows ? <MatchWidget rows={rows} cols={cols} answers={matchAnswers} onChange={setMatchAnswers} />
                : <input type="text" value={userAnswer} onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Введи цифры, напр: 332131"
                    style={{ width: "100%", background: S.surface, border: `2px solid ${S.border}`, color: S.text, borderRadius: 18, padding: "22px 24px", fontSize: 32, letterSpacing: 6, textAlign: "center", outline: "none" }} />;
            })()}

            {type === "text" && (
              <input type="text" value={userAnswer} autoFocus
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canSubmit && checkAnswer()}
                placeholder="Введи ответ..."
                style={{ width: "100%", background: S.surface, border: `2px solid ${S.border}`, color: S.text, borderRadius: 18, padding: "20px 24px", fontSize: 22, outline: "none" }} />
            )}

            {type !== "single" && (
              <button onClick={() => checkAnswer()} disabled={!canSubmit}
                style={{ width: "100%", background: canSubmit ? S.primary : S.surfaceUp, color: "#fff", padding: 22, borderRadius: 18, fontSize: 22, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", border: "none", opacity: canSubmit ? 1 : 0.5 }}>
                Проверить
              </button>
            )}

            <button className="ege-skip-btn" onClick={nextTask}
              style={{ width: "100%", background: "transparent", border: `2px solid ${S.border}`, color: S.textMuted, padding: 18, borderRadius: 18, fontSize: 19, cursor: "pointer" }}>
              Пропустить →
            </button>
          </div>
        )}

        {/* ── ПОСЛЕ ОТВЕТА ── */}
        {answered && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ borderRadius: 18, padding: "22px 24px", textAlign: "center", fontSize: 22, fontWeight: 700, background: isCorrect ? "rgba(22,101,52,0.3)" : "rgba(127,29,29,0.3)", border: `2px solid ${isCorrect ? S.greenBorder : S.redBorder}`, color: isCorrect ? S.greenText : S.redText }}>
              {isCorrect ? "✅ Правильно!" : <span>❌ Неверно. <span style={{ color: S.text }}>Ответ: {task.answer}</span></span>}
            </div>
            {task.solution && (<>
              <button onClick={() => setShowSolution(!showSolution)}
                style={{ color: "#a5b4fc", fontSize: 17, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                {showSolution ? "Скрыть решение ▲" : "Показать решение ▼"}
              </button>
              {showSolution && <div style={{ background: S.surfaceUp, borderRadius: 16, padding: "20px 22px", fontSize: 18, color: S.textMuted, lineHeight: 1.6 }}>{task.solution}</div>}
            </>)}
            <button onClick={nextTask}
              style={{ width: "100%", background: S.primary, color: "#fff", padding: 22, borderRadius: 18, fontSize: 22, fontWeight: 700, cursor: "pointer", border: "none" }}>
              {current + 1 >= tasks.length ? "Завершить тест" : "Следующее →"}
            </button>
          </div>
        )}
      </div>

      <EgeStyles />
    </div>
  );
}