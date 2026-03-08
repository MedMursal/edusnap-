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
      /* ── таблицы и картинки в вопросе ── */
      .ege-question table{width:100%;border-collapse:collapse;margin:12px 0;}
      .ege-question td,.ege-question th{border:1px solid #374151;padding:8px 12px;color:#e5e7eb;}
      .ege-question th{background:#1f2937;font-weight:600;}
      .ege-question tr:nth-child(even) td{background:#0f172a;}
      .ege-question img{max-width:100%;max-height:260px;width:auto;height:auto;border-radius:10px;margin:10px 0;display:block;}
      @media(max-width:600px){.ege-question img{max-height:180px;}}
      .ege-question p{margin-bottom:6px;}
      .ege-question ol,.ege-question ul{padding-left:20px;margin:6px 0;}
      .ege-question li{margin-bottom:4px;}

      /* ── базовые адаптивные размеры ── */
      .et-wrap { max-width: 1100px; margin: 0 auto; padding: 96px 48px 80px; }
      .et-header-inner { max-width: 1100px; margin: 0 auto; padding: 14px 48px; }
      .et-header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
      .et-back { background:#1f2937; border:none; color:#9ca3af; width:40px; height:40px; border-radius:10px; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
      .et-counter { color:#f9fafb; font-size:20px; font-weight:600; }
      .et-score { color:#6366f1; font-size:20px; font-weight:700; min-width:50px; text-align:right; }
      .et-progress { height:6px; background:#1f2937; border-radius:8px; overflow:hidden; }
      .et-progress-bar { height:100%; background:#6366f1; border-radius:8px; transition:width 0.3s; }

      .et-card { background:#111827; border-radius:20px; padding:24px; margin-bottom:16px; }
      .et-tags { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
      .et-tag { font-size:13px; padding:4px 12px; border-radius:20px; }
      .et-tag-subject { background:rgba(99,102,241,0.2); color:#a5b4fc; font-weight:500; }
      .et-tag-topic { background:#1f2937; color:#9ca3af; }
      .et-tag-diff { background:#1f2937; color:#fbbf24; }
      .et-question { color:#f9fafb; font-size:17px; line-height:1.65; }

      .et-hint { font-size:14px; color:#9ca3af; padding-left:2px; margin-bottom:4px; }
      .et-answers { display:flex; flex-direction:column; gap:10px; }

      .et-opt { display:flex; align-items:center; gap:14px; border-radius:14px; padding:14px 18px; cursor:pointer; border:2px solid #374151; background:#111827; color:#f9fafb; width:100%; text-align:left; transition:border-color 0.15s, background 0.15s; }
      .et-opt:hover { border-color:#6366f1; }
      .et-opt.selected { background:rgba(99,102,241,0.15); border-color:#6366f1; }
      .et-opt-num { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:15px; font-weight:700; flex-shrink:0; background:#1f2937; color:#9ca3af; transition:background 0.15s, color 0.15s; }
      .et-opt.selected .et-opt-num { background:#6366f1; color:#fff; }
      .et-opt-letter { background:rgba(99,102,241,0.2); color:#a5b4fc; }
      .et-opt-text { font-size:16px; }

      .et-input { width:100%; background:#111827; border:2px solid #374151; color:#f9fafb; border-radius:14px; outline:none; transition:border-color 0.15s; }
      .et-input:focus { border-color:#6366f1; }
      .et-input-seq { padding:16px 20px; font-size:28px; letter-spacing:6px; text-align:center; }
      .et-input-text { padding:14px 18px; font-size:17px; }

      .et-btn-check { width:100%; background:#6366f1; color:#fff; padding:16px; border-radius:14px; font-size:18px; font-weight:700; cursor:pointer; border:none; transition:background 0.15s; }
      .et-btn-check:hover:not(:disabled) { background:#4f46e5; }
      .et-btn-check:disabled { background:#1f2937; opacity:0.5; cursor:not-allowed; }
      .et-btn-skip { width:100%; background:transparent; border:2px solid #374151; color:#9ca3af; padding:13px; border-radius:14px; font-size:16px; cursor:pointer; transition:border-color 0.15s, color 0.15s; }
      .et-btn-skip:hover { border-color:#6b7280; color:#f9fafb; }
      .et-btn-next { width:100%; background:#6366f1; color:#fff; padding:16px; border-radius:14px; font-size:18px; font-weight:700; cursor:pointer; border:none; }
      .et-btn-next:hover { background:#4f46e5; }

      .et-result-box { border-radius:14px; padding:18px 20px; text-align:center; font-size:19px; font-weight:700; }
      .et-solution { background:#1f2937; border-radius:12px; padding:14px 18px; font-size:15px; color:#9ca3af; line-height:1.6; }
      .et-solution-btn { color:#a5b4fc; font-size:15px; background:none; border:none; cursor:pointer; padding:2px 0; }

      /* ── телефон (≤ 600px) ── */
      @media (max-width: 600px) {
        .et-wrap { padding: 80px 14px 80px; }
        .et-header-inner { padding: 10px 14px; }
        .et-back { width:36px; height:36px; font-size:18px; }
        .et-counter { font-size:16px; }
        .et-score { font-size:16px; min-width:40px; }
        .et-card { padding:16px; border-radius:16px; }
        .et-question { font-size:14px; line-height:1.55; }
        .ege-question table { font-size:13px; }
        .ege-question td,.ege-question th { padding:6px 8px; }
        .et-tag { font-size:11px; padding:3px 9px; }
        .et-opt { padding:11px 14px; gap:10px; border-radius:12px; }
        .et-opt-num { width:28px; height:28px; font-size:13px; }
        .et-opt-text { font-size:14px; }
        .et-input-seq { font-size:22px; letter-spacing:4px; padding:13px 16px; }
        .et-input-text { font-size:15px; padding:12px 14px; }
        .et-btn-check { font-size:16px; padding:14px; }
        .et-btn-skip { font-size:14px; padding:11px; }
        .et-btn-next { font-size:16px; padding:14px; }
        .et-result-box { font-size:16px; padding:14px 16px; }
      }

      /* ── планшет (601–900px) ── */
      @media (min-width: 601px) and (max-width: 900px) {
        .et-wrap { padding: 90px 28px 80px; }
        .et-header-inner { padding: 12px 28px; }
        .et-question { font-size:15px; }
        .et-opt-text { font-size:15px; }
      }
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
      const col = answers[i]; if (!col) return;
      const colIdx = parseInt(col) - 1;
      const lEl = leftRefs.current[i]; const rEl = rightRefs.current[colIdx];
      if (!lEl || !rEl) return;
      const lRect = lEl.getBoundingClientRect(); const rRect = rEl.getBoundingClientRect();
      newLines.push({ x1: lRect.right - cRect.left, y1: lRect.top + lRect.height / 2 - cRect.top, x2: rRect.left - cRect.left, y2: rRect.top + rRect.height / 2 - cRect.top, key: i });
    });
    setLines(newLines);
  }

  function handleLeft(i) { setSelected(selected === i ? null : i); }
  function handleRight(c) {
    if (selected === null) return;
    onChange({ ...answers, [selected]: String(c) }); setSelected(null); setTimeout(computeLines, 50);
  }
  function clearLine(i) { const n = { ...answers }; delete n[i]; onChange(n); setTimeout(computeLines, 50); }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
          {rows.map((row, i) => (
            <button key={i} ref={el => leftRefs.current[i] = el} onClick={() => handleLeft(i)}
              style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "12px 14px", textAlign: "left", fontSize: 15, cursor: "pointer", background: selected === i ? "#312e81" : answers[i] ? S.surfaceUp : S.surface, border: `2px solid ${selected === i ? "#818cf8" : answers[i] ? "#6366f1" : S.border}`, color: S.text, width: "100%" }}>
              <span style={{ fontWeight: 700, color: "#a5b4fc", width: 22, flexShrink: 0 }}>{row.label})</span>
              <span style={{ lineHeight: 1.4, flex: 1 }}>{row.text}</span>
              {answers[i] && <span onClick={e => { e.stopPropagation(); clearLine(i); }} style={{ fontSize: 13, color: S.textDim, cursor: "pointer" }}>✕</span>}
            </button>
          ))}
        </div>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10, overflow: "visible", pointerEvents: "none" }}>
          <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#6366f1" /></marker></defs>
          {lines.map(l => <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2 - 2} y2={l.y2} stroke="#6366f1" strokeWidth="2" markerEnd="url(#arr)" />)}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          {cols.map((c, ci) => (
            <button key={ci} ref={el => rightRefs.current[ci] = el} onClick={() => handleRight(c)}
              style={{ width: 44, height: 44, borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: "pointer", background: selected !== null ? "#312e81" : Object.values(answers).includes(String(c)) ? S.surfaceUp : S.surface, border: `2px solid ${selected !== null ? "#818cf8" : Object.values(answers).includes(String(c)) ? "#6366f1" : S.border}`, color: S.text }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {selected !== null && <div style={{ textAlign: "center", fontSize: 13, color: "#a5b4fc", marginTop: 8 }}>«{rows[selected]?.label})» — нажми цифру справа</div>}
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
    setTasks((data || []).sort(() => Math.random() - 0.5).slice(0, 20));
    setLoading(false);
  }

  function getOptions(task) {
    if (!task.options) return null;
    const parts = task.options.split("||").map(s => s.trim()).filter(Boolean);
    return parts.length >= 2 ? parts : null;
  }

  function getTaskType(task) {
    const answer = (task.answer || "").replace(/\s/g, "");
    const opts = getOptions(task);
    const plain = task.question.replace(/<[^>]+>/g, " ");
    const isSeq = /последовательност/i.test(plain);
    const hasAbv = task.question.includes("<table") && /[АБВ]/.test(plain);
    if (/^\d{2,}$/.test(answer) && hasAbv) return "match";
    if (/^\d{2,6}$/.test(answer) && isSeq) return "sequence";
    if (/^\d{2,4}$/.test(answer) && opts) return "multiselect";
    if (opts) return "single";
    return "text";
  }

  function getMatchRows(task) {
    const text = task.question.replace(/<[^>]+>/g, " ");
    const free = text.match(/[АБВ]\)\s*[^\n]{5,}/g) || [];
    if (free.length >= 2) return free.map((m, i) => ({ label: String.fromCharCode(1040 + i), text: m.replace(/^[АБВ]\)\s*/, "").trim().slice(0, 100) }));
    const tdMatches = []; const tdRe = /<tr[^>]*>.*?<td[^>]*>(.*?)<\/td>/gis; let m;
    while ((m = tdRe.exec(task.question)) !== null) { const c = m[1].replace(/<[^>]+>/g, "").trim(); if (c && c.length > 2 && !/^\d+$/.test(c)) tdMatches.push(c); }
    if (tdMatches.length >= 2) return tdMatches.slice(0, 6).map((t, i) => ({ label: String.fromCharCode(1040 + i), text: t.slice(0, 100) }));
    return null;
  }

  function getMatchCols(task) {
    const digits = (task.answer || "").replace(/\s/g, "").split("").map(Number).filter(n => !isNaN(n) && n > 0);
    const max = digits.length > 0 ? Math.max(...digits) : 3;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  function norm(a) { return (a || "").trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, "."); }

  function checkAnswer(override) {
    const task = tasks[current]; const type = getTaskType(task); let given = "";
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
    setCurrent(c => c + 1); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({});
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
      <span style={{ color: S.text, fontSize: 18 }}>Загружаем задания...</span>
      <EgeStyles />
    </div>
  );

  if (tasks.length === 0) return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <span style={{ color: S.text, fontSize: 20 }}>Нет заданий</span>
      <button onClick={() => navigate("/ege")} style={{ background: S.primary, color: "#fff", padding: "14px 28px", borderRadius: 14, fontSize: 16, cursor: "pointer", border: "none" }}>Назад</button>
      <EgeStyles />
    </div>
  );

  if (finished) {
    const score = results.filter(r => r.correct).length;
    const percent = Math.round((score / results.length) * 100);
    return (
      <div style={{ minHeight: "100vh", background: S.bg, color: S.text, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 56, marginBottom: 10 }}>{percent >= 80 ? "🏆" : percent >= 50 ? "💪" : "📚"}</div>
            <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 6 }}>{score} / {results.length}</div>
            <div style={{ color: S.textMuted, fontSize: 17, marginBottom: 14 }}>{percent}% правильных</div>
            <div style={{ height: 10, background: S.surfaceUp, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", background: S.primary, borderRadius: 8, width: `${percent}%` }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            <button onClick={restart} style={{ flex: 1, background: S.primary, color: "#fff", padding: 16, borderRadius: 14, fontSize: 17, fontWeight: 600, cursor: "pointer", border: "none" }}>Ещё раз</button>
            <button onClick={() => navigate("/ege")} style={{ flex: 1, background: S.surfaceUp, color: S.text, padding: 16, borderRadius: 14, fontSize: 17, fontWeight: 600, cursor: "pointer", border: "none" }}>К заданиям</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map((r, i) => (
              <div key={i} style={{ borderRadius: 14, padding: 18, border: `1px solid ${r.correct ? S.greenBorder : S.redBorder}`, background: r.correct ? "rgba(22,101,52,0.25)" : "rgba(127,29,29,0.25)" }}>
                <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 6 }}>{i + 1}. {r.task.topic}</div>
                <div className="ege-question" style={{ fontSize: 15, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: r.task.question }} />
                <div style={{ fontSize: 15 }}><span style={{ color: S.textMuted }}>Твой: </span><span style={{ color: r.correct ? S.greenText : S.redText }}>{r.userAnswer || "—"}</span></div>
                {!r.correct && <div style={{ fontSize: 15, marginTop: 4 }}><span style={{ color: S.textMuted }}>Правильно: </span><span style={{ color: S.greenText }}>{r.task.answer}</span></div>}
                {r.task.solution && <div style={{ marginTop: 10, fontSize: 14, color: S.textMuted, background: S.surfaceUp, borderRadius: 8, padding: "8px 12px" }}>💡 {r.task.solution}</div>}
              </div>
            ))}
          </div>
        </div>
        <EgeStyles />
      </div>
    );
  }

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

      {/* ХЕДЕР */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: S.bg, borderBottom: `1px solid ${S.border}` }}>
        <div className="et-header-inner">
          <div className="et-header-row">
            <button className="et-back" onClick={() => navigate("/ege")}>←</button>
            <span className="et-counter">{current + 1} / {tasks.length}</span>
            <span className="et-score">{results.filter(r => r.correct).length} ✓</span>
          </div>
          <div className="et-progress">
            <div className="et-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* КОНТЕНТ */}
      <div className="et-wrap">

        {/* Карточка вопроса */}
        <div className="et-card">
          <div className="et-tags">
            {task.subject && <span className="et-tag et-tag-subject">{task.subject}</span>}
            {task.topic && <span className="et-tag et-tag-topic">{task.topic}</span>}
            {task.difficulty && <span className="et-tag et-tag-diff">★ {task.difficulty}</span>}
          </div>
          <div className="ege-question et-question" dangerouslySetInnerHTML={{ __html: task.question }} />
        </div>

        {/* ОТВЕТЫ */}
        {!answered && (
          <div className="et-answers">

            {type === "multiselect" && (<>
              <div className="et-hint">Выберите все правильные варианты</div>
              {options.map((opt, i) => {
                const n = String(i + 1); const sel = selectedMulti.includes(n);
                return (
                  <button key={i} className={`et-opt${sel ? " selected" : ""}`}
                    onClick={() => setSelectedMulti(prev => sel ? prev.filter(x => x !== n) : [...prev, n])}>
                    <span className="et-opt-num">{n}</span>
                    <span className="et-opt-text">{opt}</span>
                  </button>
                );
              })}
            </>)}

            {type === "single" && options.map((opt, i) => (
              <button key={i} className="et-opt" onClick={() => checkAnswer(opt)}>
                <span className={`et-opt-num et-opt-letter`}>{LABELS[i]}</span>
                <span className="et-opt-text">{opt}</span>
              </button>
            ))}

            {type === "sequence" && (<>
              <div className="et-hint">Введите последовательность цифр, например: 534621</div>
              <input type="text" value={userAnswer} autoFocus className="et-input et-input-seq"
                onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={e => e.key === "Enter" && canSubmit && checkAnswer()}
                placeholder="Введи цифры..." />
            </>)}

            {type === "match" && (() => {
              const rows = getMatchRows(task); const cols = getMatchCols(task);
              return rows ? <MatchWidget rows={rows} cols={cols} answers={matchAnswers} onChange={setMatchAnswers} />
                : <input type="text" value={userAnswer} className="et-input et-input-seq"
                    onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Введи цифры, напр: 332131" />;
            })()}

            {type === "text" && (
              <input type="text" value={userAnswer} autoFocus className="et-input et-input-text"
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canSubmit && checkAnswer()}
                placeholder="Введи ответ..." />
            )}

            {type !== "single" && (
              <button className="et-btn-check" onClick={() => checkAnswer()} disabled={!canSubmit}>
                Проверить
              </button>
            )}

            <button className="et-btn-skip" onClick={nextTask}>Пропустить →</button>
          </div>
        )}

        {/* ПОСЛЕ ОТВЕТА */}
        {answered && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="et-result-box" style={{ background: isCorrect ? "rgba(22,101,52,0.3)" : "rgba(127,29,29,0.3)", border: `2px solid ${isCorrect ? S.greenBorder : S.redBorder}`, color: isCorrect ? S.greenText : S.redText }}>
              {isCorrect ? "✅ Правильно!" : <span>❌ Неверно. <span style={{ color: S.text }}>Ответ: {task.answer}</span></span>}
            </div>
            {task.solution && (<>
              <button className="et-solution-btn" onClick={() => setShowSolution(!showSolution)}>
                {showSolution ? "Скрыть решение ▲" : "Показать решение ▼"}
              </button>
              {showSolution && <div className="et-solution">{task.solution}</div>}
            </>)}
            <button className="et-btn-next" onClick={nextTask}>
              {current + 1 >= tasks.length ? "Завершить тест" : "Следующее →"}
            </button>
          </div>
        )}
      </div>

      <EgeStyles />
    </div>
  );
}