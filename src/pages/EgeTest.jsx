import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";

function EgeStyles() {
  return (
    <style>{`
      .ege-question table{width:100%;border-collapse:collapse;margin:10px 0;font-size:14px;}
      .ege-question td,.ege-question th{border:1px solid #374151;padding:7px 10px;color:#e5e7eb;}
      .ege-question th{background:#1f2937;font-weight:600;}
      .ege-question tr:nth-child(even) td{background:#111827;}
      .ege-question img{max-width:100%;height:auto;border-radius:8px;margin:8px 0;display:block;}
      .ege-question p{margin-bottom:6px;}
      .ege-question ol,.ege-question ul{padding-left:20px;margin:6px 0;}
      .ege-question li{margin-bottom:3px;}
    `}</style>
  );
}

// ── СООТВЕТСТВИЕ СО СТРЕЛКАМИ ─────────────────────────────────────────────────
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
    const next = { ...answers };
    delete next[i];
    onChange(next);
    setTimeout(computeLines, 50);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2 items-start">
        {/* Левая колонка */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {rows.map((row, i) => (
            <button key={i} ref={el => leftRefs.current[i] = el}
              onClick={() => handleLeft(i)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition border ${
                selected === i ? "bg-indigo-700 border-indigo-400 text-white"
                : answers[i] ? "bg-gray-800 border-indigo-600/60 text-white"
                : "bg-gray-900 border-gray-700 text-gray-200 hover:border-gray-500"}`}>
              <span className="font-bold text-indigo-300 shrink-0 w-5">{row.label})</span>
              <span className="leading-snug flex-1">{row.text}</span>
              {answers[i] && (
                <span onClick={e=>{e.stopPropagation();clearLine(i);}}
                  className="ml-1 text-xs text-gray-500 hover:text-red-400 shrink-0">✕</span>
              )}
            </button>
          ))}
        </div>

        {/* SVG стрелки — поверх всего */}
        <svg className="absolute inset-0 pointer-events-none"
          style={{width:"100%",height:"100%",zIndex:10,overflow:"visible"}}>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/>
            </marker>
          </defs>
          {lines.map(l=>(
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2-2} y2={l.y2}
              stroke="#6366f1" strokeWidth="2" markerEnd="url(#arr)"/>
          ))}
        </svg>

        {/* Правая колонка — цифры */}
        <div className="flex flex-col gap-2 shrink-0">
          {cols.map((c, ci) => (
            <button key={ci} ref={el => rightRefs.current[ci] = el}
              onClick={() => handleRight(c)}
              className={`w-11 h-11 rounded-xl text-base font-bold transition border ${
                selected !== null ? "bg-indigo-900 border-indigo-400 text-white ring-2 ring-indigo-500/50"
                : Object.values(answers).includes(String(c)) ? "bg-gray-800 border-indigo-600/50 text-indigo-300"
                : "bg-gray-900 border-gray-700 text-gray-300 hover:border-indigo-500"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div className="text-center text-xs text-indigo-300 mt-2 animate-pulse">
          «{rows[selected]?.label})» — теперь нажми цифру справа
        </div>
      )}
    </div>
  );
}

// ── ПОСЛЕДОВАТЕЛЬНОСТЬ ────────────────────────────────────────────────────────
function SequenceWidget({ items, value, onChange }) {
  const sequence = value ? value.split("") : [];

  function addNum(n) {
    if (sequence.includes(n)) return;
    onChange([...sequence, n].join(""));
  }
  function reset() { onChange(""); }

  return (
    <div className="flex flex-col gap-3">
      {/* Собранная последовательность */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 min-h-14 flex items-center gap-2 flex-wrap">
        {sequence.length === 0
          ? <span className="text-gray-500 text-sm">Нажимай пункты по порядку...</span>
          : <>
              {sequence.map((n, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-600 text-sm">→</span>}
                  <span className="bg-indigo-600 text-white rounded-lg px-3 py-1.5 font-bold text-sm">{n}</span>
                </div>
              ))}
              <button onClick={reset} className="ml-auto text-xs text-gray-500 hover:text-red-400">сброс ✕</button>
            </>
        }
      </div>
      {/* Пункты */}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const n = String(i + 1);
          const pos = sequence.indexOf(n);
          const used = pos !== -1;
          return (
            <button key={i} onClick={() => used ? onChange(sequence.filter(x=>x!==n).join("")) : addNum(n)}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition border ${
                used ? "bg-indigo-900/40 border-indigo-600/60 text-indigo-200"
                : "bg-gray-900 border-gray-700 text-gray-200 hover:border-indigo-500"}`}>
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                used ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                {used ? pos+1 : n}
              </span>
              <span>{item}</span>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 text-center">Нажми пункты в правильном порядке</div>
    </div>
  );
}

// ── ГЛАВНЫЙ КОМПОНЕНТ ─────────────────────────────────────────────────────────
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

  // Вытаскивает пункты последовательности из HTML вопроса
  function getSequenceItems(task) {
    // Сначала пробуем options
    const opts = getOptions(task);
    if (opts) return opts;
    // Парсим из текста вопроса: "1) текст\n2) текст"
    const text = task.question.replace(/<[^>]+>/g, "\n");
    const matches = text.match(/\d\)\s*[^\n\d]{3,80}/g) || [];
    return matches.map(m => m.replace(/^\d\)\s*/, "").trim()).filter(s => s.length > 2);
  }

  function getTaskType(task) {
    const answer = (task.answer || "").replace(/\s/g, "");
    const opts = getOptions(task);
    const plainText = task.question.replace(/<[^>]+>/g, " ");
    // Слово "последовательность" в тексте вопроса
    const isSequence = /последовательност/i.test(plainText);
    // Соответствие: 5+ цифр + таблица
    if (/^\d{5,}$/.test(answer) && task.question.includes("<table")) return "match";
    // Последовательность: цифры + слово "последовательность" в вопросе
    if (/^\d{2,6}$/.test(answer) && isSequence) return "sequence";
    // Мультивыбор: 2-4 цифры + варианты
    if (/^\d{2,4}$/.test(answer) && opts) return "multiselect";
    if (opts) return "single";
    return "text";
  }

  function getMatchRows(task) {
    const text = task.question.replace(/<[^>]+>/g, " ");
    const matches = text.match(/[А-Е]\)\s*[^\n]{5,}/g) || [];
    return matches.length >= 2
      ? matches.map((m, i) => ({ label: String.fromCharCode(1040 + i), text: m.replace(/^[А-Е]\)\s*/, "").trim().slice(0, 80) }))
      : null;
  }

  function getMatchCols(task) {
    const answer = (task.answer || "").replace(/\s/g, "");
    const digits = answer.split("").map(Number).filter(n => !isNaN(n) && n > 0);
    const max = digits.length > 0 ? Math.max(...digits) : 3;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // Нормализация: запятая↔точка, пробелы, регистр
  function norm(a) {
    return (a || "").trim().toLowerCase()
      .replace(/\s+/g, "")
      .replace(/,/g, ".");  // 0,12 === 0.12
  }

  function checkAnswer(override) {
    const task = tasks[current];
    const type = getTaskType(task);
    let given = "";

    if (type === "multiselect") given = [...selectedMulti].sort().join("");
    else if (type === "match") {
      const rows = getMatchRows(task) || [];
      given = rows.map((_, i) => matchAnswers[i] || "0").join("");
    } else given = norm(override || userAnswer);

    const correctRaw = norm(task.answer.replace(/\s/g, ""));
    // Принимаем любой вариант через запятую/слэш, и нормализуем точку/запятую
    const variants = task.answer.split(/,\s*|\/\s*|\|\|/)
      .map(v => norm(v))
      .filter(Boolean);
    const correct = variants.some(v => v === norm(given)) || norm(given) === correctRaw;

    setIsCorrect(correct);
    setAnswered(true);
    setUserAnswer(given);
    setResults(prev => [...prev, { task, userAnswer: given, correct }]);
  }

  function nextTask() {
    if (current + 1 >= tasks.length) { setFinished(true); return; }
    setCurrent(c => c + 1);
    setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({});
    setAnswered(false); setIsCorrect(null); setShowSolution(false);
    // Скролл вверх
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setCurrent(0); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({});
    setResults([]); setFinished(false); setAnswered(false);
    setIsCorrect(null); setShowSolution(false);
    fetchTasks();
    window.scrollTo({ top: 0 });
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Загружаем задания...</div>
    </div>
  );

  if (tasks.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6">
      <div className="text-white text-xl">Нет заданий</div>
      <button onClick={() => navigate("/ege")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl">Назад</button>
    </div>
  );

  // ── РЕЗУЛЬТАТЫ ──────────────────────────────────────────────────────────────
  if (finished) {
    const score = results.filter(r => r.correct).length;
    const percent = Math.round((score / results.length) * 100);
    return (
      <div className="min-h-screen bg-gray-950 text-white pb-24 px-4">
        <div className="pt-10 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{percent >= 80 ? "🏆" : percent >= 50 ? "💪" : "📚"}</div>
            <h1 className="text-3xl font-bold mb-1">{score} / {results.length}</h1>
            <div className="text-gray-400">{percent}% правильных</div>
            <div className="mt-3 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <div className="flex gap-3 mb-6">
            <button onClick={restart} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-semibold">Ещё раз</button>
            <button onClick={() => navigate("/ege")} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-semibold">К заданиям</button>
          </div>
          <div className="flex flex-col gap-4">
            {results.map((r, i) => (
              <div key={i} className={`rounded-2xl p-4 border ${r.correct ? "bg-green-900/30 border-green-700" : "bg-red-900/30 border-red-700"}`}>
                <div className="text-xs text-gray-400 mb-2">{i+1}. {r.task.topic}</div>
                <div className="text-sm mb-2 ege-question" dangerouslySetInnerHTML={{ __html: r.task.question }} />
                <div className="text-sm"><span className="text-gray-400">Твой: </span><span className={r.correct ? "text-green-400" : "text-red-400"}>{r.userAnswer||"—"}</span></div>
                {!r.correct && <div className="text-sm mt-1"><span className="text-gray-400">Правильно: </span><span className="text-green-400">{r.task.answer}</span></div>}
                {r.task.solution && <div className="mt-2 text-xs text-gray-400 bg-gray-800 rounded-lg p-2">💡 {r.task.solution}</div>}
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
  const seqItems = type === "sequence" ? getSequenceItems(task) : [];
  const progress = (current / tasks.length) * 100;
  const LABELS = ["A","B","C","D","E","F"];

  const canSubmit =
    type === "multiselect" ? selectedMulti.length > 0 :
    type === "match" ? (() => { const rows = getMatchRows(task); return rows ? rows.every((_, i) => matchAnswers[i]) : userAnswer.length >= 2; })() :
    type === "sequence" ? userAnswer.length >= 2 :
    userAnswer.trim().length > 0;

  return (
    // Весь экран скроллится нормально — нет overflow hidden на корне
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Фиксированный хедер — только прогресс, не мешает скроллу */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-2 max-w-2xl mx-auto">
          <button onClick={() => navigate("/ege")} className="text-gray-400 hover:text-white text-xl w-8">←</button>
          <span className="text-gray-400 text-sm">{current + 1} / {tasks.length}</span>
          <span className="text-indigo-400 text-sm font-medium">{results.filter(r => r.correct).length} ✓</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden max-w-2xl mx-auto">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Контент — паддинг сверху под фиксированный хедер */}
      <div className="px-4 pt-40 pb-12 max-w-2xl mx-auto">

        {/* Вопрос — НЕТ max-height, свободно растёт */}
        <div className="bg-gray-900 rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {task.subject && <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-1 rounded-full">{task.subject}</span>}
            {task.topic && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{task.topic}</span>}
            {task.difficulty && <span className="text-xs bg-gray-800 text-yellow-400 px-2 py-1 rounded-full">★ {task.difficulty}</span>}
          </div>
          <div className="text-white text-base leading-relaxed ege-question"
            dangerouslySetInnerHTML={{ __html: task.question }} />
        </div>

        {/* Блок ответа */}
        {!answered && (
          <div className="flex flex-col gap-3">

            {/* МУЛЬТИВЫБОР */}
            {type === "multiselect" && (
              <>
                <div className="text-xs text-gray-400 px-1">Выберите все правильные варианты</div>
                {options.map((opt, i) => {
                  const n = String(i + 1);
                  const sel = selectedMulti.includes(n);
                  return (
                    <button key={i}
                      onClick={() => setSelectedMulti(prev => sel ? prev.filter(x=>x!==n) : [...prev, n])}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition border ${sel ? "bg-indigo-800/60 border-indigo-500 text-white" : "bg-gray-900 border-gray-700 text-gray-200 hover:border-gray-500"}`}>
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${sel ? "bg-indigo-500 text-white" : "bg-gray-700 text-gray-400"}`}>{n}</span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </>
            )}

            {/* ОДИНОЧНЫЙ ВЫБОР */}
            {type === "single" && options.map((opt, i) => (
              <button key={i} onClick={() => checkAnswer(opt)}
                className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500 text-white rounded-2xl px-4 py-3 text-left transition">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-900/50 text-indigo-300 font-bold text-sm shrink-0">{LABELS[i]}</span>
                <span className="text-sm">{opt}</span>
              </button>
            ))}

            {/* ПОСЛЕДОВАТЕЛЬНОСТЬ — просто поле ввода */}
            {type === "sequence" && (
              <>
                <div className="text-xs text-gray-400 px-1">Введите последовательность цифр, например: 534621</div>
                <input type="text" value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g,""))}
                  onKeyDown={e => e.key==="Enter" && canSubmit && checkAnswer()}
                  placeholder="Введи цифры по порядку..."
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl px-5 py-4 text-2xl tracking-widest text-center focus:outline-none focus:border-indigo-500"
                  autoFocus />
              </>
            )}

            {/* СООТВЕТСТВИЕ */}
            {type === "match" && (() => {
              const rows = getMatchRows(task);
              const cols = getMatchCols(task);
              return rows
                ? <MatchWidget rows={rows} cols={cols} answers={matchAnswers} onChange={setMatchAnswers} />
                : <input type="text" value={userAnswer} onChange={e=>setUserAnswer(e.target.value.replace(/[^0-9]/g,""))}
                    placeholder="Введи цифры, напр: 332131"
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl px-5 py-4 text-xl tracking-widest text-center focus:outline-none focus:border-indigo-500"/>;
            })()}

            {/* ТЕКСТ */}
            {type === "text" && (
              <input type="text" value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key==="Enter" && canSubmit && checkAnswer()}
                placeholder="Введи ответ..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-indigo-500"
                autoFocus />
            )}

            {/* Кнопка проверить (не для single) */}
            {type !== "single" && (
              <button onClick={() => checkAnswer()} disabled={!canSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition">
                Проверить
              </button>
            )}
          </div>
        )}

        {/* После ответа */}
        {answered && (
          <div className="flex flex-col gap-3">
            <div className={`rounded-2xl p-4 text-center font-semibold text-lg ${isCorrect ? "bg-green-900/50 border border-green-600 text-green-400" : "bg-red-900/50 border border-red-600 text-red-400"}`}>
              {isCorrect ? "✅ Правильно!" : <span>❌ Неверно. <span className="text-white">Ответ: {task.answer}</span></span>}
            </div>
            {task.solution && (
              <>
                <button onClick={() => setShowSolution(!showSolution)} className="text-indigo-400 text-sm text-center">
                  {showSolution ? "Скрыть решение ▲" : "Показать решение ▼"}
                </button>
                {showSolution && <div className="bg-gray-800 rounded-2xl p-4 text-sm text-gray-300 leading-relaxed">{task.solution}</div>}
              </>
            )}
            <button onClick={nextTask} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-semibold text-lg transition">
              {current + 1 >= tasks.length ? "Завершить тест" : "Следующее →"}
            </button>
          </div>
        )}
      </div>

      <EgeStyles />
    </div>
  );
}
