import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";
import FrogReaction from "../components/FrogReaction";

// ─────────────────────────────────────────────────────────
// XP за правильный ответ по линии задания
// Источник: ФИПИ, спецификация ЕГЭ 2025
// 1 первичный балл ФИПИ = 10 XP
// 2 первичных балла      = 20 XP
// 3 первичных балла      = 30 XP
// ─────────────────────────────────────────────────────────
const XP_CONFIG = {
  // Биология: линии 1–28
  // 1 балл: 1, 3–5, 9, 13
  // 2 балла: 2, 6–8, 10–12, 14–21
  // 3 балла: 22–28
  биология: {
    1:10, 2:20, 3:10, 4:10, 5:10,
    6:20, 7:20, 8:20, 9:10, 10:20,
    11:20, 12:20, 13:10, 14:20, 15:20,
    16:20, 17:20, 18:20, 19:20, 20:20,
    21:20, 22:30, 23:30, 24:30, 25:30,
    26:30, 27:30, 28:30,
  },
  // Химия: линии 1–28 (первая часть)
  // 1 балл: 1–5, 9–13, 16–21, 25–28
  // 2 балла: 6–8, 14–15, 22–24
  химия: {
    1:10,  2:10,  3:10,  4:10,  5:10,
    6:20,  7:20,  8:20,  9:10,  10:10,
    11:10, 12:10, 13:10, 14:20, 15:20,
    16:10, 17:10, 18:10, 19:10, 20:10,
    21:10, 22:20, 23:20, 24:20, 25:10,
    26:10, 27:10, 28:10,
  },
  // Физика: линии 1–21 (первая часть)
  // 1 балл: 1–4, 7–8, 11–13, 16, 19–20
  // 2 балла: 5–6, 9–10, 14–15, 17–18
  // 3 балла: 21
  физика: {
    1:10,  2:10,  3:10,  4:10,  5:20,
    6:20,  7:10,  8:10,  9:20,  10:20,
    11:10, 12:10, 13:10, 14:20, 15:20,
    16:10, 17:20, 18:20, 19:10, 20:10,
    21:30,
  },
  // Русский язык: линии 1–26 (первая часть)
  // 1 балл: 1–7, 9–21, 23–26
  // 2 балла: 8, 22
  "русский язык": {
    1:10,  2:10,  3:10,  4:10,  5:10,
    6:10,  7:10,  8:20,  9:10,  10:10,
    11:10, 12:10, 13:10, 14:10, 15:10,
    16:10, 17:10, 18:10, 19:10, 20:10,
    21:10, 22:20, 23:10, 24:10, 25:10,
    26:10,
  },
};

const DEFAULT_XP = 10;

function getXpForTask(task) {
  const subject = (task.subject || "биология").toLowerCase().trim();
  const line = parseInt(task.line_number);
  const table = XP_CONFIG[subject] || XP_CONFIG["биология"];
  return table[line] ?? DEFAULT_XP;
}

// ── Варианты реакций ──────────────────────────────────────────────────────────
const CORRECT_VARIANTS = ["jump", "like"];
const WRONG_VARIANTS   = ["angry", "cry", "eyeroll"];
function pickVariant(correct) {
  const arr = correct ? CORRECT_VARIANTS : WRONG_VARIANTS;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Оверлей лягушки ───────────────────────────────────────────────────────────
function FrogOverlay({ variant, t, leaving }) {
  const label = {
    jump:    "Правильно! 🎉",
    like:    "Огонь! 👍",
    angry:   "Ну и ну... 😤",
    cry:     "Не расстраивайся 😢",
    eyeroll: "Серьёзно?.. 🙄",
  }[variant] || "";
  const isGood = variant === "jump" || variant === "like";
  return (
    <div style={{
      position: "fixed", bottom: 90, right: 16, zIndex: 50,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      pointerEvents: "none",
      animation: leaving ? "frogOut 0.3s ease-in both" : "frogPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
    }}>
      <FrogReaction t={t} variant={variant} size={100} />
      <div style={{
        background: isGood ? "#16a34aEE" : "#dc2626EE",
        color: "#fff", fontSize: 11, fontWeight: 800,
        padding: "4px 12px", borderRadius: 999,
        fontFamily: "'Nunito', sans-serif",
        whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}>{label}</div>
    </div>
  );
}

function EditModal({ task, onClose, onSaved, t }) {
  const [form, setForm] = useState({
    question: task.question || "",
    answer: task.answer || "",
    solution: task.solution || "",
    topic: task.topic || "",
    subtopic: task.subtopic || "",
    options: task.options || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from("ege_tasks").update({
      question: form.question.trim(),
      answer: form.answer.trim(),
      solution: form.solution.trim() || null,
      topic: form.topic.trim() || null,
      subtopic: form.subtopic.trim() || null,
      options: form.options.trim() || null,
    }).eq("id", task.id);
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => { onSaved(form); onClose(); }, 800); }
  }

  const inputS = { width: "100%", background: "#1f2937", border: "1.5px solid #374151", color: "#f9fafb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const labelS = { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#111827", borderRadius: "24px 24px 0 0", padding: "20px 16px 40px", width: "100%", maxWidth: 600, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#f9fafb" }}>✏️ Редактировать задание</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>#{task.id.slice(0, 6)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><label style={labelS}>Вопрос</label><textarea value={form.question} onChange={e => setForm(f => ({...f, question: e.target.value}))} style={{ ...inputS, minHeight: 100, resize: "vertical" }} /></div>
          <div><label style={labelS}>Ответ</label><input value={form.answer} onChange={e => setForm(f => ({...f, answer: e.target.value}))} style={inputS} /></div>
          <div><label style={labelS}>Варианты (через ||)</label><input value={form.options} onChange={e => setForm(f => ({...f, options: e.target.value}))} style={inputS} /></div>
          <div><label style={labelS}>Объяснение</label><textarea value={form.solution} onChange={e => setForm(f => ({...f, solution: e.target.value}))} style={{ ...inputS, minHeight: 80, resize: "vertical" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><label style={labelS}>Тема</label><input value={form.topic} onChange={e => setForm(f => ({...f, topic: e.target.value}))} style={inputS} /></div>
            <div><label style={labelS}>Подтема</label><input value={form.subtopic} onChange={e => setForm(f => ({...f, subtopic: e.target.value}))} style={inputS} /></div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ background: saved ? "#16a34a" : "#6366f1", color: "#fff", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", marginTop: 4 }}>
            {saved ? "✅ Сохранено!" : saving ? "Сохраняем..." : "💾 Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EgeStyles({ t }) {
  return (
    <style>{`
      @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes slideOutLeft { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-40px)} }
      @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
      @keyframes correctPulse { 0%{box-shadow:0 0 0 0 ${t.success}55} 50%{box-shadow:0 0 0 14px ${t.success}00} 100%{box-shadow:0 0 0 0 ${t.success}00} }
      @keyframes xpPop { 0%{opacity:0;transform:translateX(-50%) translateY(0) scale(0.5)} 35%{opacity:1;transform:translateX(-50%) translateY(-20px) scale(1.25)} 65%{opacity:1;transform:translateX(-50%) translateY(-28px) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-44px) scale(0.85)} }
      @keyframes resultIn { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes frogPop { 0%{opacity:0;transform:scale(0.4) translateY(30px)} 60%{transform:scale(1.15) translateY(-6px)} 80%{transform:scale(0.95) translateY(2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes frogOut { from{opacity:1;transform:scale(1) translateY(0)} to{opacity:0;transform:scale(0.5) translateY(20px)} }
      .et-task-enter{animation:slideInRight 0.32s cubic-bezier(0.22,1,0.36,1) both}
      .et-task-exit{animation:slideOutLeft 0.2s ease-in both}
      .et-shake{animation:shake 0.42s ease both}
      .et-correct-pulse{animation:correctPulse 0.55s ease both}
      .et-result-in{animation:resultIn 0.28s cubic-bezier(0.22,1,0.36,1) both}
      .et-fade-in{animation:fadeInUp 0.22s ease both}
      .ege-question table{width:100%;border-collapse:collapse;margin:8px 0}
      .ege-question td,.ege-question th{border:1px solid ${t.border};padding:5px 8px;color:${t.text};font-size:12px}
      .ege-question th{background:${t.surfaceUp};font-weight:600}
      .ege-question tr:nth-child(even) td{background:${t.bg}}
      .ege-question img{max-width:100%;max-height:170px;width:auto;height:auto;border-radius:8px;margin:8px 0;display:block;filter:grayscale(100%)}
      .ege-question p{margin-bottom:4px}
      .ege-question ol,.ege-question ul{padding-left:16px;margin:4px 0}
      .ege-question li{margin-bottom:3px}
      .et-wrap{max-width:1100px;margin:0 auto;padding:76px 48px 80px}
      .et-header-inner{max-width:1100px;margin:0 auto;padding:10px 48px}
      .et-header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
      .et-back{background:${t.surfaceUp};border:none;color:${t.textMuted};width:36px;height:36px;border-radius:999px;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s}
      .et-back:hover{background:${t.border}}
      .et-counter{color:${t.text};font-size:14px;font-weight:600}
      .et-score{color:${t.primary};font-size:14px;font-weight:700;min-width:40px;text-align:right}
      .et-progress{height:5px;background:${t.surfaceUp};border-radius:999px;overflow:hidden}
      .et-progress-bar{height:100%;background:${t.primary};border-radius:999px;transition:width 0.5s cubic-bezier(0.22,1,0.36,1)}
      .et-card{background:${t.surface};border-radius:20px;padding:16px;margin-bottom:12px;border:2px solid ${t.border};transition:border-color 0.3s,box-shadow 0.3s}
      .et-card.correct{border-color:${t.success};box-shadow:0 0 0 3px ${t.success}28}
      .et-card.wrong{border-color:${t.error};box-shadow:0 0 0 3px ${t.error}28}
      .et-tags{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;align-items:center}
      .et-tag{font-size:11px;padding:3px 9px;border-radius:999px}
      .et-tag-subject{background:${t.secondary};color:${t.primary};font-weight:600}
      .et-tag-topic{background:${t.surfaceUp};color:${t.textMuted}}
      .et-tag-xp{background:${t.secondary};color:${t.primary};font-weight:700}
      .et-tag-retry{background:#FF950022;color:#FF9500;font-weight:700}
      .et-question{color:${t.text};font-size:13px;line-height:1.6}
      .et-hint{font-size:11px;color:${t.textMuted};padding-left:2px;margin-bottom:4px}
      .et-answers{display:flex;flex-direction:column;gap:7px}
      .et-opt{display:flex;align-items:center;gap:10px;border-radius:999px;padding:10px 16px;cursor:pointer;border:2px solid ${t.border};background:${t.surface};color:${t.text};width:100%;text-align:left;transition:border-color 0.15s,background 0.15s,transform 0.12s,box-shadow 0.15s}
      .et-opt:hover{border-color:${t.primary};transform:translateY(-1px);box-shadow:0 4px 12px ${t.primary}22}
      .et-opt:active{transform:scale(0.98)}
      .et-opt.selected{background:${t.secondary};border-color:${t.primary}}
      .et-opt-num{width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:12px;font-weight:700;flex-shrink:0;background:${t.surfaceUp};color:${t.textMuted};transition:background 0.15s,color 0.15s}
      .et-opt.selected .et-opt-num{background:${t.primary};color:#fff}
      .et-opt-letter{background:${t.secondary};color:${t.primary}}
      .et-opt-text{font-size:13px}
      .et-input{width:100%;background:${t.surface};border:2px solid ${t.border};color:${t.text};border-radius:999px;outline:none;transition:border-color 0.2s,box-shadow 0.2s}
      .et-input:focus{border-color:${t.primary};box-shadow:0 0 0 3px ${t.primary}22}
      .et-input-seq{padding:11px 14px;font-size:22px;letter-spacing:5px;text-align:center}
      .et-input-text{padding:10px 16px;font-size:13px}
      .et-btn-check{width:100%;background:linear-gradient(135deg,${t.primary},${t.primaryBright});color:#fff;padding:14px;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:opacity 0.15s,transform 0.12s,box-shadow 0.15s;box-shadow:0 4px 16px ${t.primaryGlow}}
      .et-btn-check:hover:not(:disabled){opacity:0.92;transform:translateY(-1px);box-shadow:0 6px 20px ${t.primaryGlow}}
      .et-btn-check:active:not(:disabled){transform:scale(0.97)}
      .et-btn-check:disabled{background:${t.surfaceUp};opacity:0.5;cursor:not-allowed;box-shadow:none}
      .et-btn-skip{width:100%;background:transparent;border:2px solid ${t.border};color:${t.textMuted};padding:11px;border-radius:999px;font-size:13px;cursor:pointer;transition:border-color 0.15s,color 0.15s,transform 0.12s}
      .et-btn-skip:hover{border-color:${t.primary};color:${t.text};transform:translateY(-1px)}
      .et-btn-skip-final{width:100%;background:transparent;border:2px solid #FF9500;color:#FF9500;padding:11px;border-radius:999px;font-size:13px;cursor:pointer;transition:transform 0.12s,box-shadow 0.15s}
      .et-btn-skip-final:hover{transform:translateY(-1px);box-shadow:0 4px 12px #FF950033}
      .et-btn-next{width:100%;background:linear-gradient(135deg,${t.primary},${t.primaryBright});color:#fff;padding:14px;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer;border:none;box-shadow:0 4px 16px ${t.primaryGlow};transition:transform 0.12s,opacity 0.15s,box-shadow 0.15s}
      .et-btn-next:hover{transform:translateY(-1px);opacity:0.92;box-shadow:0 6px 20px ${t.primaryGlow}}
      .et-btn-next:active{transform:scale(0.97)}
      .et-result-box{border-radius:20px;padding:13px 16px;text-align:center;font-size:14px;font-weight:700}
      .et-solution{background:${t.surfaceUp};border-radius:16px;padding:10px 13px;font-size:12px;color:${t.textMuted};line-height:1.6}
      .et-solution-btn{color:${t.primary};font-size:12px;background:none;border:none;cursor:pointer;padding:2px 0;transition:opacity 0.15s}
      .et-solution-btn:hover{opacity:0.75}
      .xp-float{position:fixed;left:50%;top:38%;pointer-events:none;font-size:20px;font-weight:800;color:${t.primary};z-index:999;text-shadow:0 2px 8px ${t.primaryGlow};animation:xpPop 0.9s ease forwards}
      @media(max-width:600px){
        .et-wrap{padding:66px 12px 80px}
        .et-header-inner{padding:8px 12px}
        .et-card{padding:12px}
        .et-question{font-size:12px}
        .ege-question td,.ege-question th{padding:4px 6px;font-size:11px}
        .ege-question img{max-height:120px}
        .et-opt{padding:8px 12px}
        .et-opt-text{font-size:12px}
        .et-input-seq{font-size:18px;letter-spacing:4px;padding:10px 12px}
        .et-btn-check,.et-btn-next{font-size:13px;padding:12px}
        .et-btn-skip,.et-btn-skip-final{font-size:12px;padding:9px}
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
      nl.push({ x1: lr.right - cRect.left, y1: lr.top + lr.height/2 - cRect.top, x2: rr.left - cRect.left, y2: rr.top + rr.height/2 - cRect.top, key: i });
    });
    setLines(nl);
  }
  function handleLeft(i) { setSelected(selected === i ? null : i); }
  function handleRight(c) { if (selected === null) return; onChange({ ...answers, [selected]: String(c) }); setSelected(null); setTimeout(computeLines, 50); }
  function clearLine(i) { const n = { ...answers }; delete n[i]; onChange(n); setTimeout(computeLines, 50); }
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
          {rows.map((row, i) => (
            <button key={i} ref={el => leftRefs.current[i] = el} onClick={() => handleLeft(i)}
              style={{ display:"flex",alignItems:"center",gap:8,borderRadius:999,padding:"10px 14px",fontSize:12,cursor:"pointer",background:selected===i?t.secondary:answers[i]?t.surfaceUp:t.surface,border:`2px solid ${selected===i?t.primary:answers[i]?t.primary:t.border}`,color:t.text,width:"100%",textAlign:"left",transition:"all 0.15s" }}>
              <span style={{ fontWeight:700,color:t.primary,width:18,flexShrink:0 }}>{row.label})</span>
              <span style={{ lineHeight:1.4,flex:1 }}>{row.text}</span>
              {answers[i] && <span onClick={e=>{e.stopPropagation();clearLine(i);}} style={{ fontSize:11,color:t.textDim,cursor:"pointer" }}>✕</span>}
            </button>
          ))}
        </div>
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",zIndex:10,overflow:"visible",pointerEvents:"none" }}>
          <defs><marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill={t.primary} /></marker></defs>
          {lines.map(l => <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2-2} y2={l.y2} stroke={t.primary} strokeWidth="1.5" markerEnd="url(#arr)" />)}
        </svg>
        <div style={{ display:"flex",flexDirection:"column",gap:6,flexShrink:0 }}>
          {cols.map((c, ci) => (
            <button key={ci} ref={el => rightRefs.current[ci] = el} onClick={() => handleRight(c)}
              style={{ width:36,height:36,borderRadius:999,fontSize:14,fontWeight:700,cursor:"pointer",background:selected!==null?t.secondary:Object.values(answers).includes(String(c))?t.surfaceUp:t.surface,border:`2px solid ${selected!==null?t.primary:Object.values(answers).includes(String(c))?t.primary:t.border}`,color:t.text,transition:"all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {selected !== null && <div style={{ textAlign:"center",fontSize:11,color:t.primary,marginTop:6 }}>«{rows[selected]?.label})» — нажми цифру справа</div>}
    </div>
  );
}

function XpFloat({ xp, onDone }) {
  return <div className="xp-float" onAnimationEnd={onDone}>⚡ +{xp} XP</div>;
}

export default function EgeTest({ t }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tgUser, dbUser } = useUser();
  const isAdmin = (tgUser?.id || dbUser?.id) === 5015547885;
  const subjectParam = searchParams.get("subject");
  const topicParam = searchParams.get("topic");
  const subtopicParam = searchParams.get("subtopic");
  const lineParam = searchParams.get("line");
  const errorIdsParam = searchParams.get("error_ids");
  const idsParam = searchParams.get("ids");
  const srIdsParam = searchParams.get("sr_ids");

  const [tasks, setTasks] = useState([]);
  const [skippedOnce, setSkippedOnce] = useState(new Map());
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
  const [xpEarned, setXpEarned] = useState(0);
  const [lastXp, setLastXp] = useState(0);
  const [taskAnim, setTaskAnim] = useState("et-task-enter");
  const [cardClass, setCardClass] = useState("");
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // ── Лягушка ──
  const [frogVariant, setFrogVariant] = useState(null);
  const [frogLeaving, setFrogLeaving] = useState(false);
  const frogTimer = useRef(null);

  function showFrog(correct) {
    if (frogTimer.current) clearTimeout(frogTimer.current);
    setFrogLeaving(false);
    setFrogVariant(pickVariant(correct));
    frogTimer.current = setTimeout(() => {
      setFrogLeaving(true);
      setTimeout(() => setFrogVariant(null), 320);
    }, 2200);
  }

  function hideFrog() {
    if (frogTimer.current) clearTimeout(frogTimer.current);
    setFrogVariant(null);
    setFrogLeaving(false);
  }

  const skippedOnceRef = useRef(skippedOnce);
  useEffect(() => { skippedOnceRef.current = skippedOnce; }, [skippedOnce]);
  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    const userId = tgUser?.id || dbUser?.id;
    let solvedSourceIds = new Set();
    if (userId && !errorIdsParam && !idsParam && !srIdsParam) {
      const { data: solved } = await supabase.from("user_answers").select("task_id").eq("user_id", userId).eq("is_correct", true);
      solvedSourceIds = new Set((solved || []).map(a => a.task_id));
    }
    let q = supabase.from("ege_tasks").select("*");
    if (srIdsParam) { q = q.in("id", srIdsParam.split(",")); }
    else if (idsParam) { q = q.in("id", idsParam.split(",")); }
    else if (errorIdsParam) { q = q.in("source_id", errorIdsParam.split(",")); }
    else {
      if (subjectParam) q = q.eq("subject", subjectParam);
      if (topicParam) q = q.eq("topic", topicParam);
      if (subtopicParam) q = q.eq("subtopic", subtopicParam);
      if (lineParam) q = q.eq("line_number", parseInt(lineParam));
    }
    const { data } = await q;
    const unsolved = (data || []).filter(t => !solvedSourceIds.has(t.source_id)).sort(() => Math.random() - 0.5);
    const solved = (data || []).filter(t => solvedSourceIds.has(t.source_id)).sort(() => Math.random() - 0.5);
    const sorted = [...unsolved, ...solved];
    setTasks((idsParam || srIdsParam) ? sorted : sorted.slice(0, 10));
    setLoading(false);
  }

  async function saveSkippedOnExit() {
    const skipped = skippedOnceRef.current;
    if (skipped.size === 0) return;
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    await supabase.from("user_answers").insert(Array.from(skipped.values()).map(task => ({
      user_id: userId, task_id: task.source_id || String(task.id),
      is_correct: false, user_answer: "пропущено", correct_answer: task.answer,
      topic: task.topic, subtopic: task.subtopic, line_number: task.line_number, subject: task.subject,
    })));
  }

  async function handleExit() {
    await saveSkippedOnExit();
    if (!answered && tasks.length > 0 && !finished) {
      const task = tasks[current];
      const userId = tgUser?.id || dbUser?.id;
      if (userId) await supabase.from("user_answers").insert({ user_id: userId, task_id: task.source_id || String(task.id), is_correct: false, user_answer: "пропущено", correct_answer: task.answer, topic: task.topic, subtopic: task.subtopic, line_number: task.line_number, subject: task.subject });
    }
    navigate("/ege");
  }

  async function saveAnswer(task, given, correct) {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    await supabase.from("user_answers").insert({ user_id: userId, task_id: task.source_id || String(task.id), is_correct: correct, user_answer: String(given), correct_answer: task.answer, topic: task.topic, subtopic: task.subtopic, line_number: task.line_number, subject: task.subject });

    if (!correct) {
      const nextReview = new Date(Date.now() + 86400000).toISOString();
      await supabase.from("spaced_repetition").upsert({
        user_id: userId, task_id: task.id,
        next_review: nextReview, interval_days: 1, correct_streak: 0,
      }, { onConflict: "user_id,task_id" });
    } else if (srIdsParam) {
      const { data: sr } = await supabase.from("spaced_repetition").select("*").eq("user_id", userId).eq("task_id", task.id).single();
      if (sr) {
        const newStreak = (sr.correct_streak || 0) + 1;
        const intervals = [1, 3, 7, 14];
        if (newStreak >= 3) {
          await supabase.from("spaced_repetition").delete().eq("user_id", userId).eq("task_id", task.id);
        } else {
          const days = intervals[newStreak] || 14;
          const nextReview = new Date(Date.now() + days * 86400000).toISOString();
          await supabase.from("spaced_repetition").update({ correct_streak: newStreak, interval_days: days, next_review: nextReview }).eq("user_id", userId).eq("task_id", task.id);
        }
      }
    }

    if (!correct) return;
    const xp = getXpForTask(task);
    const today = new Date().toISOString().split("T")[0];
    const { data: fresh } = await supabase.from("users").select("xp,tasks_today,tasks_today_date,total_tasks,streak,last_active").eq("id", userId).single();
    if (!fresh) return;
    const lastDate = fresh.tasks_today_date ? new Date(fresh.tasks_today_date).toISOString().split("T")[0] : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = fresh.streak || 0;
    if (lastDate === yesterday) newStreak += 1;
    else if (lastDate !== today) newStreak = 1;
    await supabase.from("users").update({ xp: (fresh.xp||0)+xp, total_tasks: (fresh.total_tasks||0)+1, tasks_today: lastDate!==today?1:(fresh.tasks_today||0)+1, tasks_today_date: new Date().toISOString(), streak: newStreak, last_active: new Date().toISOString() }).eq("id", userId);
    setLastXp(xp); setXpEarned(prev => prev + xp);
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
    if (/^\d{2,4}$/.test(a) && opts) { const d = a.split(""); if (d.length !== new Set(d).size) return "sequence"; return "multiselect"; }
    if (opts) return "single";
    return "text";
  }

  function getMatchRows(task) {
    const answerLen = (task.answer || "").replace(/\s/g, "").length;
    const text = task.question.replace(/<[^>]+>/g, " ");
    const free = text.match(/[А-Е]\)\s*[^\n]{3,}/g) || [];
    if (free.length >= 2) {
      const result = free.map(m => ({ label: m[0], text: m.replace(/^[А-Е]\)\s*/, "").trim().slice(0, 120) }));
      return answerLen > 0 ? result.slice(0, answerLen) : result;
    }
    const rows = []; const trRe = /<tr[^>]*>(.*?)<\/tr>/gis; let trM;
    while ((trM = trRe.exec(task.question)) !== null) {
      const rowHtml = trM[1]; if (/<th/i.test(rowHtml)) continue;
      const tdRe2 = /<td[^>]*>(.*?)<\/td>/gis; const cells = []; let tdM2;
      while ((tdM2 = tdRe2.exec(rowHtml)) !== null) cells.push(tdM2[1].replace(/<[^>]+>/g, "").trim());
      if (!cells[0] || cells[0].length <= 1) continue;
      const hasEmpty = cells.some(c => c === "" || /^[А-Е]$/.test(c));
      if (hasEmpty) rows.push(cells[0]);
    }
    const limited = answerLen > 0 ? rows.slice(0, answerLen) : rows;
    if (limited.length >= 2) return limited.map((tx, i) => ({ label: String.fromCharCode(1040 + i), text: tx.replace(/^[А-Е]\)\s*/, "").trim().slice(0, 120) }));
    return null;
  }

  function getMatchCols(task) {
    const d = (task.answer||"").replace(/\s/g,"").split("").map(Number).filter(n => !isNaN(n) && n > 0);
    return Array.from({ length: d.length > 0 ? Math.max(...d) : 3 }, (_, i) => i + 1);
  }

  function checkAnswer(override) {
    const task = tasks[current];
    const type = getTaskType(task);
    let given = "";
    if (type === "multiselect") given = [...selectedMulti].sort().join("");
    else if (type === "match") { const rows = getMatchRows(task); given = rows ? rows.map((_, i) => matchAnswers[i] || "0").join("") : norm(userAnswer); }
    else given = override !== undefined ? override : userAnswer;
    const normVal = s => s.trim().toLowerCase().replace(/[\s\-]/g,"").replace(/,/g,".");
    const allVariants = new Set();
    (task.answer||"").split(/\/|\|\||,/).forEach(part => { const v = normVal(part); if (v) allVariants.add(v); });
    const correct = [...allVariants].some(v => v === normVal(given));
    if (correct) {
      const taskId = task.source_id || String(task.id);
      setSkippedOnce(prev => { const next = new Map(prev); next.delete(taskId); return next; });
      setCardClass("correct et-correct-pulse"); setShowXpFloat(true);
    } else { setCardClass("wrong et-shake"); setTimeout(() => setCardClass("wrong"), 450); }
    setIsCorrect(correct); setAnswered(true); setUserAnswer(given);
    setResults(prev => [...prev, { task, userAnswer: given, correct, skipped: false }]);
    saveAnswer(task, given, correct);
    showFrog(correct);
  }

  function norm(a) { return (a||"").trim().toLowerCase().replace(/[\s,.\-]/g,""); }

  function animateToNext(callback) {
    if (transitioning) return;
    hideFrog();
    setTransitioning(true); setTaskAnim("et-task-exit");
    setTimeout(() => { callback(); setCardClass(""); setTaskAnim("et-task-enter"); setTransitioning(false); window.scrollTo({ top: 0, behavior: "smooth" }); }, 210);
  }

  function skipTask() {
    const task = tasks[current];
    const taskId = task.source_id || String(task.id);
    if (skippedOnce.has(taskId)) {
      setResults(prev => [...prev, { task, userAnswer: "—", correct: false, skipped: true }]);
      saveAnswer(task, "пропущено", false);
      setSkippedOnce(prev => { const next = new Map(prev); next.delete(taskId); return next; });
      const newTasks = tasks.filter((_, i) => i !== current);
      animateToNext(() => {
        if (newTasks.length === 0 || current >= newTasks.length) { setTasks(newTasks); setFinished(true); return; }
        setTasks(newTasks); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({}); setAnswered(false); setIsCorrect(null); setShowSolution(false); setLastXp(0);
      });
    } else {
      setSkippedOnce(prev => new Map(prev).set(taskId, task));
      const newTasks = [...tasks]; const [sk] = newTasks.splice(current, 1); newTasks.push(sk);
      animateToNext(() => { setTasks(newTasks); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({}); setAnswered(false); setIsCorrect(null); setShowSolution(false); setLastXp(0); });
    }
  }

  function nextTask() {
    animateToNext(() => {
      if (current + 1 >= tasks.length) { setFinished(true); return; }
      setCurrent(c => c + 1); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({}); setAnswered(false); setIsCorrect(null); setShowSolution(false); setLastXp(0);
    });
  }

  function restart() {
    hideFrog();
    setCurrent(0); setUserAnswer(""); setSelectedMulti([]); setMatchAnswers({}); setResults([]); setFinished(false); setAnswered(false); setIsCorrect(null);
    setShowSolution(false); setXpEarned(0); setLastXp(0); setSkippedOnce(new Map()); setCardClass(""); setTaskAnim("et-task-enter"); fetchTasks(); window.scrollTo({ top: 0 });
  }

  if (loading) return <div style={{ minHeight:"100vh",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ color:t.text,fontSize:16 }}>Загружаем задания...</span><EgeStyles t={t} /></div>;
  if (tasks.length === 0 && !finished) return <div style={{ minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14 }}><span style={{ color:t.text,fontSize:18 }}>Нет заданий</span><button onClick={() => navigate("/ege")} style={{ background:t.primary,color:"#fff",padding:"12px 24px",borderRadius:999,fontSize:14,cursor:"pointer",border:"none" }}>Назад</button><EgeStyles t={t} /></div>;

  if (finished) {
    const score = results.filter(r => r.correct).length;
    const skippedCount = results.filter(r => r.skipped).length;
    const pct = results.length > 0 ? Math.round((score / results.length) * 100) : 0;
    return (
      <div style={{ minHeight:"100vh",background:t.bg,color:t.text,paddingBottom:100 }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"32px 16px 0" }} className="et-task-enter">
          <div style={{ textAlign:"center",marginBottom:24 }}>
            <div style={{ fontSize:48,marginBottom:8 }}>{pct>=80?"🏆":pct>=50?"💪":"📚"}</div>
            <div style={{ fontSize:28,fontWeight:800,marginBottom:4 }}>{score} / {results.length}</div>
            <div style={{ color:t.textMuted,fontSize:15,marginBottom:8 }}>{pct}% правильных{skippedCount>0&&<span style={{ color:"#FF9500",marginLeft:8 }}>· {skippedCount} пропущено</span>}</div>
            {xpEarned > 0 && <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:`${t.primary}22`,border:`1px solid ${t.primary}44`,borderRadius:999,padding:"6px 16px",fontSize:14,fontWeight:700,color:t.primary,marginBottom:12 }}>⚡ +{xpEarned} XP заработано</div>}
            <div style={{ height:8,background:t.surfaceUp,borderRadius:999,overflow:"hidden" }}><div style={{ height:"100%",background:`linear-gradient(90deg,${t.primary},${t.primaryBright})`,borderRadius:999,width:`${pct}%`,transition:"width 1s cubic-bezier(0.22,1,0.36,1)" }} /></div>
          </div>
          <div style={{ display:"flex",gap:8,marginBottom:18 }}>
            <button onClick={restart} style={{ flex:1,background:`linear-gradient(135deg,${t.primary},${t.primaryBright})`,color:"#fff",padding:14,borderRadius:999,fontSize:15,fontWeight:700,cursor:"pointer",border:"none",boxShadow:`0 4px 16px ${t.primaryGlow}` }}>Ещё раз</button>
            <button onClick={() => navigate("/ege")} style={{ flex:1,background:t.surface,color:t.text,padding:14,borderRadius:999,fontSize:15,fontWeight:600,cursor:"pointer",border:`1px solid ${t.border}` }}>К заданиям</button>
          </div>
          {results.some(r => !r.correct) && <div style={{ background:`${t.primary}11`,border:`1px solid ${t.primary}33`,borderRadius:16,padding:"12px 16px",marginBottom:16,fontSize:13,color:t.textMuted,textAlign:"center" }}>💡 Неправильные добавлены в <span onClick={() => navigate("/errors")} style={{ color:t.primary,fontWeight:700,cursor:"pointer" }}>Работу над ошибками</span></div>}
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {results.map((r, i) => (
              <div key={i} className="et-fade-in" style={{ animationDelay:`${i*0.04}s`,borderRadius:20,padding:16,border:`1px solid ${r.correct?t.success:r.skipped?"#FF9500":t.error}`,background:r.correct?`${t.success}18`:r.skipped?"#FF950018":`${t.error}18` }}>
                <div style={{ fontSize:11,color:t.textMuted,marginBottom:5 }}>{i+1}. {r.task.topic}{r.skipped&&<span style={{ color:"#FF9500",marginLeft:6 }}>· пропущено</span>}</div>
                <div className="ege-question" style={{ fontSize:13,marginBottom:7 }} dangerouslySetInnerHTML={{ __html: r.task.question }} />
                <div style={{ fontSize:13 }}><span style={{ color:t.textMuted }}>Твой: </span><span style={{ color:r.correct?t.success:r.skipped?"#FF9500":t.error }}>{r.userAnswer||"—"}</span></div>
                {!r.correct && <div style={{ fontSize:13,marginTop:3 }}><span style={{ color:t.textMuted }}>Правильно: </span><span style={{ color:t.success }}>{r.task.answer}</span></div>}
                {r.correct && <div style={{ fontSize:12,color:t.primary,marginTop:4 }}>⚡ +{getXpForTask(r.task)} XP</div>}
                {r.task.solution && <div style={{ marginTop:8,fontSize:12,color:t.textMuted,background:t.surfaceUp,borderRadius:12,padding:"7px 10px" }}>💡 {isAdmin?r.task.solution:r.task.solution.replace(/!!$/,"").trim()}</div>}
              </div>
            ))}
          </div>
        </div>
        <EgeStyles t={t} />
      </div>
    );
  }

  const task = tasks[current];
  const taskId = task.source_id || String(task.id);
  const isRetry = skippedOnce.has(taskId);
  const type = getTaskType(task);
  const options = getOptions(task);
  const progress = (current / tasks.length) * 100;
  const LABELS = ["A","B","C","D","E","F"];
  const canSubmit =
    type === "multiselect" ? selectedMulti.length > 0 :
    type === "match" ? (() => { const r = getMatchRows(task); return r ? r.every((_, i) => matchAnswers[i]) : userAnswer.length >= 2; })() :
    type === "sequence" ? userAnswer.length >= 2 : userAnswer.trim().length > 0;

  return (
    <div style={{ minHeight:"100vh",background:t.bg,color:t.text }}>
      {showXpFloat && <XpFloat xp={lastXp} onDone={() => setShowXpFloat(false)} />}
      {editTask && <EditModal task={editTask} t={t} onClose={() => setEditTask(null)} onSaved={(form) => { setTasks(prev => prev.map(tk => tk.id === editTask.id ? { ...tk, ...form } : tk)); }} />}

      {frogVariant && <FrogOverlay variant={frogVariant} t={t} leaving={frogLeaving} />}

      <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:30,background:t.surface,borderBottom:`1px solid ${t.border}` }}>
        <div className="et-header-inner">
          <div className="et-header-row">
            <button className="et-back" onClick={handleExit}>←</button>
            <span className="et-counter">{current+1} / {tasks.length}</span>
            <span className="et-score">{results.filter(r=>r.correct).length} ✓</span>
          </div>
          <div className="et-progress"><div className="et-progress-bar" style={{ width:`${progress}%` }} /></div>
        </div>
      </div>

      <div className={`et-wrap ${taskAnim}`}>
        <div className={`et-card ${cardClass}`}>
          <div className="et-tags">
            {task.subject && <span className="et-tag et-tag-subject">{task.subject}</span>}
            {task.topic && <span className="et-tag et-tag-topic">{task.topic}</span>}
            {task.subtopic && <span className="et-tag et-tag-topic">{task.subtopic}</span>}
            {task.line_number && <span className="et-tag et-tag-xp">⚡ {getXpForTask(task)} XP</span>}
            {isRetry && <span className="et-tag et-tag-retry">🔄 Повтор</span>}
            <span style={{ marginLeft:"auto",fontSize:10,color:t.textDim,fontFamily:"monospace",cursor:"pointer",userSelect:"all" }} title={task.id}>#{task.id ? task.id.slice(0,8) : ""}</span>
            {isAdmin && <button onClick={() => setEditTask(task)} style={{ fontSize:11,padding:"2px 8px",borderRadius:999,background:`${t.primary}22`,color:t.primary,border:`1px solid ${t.primary}44`,cursor:"pointer",fontWeight:700 }}>✏️</button>}
          </div>
          <div className="ege-question et-question" dangerouslySetInnerHTML={{ __html: task.question }} />
        </div>

        {!answered && (
          <div className="et-answers et-fade-in">
            {type === "multiselect" && (<>
              <div className="et-hint">Выберите все правильные варианты</div>
              {options.map((opt, i) => { const n = String(i+1); const sel = selectedMulti.includes(n); return <button key={i} className={`et-opt${sel?" selected":""}`} onClick={() => setSelectedMulti(p => sel?p.filter(x=>x!==n):[...p,n])}><span className="et-opt-num">{n}</span><span className="et-opt-text">{opt}</span></button>; })}
            </>)}
            {type === "single" && options.map((opt, i) => <button key={i} className="et-opt" onClick={() => checkAnswer(opt)}><span className="et-opt-num et-opt-letter">{LABELS[i]}</span><span className="et-opt-text">{opt}</span></button>)}
            {type === "sequence" && (<><div className="et-hint">Введите последовательность цифр, например: 534621</div><input type="text" value={userAnswer} autoFocus className="et-input et-input-seq" onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g,""))} onKeyDown={e => e.key==="Enter"&&canSubmit&&checkAnswer()} placeholder="Введи цифры..." /></>)}
            {type === "match" && (() => { const rows = getMatchRows(task); const cols = getMatchCols(task); return rows ? <MatchWidget rows={rows} cols={cols} answers={matchAnswers} onChange={setMatchAnswers} t={t} /> : <input type="text" value={userAnswer} className="et-input et-input-seq" onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g,""))} onKeyDown={e => e.key==="Enter"&&canSubmit&&checkAnswer()} placeholder="Введи цифры..." />; })()}
            {type === "text" && <input type="text" value={userAnswer} autoFocus className="et-input et-input-text" onChange={e => setUserAnswer(e.target.value)} onKeyDown={e => e.key==="Enter"&&canSubmit&&checkAnswer()} placeholder="Введи ответ..." />}
            {type !== "single" && <button className="et-btn-check" onClick={() => checkAnswer()} disabled={!canSubmit}>Проверить</button>}
            {isRetry ? <button className="et-btn-skip-final" onClick={skipTask}>Пропустить → (добавить в ошибки)</button> : <button className="et-btn-skip" onClick={skipTask}>Пропустить → (вернётся в конце)</button>}
          </div>
        )}

        {answered && (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }} className="et-result-in">
            <div className="et-result-box" style={{ background:isCorrect?`${t.success}25`:`${t.error}25`,border:`2px solid ${isCorrect?t.success:t.error}`,color:isCorrect?t.success:t.error }}>
              {isCorrect ? <span>✅ Правильно! <span style={{ color:t.primary,fontSize:12 }}>+{lastXp} XP ⚡</span></span> : <span>❌ Неверно. <span style={{ color:t.text }}>Ответ: {task.answer}</span></span>}
            </div>
            {task.solution && (<>
              <button className="et-solution-btn" onClick={() => setShowSolution(!showSolution)}>{showSolution?"Скрыть решение ▲":"Показать решение ▼"}</button>
              {showSolution && <div className="et-solution et-fade-in">{isAdmin?task.solution:task.solution.replace(/!!$/,"").trim()}</div>}
            </>)}
            <button className="et-btn-next" onClick={nextTask}>{current+1>=tasks.length?"Завершить тест":"Следующее →"}</button>
          </div>
        )}
      </div>
      <EgeStyles t={t} />
    </div>
  );
}