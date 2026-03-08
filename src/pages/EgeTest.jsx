import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";

function EgeStyles({ t }) {
  return (
    <style>{`
      .ege-question table{width:100%;border-collapse:collapse;margin:8px 0;}
      .ege-question td,.ege-question th{border:1px solid ${t.border};padding:5px 8px;color:${t.text};font-size:12px;}
      .ege-question th{background:${t.surfaceUp};font-weight:600;}
      .ege-question tr:nth-child(even) td{background:${t.bg};}
      .ege-question img{max-width:100%;max-height:170px;width:auto;height:auto;border-radius:8px;margin:8px 0;display:block;}
      .ege-question p{margin-bottom:4px;}
      .ege-question ol,.ege-question ul{padding-left:16px;margin:4px 0;}
      .ege-question li{margin-bottom:3px;}

      .et-wrap{max-width:1100px;margin:0 auto;padding:76px 48px 80px;}
      .et-header-inner{max-width:1100px;margin:0 auto;padding:10px 48px;}
      .et-header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
      .et-back{background:${t.surfaceUp};border:none;color:${t.textMuted};width:36px;height:36px;border-radius:999px;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
      .et-counter{color:${t.text};font-size:14px;font-weight:600;}
      .et-score{color:${t.primary};font-size:14px;font-weight:700;min-width:40px;text-align:right;}
      .et-progress{height:5px;background:${t.surfaceUp};border-radius:999px;overflow:hidden;}
      .et-progress-bar{height:100%;background:${t.primary};border-radius:999px;transition:width 0.3s;}

      .et-card{background:${t.surface};border-radius:20px;padding:16px;margin-bottom:12px;border:1px solid ${t.border};}
      .et-tags{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;}
      .et-tag{font-size:11px;padding:3px 9px;border-radius:999px;}
      .et-tag-subject{background:${t.secondary};color:${t.primary};font-weight:600;}
      .et-tag-topic{background:${t.surfaceUp};color:${t.textMuted};}
      .et-tag-diff{background:${t.surfaceUp};color:${t.accent};}
      .et-question{color:${t.text};font-size:13px;line-height:1.6;}

      .et-hint{font-size:11px;color:${t.textMuted};padding-left:2px;margin-bottom:4px;}
      .et-answers{display:flex;flex-direction:column;gap:7px;}

      .et-opt{display:flex;align-items:center;gap:10px;border-radius:999px;padding:10px 16px;cursor:pointer;border:2px solid ${t.border};background:${t.surface};color:${t.text};width:100%;text-align:left;transition:border-color 0.15s,background 0.15s;}
      .et-opt:hover{border-color:${t.primary};}
      .et-opt.selected{background:${t.secondary};border-color:${t.primary};}
      .et-opt-num{width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:12px;font-weight:700;flex-shrink:0;background:${t.surfaceUp};color:${t.textMuted};transition:background 0.15s,color 0.15s;}
      .et-opt.selected .et-opt-num{background:${t.primary};color:#fff;}
      .et-opt-letter{background:${t.secondary};color:${t.primary};}
      .et-opt-text{font-size:13px;}

      .et-input{width:100%;background:${t.surface};border:2px solid ${t.border};color:${t.text};border-radius:999px;outline:none;transition:border-color 0.15s;}
      .et-input:focus{border-color:${t.primary};}
      .et-input-seq{padding:11px 14px;font-size:22px;letter-spacing:5px;text-align:center;}
      .et-input-text{padding:10px 16px;font-size:13px;}

      .et-btn-check{width:100%;background:linear-gradient(135deg,${t.primary},${t.primaryBright});color:#fff;padding:14px;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:opacity 0.15s;box-shadow:0 4px 16px ${t.primaryGlow};}
      .et-btn-check:hover:not(:disabled){opacity:0.9;}
      .et-btn-check:disabled{background:${t.surfaceUp};opacity:0.5;cursor:not-allowed;box-shadow:none;}
      .et-btn-skip{width:100%;background:transparent;border:2px solid ${t.border};color:${t.textMuted};padding:11px;border-radius:999px;font-size:13px;cursor:pointer;transition:border-color 0.15s,color 0.15s;}
      .et-btn-skip:hover{border-color:${t.primary};color:${t.text};}
      .et-btn-next{width:100%;background:linear-gradient(135deg,${t.primary},${t.primaryBright});color:#fff;padding:14px;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer;border:none;box-shadow:0 4px 16px ${t.primaryGlow};}

      .et-result-box{border-radius:20px;padding:13px 16px;text-align:center;font-size:14px;font-weight:700;}
      .et-solution{background:${t.surfaceUp};border-radius:16px;padding:10px 13px;font-size:12px;color:${t.textMuted};line-height:1.6;}
      .et-solution-btn{color:${t.primary};font-size:12px;background:none;border:none;cursor:pointer;padding:2px 0;}

      @media(max-width:600px){
        .et-wrap{padding:66px 12px 80px;}
        .et-header-inner{padding:8px 12px;}
        .et-card{padding:12px;}
        .et-question{font-size:12px;}
        .ege-question td,.ege-question th{padding:4px 6px;font-size:11px;}
        .ege-question img{max-height:120px;}
        .et-opt{padding:8px 12px;}
        .et-opt-text{font-size:12px;}
        .et-input-seq{font-size:18px;letter-spacing:4px;padding:10px 12px;}
        .et-btn-check,.et-btn-next{font-size:13px;padding:12px;}
        .et-btn-skip{font-size:12px;padding:9px;}
      }
    `}</style>
  );
}

function MatchWidget({ rows, cols, answers, onChange, t }) {
  const [selected, setSelected] = useState(null);
  const leftRefs = useRef([]); const rightRefs = useRef([]);
  const containerRef = useRef(null); const [lines, setLines] = useState([]);

  useEffect(() => { setTimeout(computeLines, 50); }, [answers]);

  function computeLines() {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect(); const nl = [];
    rows.forEach((_, i) => {
      const col = answers[i]; if (!col) return;
      const lEl = leftRefs.current[i]; const rEl = rightRefs.current[parseInt(col) - 1];
      if (!lEl || !rEl) return;
      const lr = lEl.getBoundingClientRect(); const rr = rEl.getBoundingClientRect();
      nl.push({ x1: lr.right - cRect.left, y1: lr.top + lr.height / 2 - cRect.top, x2: rr.left - cRect.left, y2: rr.top + rr.height / 2 - cRect.top, key: i });
    });
    setLines(nl);
  }

  function handleLeft(i) { setSelected(selected === i ? null : i); }
  function handleRight(c) {
    if (selected === null) return;
    onChange({ ...answers, [selected]: String(c) }); setSelected(null); setTimeout(computeLines, 50);
  }
  function clearLine(i) { const n = { ...answers }; delete n[i]; onChange(n); setTimeout(computeLines, 50); }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
          {rows.map((row, i) => (
            <button key={i} ref={el => leftRefs.current[i] = el} onClick={() => handleLeft(i)}
              style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 14px", fontSize: 12, cursor: "pointer", background: selected === i ? t.secondary : answers[i] ? t.surfaceUp : t.surface, border: `2px solid ${selected === i ? t.primary : answers[i] ? t.primary : t.border}`, color: t.text, width: "100%", textAlign: "left" }}>
              <span style={{ fontWeight: 700, color: t.primary, width: 18, flexShrink: 0 }}>{row.label})</span>
              <span style={{ lineHeight: 1.4, flex: 1 }}>{row.text}</span>
              {answers[i] && <span onClick={e => { e.stopPropagation(); clearLine(i); }} style={{ fontSize: 11, color: t.textDim, cursor: "pointer" }}>✕</span>}
            </button>
          ))}
        </div>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10, overflow: "visible", pointerEvents: "none" }}>
          <defs><marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill={t.primary} /></marker></defs>
          {lines.map(l => <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2 - 2} y2={l.y2} stroke={t.primary} strokeWidth="1.5" markerEnd="url(#arr)" />)}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {cols.map((c, ci) => (
            <button key={ci} ref={el => rightRefs.current[ci] = el} onClick={() => handleRight(c)}
              style={{ width: 36, height: 36, borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: "pointer", background: selected !== null ? t.secondary : Object.values(answers).includes(String(c)) ? t.surfaceUp : t.surface, border: `2px solid ${selected !== null ? t.primary : Object.values(answers).includes(String(c)) ? t.primary : t.border}`, color: t.text }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {selected !== null && <div style={{ textAlign: "center", fontSize: 11, color: t.primary, marginTop: 6 }}>«{rows[selected]?.label})» — нажми цифру справа</div>}
    </div>
  );
}

export default function EgeTest({ t }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tgUser, dbUser } = useUser();
  const subjectParam = searchParams.get("subject");
  const topicParam = searchParams.get("topic");
  const subtopicParam = searchParams.get("subtopic");
  const lineParam = searchParams.get("line");
  const errorIdsParam = searchParams.get("error_ids"); // для теста по ошибкам
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
    let q = supabase.from("ege_tasks").select("*");

    if (errorIdsParam) {
      const ids = errorIdsParam.split(",");
      q = q.in("source_id", ids);
    } else {
      if (subjectParam) q = q.eq("subject", subjectParam);
      if (topicParam) q = q.eq("topic", topicParam);
      if (subtopicParam) q = q.eq("subtopic", subtopicParam);
      if (lineParam) q = q.eq("line_number", parseInt(lineParam));
    }

    const { data } = await q;
    setTasks((data || []).sort(() => Math.random() - 0.5).slice(0, 10));
    setLoading(false);
  }

  async function saveAnswer(task, given, correct) {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    await supabase.from("user_answers").insert({
      user_id: userId,
      task_id: task.source_id || String(task.id),
      is_correct: correct,
      user_answer: String(given),
      correct_answer: task.answer,
      topic: task.topic,
      subtopic: task.subtopic,
      line_number: task.line_number,
      subject: task.subject,
    });
  }

  function getOptions(task) {
    if (!task.options) return null;
    const p = task.options.split("||").map(s => s.trim()).filter(Boolean);
    return p.length >= 2 ? p : null;
  }

  function getTaskType(task) {
    const a = (task.answer || "").replace(/\s/g, "");
    const opts = getOptions(task);
    const plain = task.question.replace(/<[^>]+>/g, " ");
    const isTableFill = /цифры в ответе могут повторяться/i.test(plain) || /запишите.*таблиц/i.test(plain) || /запишите выбранные цифры/i.test(plain);
    if (/^\d{2,}$/.test(a) && task.question.includes("<table") && /[АБВ]/.test(plain)) return "match";
    if (/^\d{2,6}$/.test(a) && /последовательност/i.test(plain)) return "sequence";
    if (/^\d{2,4}$/.test(a) && isTableFill) return "sequence";
    if (/^\d{2,4}$/.test(a) && opts) {
      const digits = a.split("");
      const hasRepeats = digits.length !== new Set(digits).size;
      if (hasRepeats) return "sequence";
      return "multiselect";
    }
    if (opts) return "single";
    return "text";
  }

  function getMatchRows(task) {
    const text = task.question.replace(/<[^>]+>/g, " ");
    const free = text.match(/[А-Е]\)\s*[^\n]{3,}/g) || [];
    if (free.length >= 2) return free.map(m => ({ label: m[0], text: m.replace(/^[А-Е]\)\s*/, "").trim().slice(0, 120) }));
    const rows = [];
    const trRe = /<tr[^>]*>(.*?)<\/tr>/gis; let trM;
    while ((trM = trRe.exec(task.question)) !== null) {
      const rowHtml = trM[1];
      if (/<th/i.test(rowHtml)) continue;
      const tdRe2 = /<td[^>]*>(.*?)<\/td>/gis; const cells = []; let tdM2;
      while ((tdM2 = tdRe2.exec(rowHtml)) !== null) cells.push(tdM2[1].replace(/<[^>]+>/g, "").trim());
      if (cells[0] && cells[0].length > 1) rows.push(cells[0]);
    }
    if (rows.length >= 2) return rows.map((tx, i) => ({ label: String.fromCharCode(1040 + i), text: tx.replace(/^[А-Е]\)\s*/, "").trim().slice(0, 120) }));
    return null;
  }

  function getMatchCols(task) {
    const d = (task.answer || "").replace(/\s/g, "").split("").map(Number).filter(n => !isNaN(n) && n > 0);
    return Array.from({ length: d.length > 0 ? Math.max(...d) : 3 }, (_, i) => i + 1);
  }

  function norm(a) {
    return (a || "").trim().toLowerCase().replace(/[\s,.\-]/g, "");
  }

  function checkAnswer(override) {
    const task = tasks[current];
    const type = getTaskType(task);
    let given = "";

    if (type === "multiselect") {
      given = [...selectedMulti].sort().join("");
    } else if (type === "match") {
      const rows = getMatchRows(task);
      if (rows) {
        given = rows.map((_, i) => matchAnswers[i] || "0").join("");
      } else {
        given = norm(userAnswer);
      }
    } else {
      given = norm(override || userAnswer);
    }

    const rawAnswer = task.answer || "";
    const variants = rawAnswer.split(/\/|\|\|/).map(v => norm(v)).filter(Boolean);
    const correct =
      variants.some(v => v === norm(given)) ||
      norm(given) === norm(rawAnswer) ||
      norm(rawAnswer.replace(/,/g, "")) === norm(given) ||
      norm(rawAnswer.replace(/\s/g, "")) === norm(given);

    setIsCorrect(correct);
    setAnswered(true);
    setUserAnswer(given);
    setResults(prev => [...prev, { task, userAnswer: given, correct }]);
    saveAnswer(task, given, correct);
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
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: t.text, fontSize: 16 }}>Загружаем задания...</span><EgeStyles t={t} />
    </div>
  );

  if (tasks.length === 0) return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <span style={{ color: t.text, fontSize: 18 }}>Нет заданий</span>
      <button onClick={() => navigate("/ege")} style={{ background: t.primary, color: "#fff", padding: "12px 24px", borderRadius: 999, fontSize: 14, cursor: "pointer", border: "none" }}>Назад</button>
      <EgeStyles t={t} />
    </div>
  );

  if (finished) {
    const score = results.filter(r => r.correct).length;
    const pct = Math.round((score / results.length) * 100);
    return (
      <div style={{ minHeight: "100vh", background: t.bg, color: t.text, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{score} / {results.length}</div>
            <div style={{ color: t.textMuted, fontSize: 15, marginBottom: 12 }}>{pct}% правильных</div>
            <div style={{ height: 8, background: t.surfaceUp, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${t.primary}, ${t.primaryBright})`, borderRadius: 999, width: `${pct}%` }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button onClick={restart} style={{ flex: 1, background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, color: "#fff", padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: `0 4px 16px ${t.primaryGlow}` }}>Ещё раз</button>
            <button onClick={() => navigate("/ege")} style={{ flex: 1, background: t.surface, color: t.text, padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: "pointer", border: `1px solid ${t.border}` }}>К заданиям</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((r, i) => (
              <div key={i} style={{ borderRadius: 20, padding: 16, border: `1px solid ${r.correct ? t.success : t.error}`, background: r.correct ? `${t.success}18` : `${t.error}18` }}>
                <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 5 }}>{i + 1}. {r.task.topic}</div>
                <div className="ege-question" style={{ fontSize: 13, marginBottom: 7 }} dangerouslySetInnerHTML={{ __html: r.task.question }} />
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: t.textMuted }}>Твой: </span>
                  <span style={{ color: r.correct ? t.success : t.error }}>{r.userAnswer || "—"}</span>
                </div>
                {!r.correct && <div style={{ fontSize: 13, marginTop: 3 }}><span style={{ color: t.textMuted }}>Правильно: </span><span style={{ color: t.success }}>{r.task.answer}</span></div>}
                {r.task.solution && <div style={{ marginTop: 8, fontSize: 12, color: t.textMuted, background: t.surfaceUp, borderRadius: 12, padding: "7px 10px" }}>💡 {r.task.solution}</div>}
              </div>
            ))}
          </div>
        </div>
        <EgeStyles t={t} />
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
    type === "match" ? (() => { const r = getMatchRows(task); return r ? r.every((_, i) => matchAnswers[i]) : userAnswer.length >= 2; })() :
    type === "sequence" ? userAnswer.length >= 2 : userAnswer.trim().length > 0;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: t.surface, borderBottom: `1px solid ${t.border}` }}>
        <div className="et-header-inner">
          <div className="et-header-row">
            <button className="et-back" onClick={() => navigate("/ege")}>←</button>
            <span className="et-counter">{current + 1} / {tasks.length}</span>
            <span className="et-score">{results.filter(r => r.correct).length} ✓</span>
          </div>
          <div className="et-progress"><div className="et-progress-bar" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="et-wrap">
        <div className="et-card">
          <div className="et-tags">
            {task.subject && <span className="et-tag et-tag-subject">{task.subject}</span>}
            {task.topic && <span className="et-tag et-tag-topic">{task.topic}</span>}
            {task.subtopic && <span className="et-tag et-tag-topic">{task.subtopic}</span>}
            {task.difficulty && <span className="et-tag et-tag-diff">★ {task.difficulty}</span>}
          </div>
          <div className="ege-question et-question" dangerouslySetInnerHTML={{ __html: task.question }} />
        </div>

        {!answered && (
          <div className="et-answers">
            {type === "multiselect" && (<>
              <div className="et-hint">Выберите все правильные варианты</div>
              {options.map((opt, i) => {
                const n = String(i + 1); const sel = selectedMulti.includes(n);
                return (
                  <button key={i} className={`et-opt${sel ? " selected" : ""}`}
                    onClick={() => setSelectedMulti(p => sel ? p.filter(x => x !== n) : [...p, n])}>
                    <span className="et-opt-num">{n}</span>
                    <span className="et-opt-text">{opt}</span>
                  </button>
                );
              })}
            </>)}

            {type === "single" && options.map((opt, i) => (
              <button key={i} className="et-opt" onClick={() => checkAnswer(opt)}>
                <span className="et-opt-num et-opt-letter">{LABELS[i]}</span>
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
              return rows
                ? <MatchWidget rows={rows} cols={cols} answers={matchAnswers} onChange={setMatchAnswers} t={t} />
                : <input type="text" value={userAnswer} className="et-input et-input-seq"
                    onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={e => e.key === "Enter" && canSubmit && checkAnswer()}
                    placeholder="Введи цифры..." />;
            })()}

            {type === "text" && (
              <input type="text" value={userAnswer} autoFocus className="et-input et-input-text"
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canSubmit && checkAnswer()}
                placeholder="Введи ответ..." />
            )}

            {type !== "single" && (
              <button className="et-btn-check" onClick={() => checkAnswer()} disabled={!canSubmit}>Проверить</button>
            )}
            <button className="et-btn-skip" onClick={nextTask}>Пропустить →</button>
          </div>
        )}

        {answered && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="et-result-box" style={{
              background: isCorrect ? `${t.success}25` : `${t.error}25`,
              border: `2px solid ${isCorrect ? t.success : t.error}`,
              color: isCorrect ? t.success : t.error,
            }}>
              {isCorrect ? "✅ Правильно!" : <span>❌ Неверно. <span style={{ color: t.text }}>Ответ: {task.answer}</span></span>}
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

      <EgeStyles t={t} />
    </div>
  );
}