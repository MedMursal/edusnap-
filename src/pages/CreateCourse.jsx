import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { supabase } from "../supabase";

// ─── Icons (inline SVG, no deps) ─────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);
const IPlus = () => <Icon d="M12 5v14M5 12h14" />;
const ITrash = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const IText = () => <Icon d="M4 6h16M4 12h10M4 18h7" />;
const IVideo = () => <Icon d="M15 10l4.553-2.277A1 1 0 0121 8.67v6.66a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />;
const IQuiz = () => <Icon d="M9 12l2 2 4-4M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 3h6v2H9V3z" />;
const IDrag = () => <Icon d="M9 5h1M9 12h1M9 19h1M14 5h1M14 12h1M14 19h1" strokeWidth={3} />;
const ICheck = () => <Icon d="M20 6L9 17l-5-5" />;
const IArrow = ({ left }) => <Icon d={left ? "M19 12H5M12 5l-7 7 7 7" : "M5 12h14M12 5l7 7-7 7"} />;
const IImage = () => <Icon d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f0f13",
  card: "#1a1a22",
  border: "#2a2a38",
  accent: "#6c63ff",
  accentLight: "#8b85ff",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  text: "#f1f0ff",
  muted: "#8884a8",
};

const CATEGORIES = ["Программирование","Языки","Математика","Дизайн","Бизнес","Другое"];
const LEVELS = ["Новичок","Средний","Продвинутый"];
const EMOJIS = ["🚀","📚","🎯","💡","🔥","⚡","🎨","🧠","💻","🌍"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const makeLesson = () => ({ id: uid(), title: "Урок без названия", blocks: [] });
const makeBlock = (type) => ({
  id: uid(), type,
  ...(type === "text"  ? { content: "" } : {}),
  ...(type === "video" ? { url: "" } : {}),
  ...(type === "quiz"  ? { question: "", options: ["","","",""], correct: 0 } : {}),
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function Step({ n, label, active, done }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        width:32, height:32, borderRadius:"50%", display:"flex",
        alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700,
        background: done ? C.green : active ? C.accent : C.border,
        color: (done || active) ? "#fff" : C.muted,
        transition:"all .3s",
        flexShrink:0,
      }}>
        {done ? <ICheck /> : n}
      </div>
      <span style={{ fontSize:13, color: active ? C.text : C.muted, fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius:16, border:`1px solid ${C.border}`,
      padding:"20px 20px", ...style,
    }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, multiline, rows = 3 }) {
  const base = {
    width:"100%", background:"#12121a", border:`1px solid ${C.border}`,
    borderRadius:10, padding:"10px 14px", color:C.text, fontSize:14,
    outline:"none", boxSizing:"border-box", resize:"vertical",
    fontFamily:"inherit",
    transition:"border .2s",
  };
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:12, color:C.muted, marginBottom:6, fontWeight:600 }}>{label}</div>}
      {multiline
        ? <textarea rows={rows} style={base} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
        : <input style={base} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

function Btn({ children, onClick, variant="primary", small, style, disabled }) {
  const bg = { primary:C.accent, ghost:"transparent", danger:"#2a1a1a", success:C.green }[variant];
  const border = { primary:"transparent", ghost:C.border, danger:C.red, success:"transparent" }[variant];
  const color = { primary:"#fff", ghost:C.muted, danger:C.red, success:"#fff" }[variant];
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      onClick={onClick}
      style={{
        background:bg, border:`1px solid ${border}`, borderRadius:10,
        padding: small ? "6px 12px" : "10px 20px",
        color, fontSize: small ? 12 : 14, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer",
        display:"flex", alignItems:"center", gap:6, opacity: disabled ? 0.5 : 1,
        fontFamily:"inherit", ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

// ─── STEP 1: Info ──────────────────────────────────────────────────────────────
function StepInfo({ data, set }) {
  return (
    <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
      <h2 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:4 }}>Основная информация</h2>
      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Расскажи о своём курсе</p>

      <Card>
        {/* Emoji picker */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:8, fontWeight:600 }}>Иконка курса</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {EMOJIS.map(e => (
              <motion.button key={e} whileTap={{scale:0.85}}
                onClick={() => set("emoji", e)}
                style={{
                  width:40, height:40, fontSize:22, borderRadius:10, cursor:"pointer",
                  background: data.emoji===e ? C.accent+"33" : "#12121a",
                  border: `2px solid ${data.emoji===e ? C.accent : "transparent"}`,
                }}>
                {e}
              </motion.button>
            ))}
          </div>
        </div>

        <Input label="Название курса *" value={data.title}
          onChange={v=>set("title",v)} placeholder="Например: JavaScript с нуля за 30 дней" />
        <Input label="Описание" value={data.desc}
          onChange={v=>set("desc",v)} placeholder="Что узнает студент? Чему научится?" multiline />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:6, fontWeight:600 }}>Категория</div>
            <select value={data.category} onChange={e=>set("category",e.target.value)}
              style={{ width:"100%", background:"#12121a", border:`1px solid ${C.border}`,
                borderRadius:10, padding:"10px 14px", color:C.text, fontSize:14,
                outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:6, fontWeight:600 }}>Уровень</div>
            <select value={data.level} onChange={e=>set("level",e.target.value)}
              style={{ width:"100%", background:"#12121a", border:`1px solid ${C.border}`,
                borderRadius:10, padding:"10px 14px", color:C.text, fontSize:14,
                outline:"none", fontFamily:"inherit", cursor:"pointer" }}>
              {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:14 }}>
          <Input label="Цена (₽)" value={data.price}
            onChange={v=>set("price",v.replace(/\D/,""))} placeholder="490" />
          <Input label="Длительность" value={data.duration}
            onChange={v=>set("duration",v)} placeholder="5 часов" />
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Block editors ─────────────────────────────────────────────────────────────
function TextBlock({ block, update, remove }) {
  return (
    <div>
      <Input value={block.content} onChange={v=>update({content:v})}
        placeholder="Введи текст урока..." multiline rows={5} />
      <Btn variant="danger" small onClick={remove}><ITrash />Удалить</Btn>
    </div>
  );
}

function VideoBlock({ block, update, remove }) {
  return (
    <div>
      <Input label="Ссылка на видео (YouTube / VK)" value={block.url}
        onChange={v=>update({url:v})} placeholder="https://youtube.com/..." />
      {block.url && (
        <div style={{ borderRadius:10, overflow:"hidden", marginBottom:12, aspectRatio:"16/9" }}>
          <iframe
            src={block.url.replace("watch?v=","embed/").replace("youtu.be/","youtube.com/embed/")}
            style={{ width:"100%", height:"100%", border:"none" }} allowFullScreen />
        </div>
      )}
      <Btn variant="danger" small onClick={remove}><ITrash />Удалить</Btn>
    </div>
  );
}

function QuizBlock({ block, update, remove }) {
  const setOpt = (i, v) => {
    const opts = [...block.options]; opts[i]=v; update({options:opts});
  };
  return (
    <div>
      <Input label="Вопрос" value={block.question}
        onChange={v=>update({question:v})} placeholder="Что выведет console.log(1+1)?" />
      <div style={{ fontSize:12, color:C.muted, marginBottom:8, fontWeight:600 }}>Варианты ответа</div>
      {block.options.map((opt,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <motion.button whileTap={{scale:0.9}} onClick={()=>update({correct:i})}
            style={{
              width:28, height:28, borderRadius:"50%", flexShrink:0, cursor:"pointer",
              background: block.correct===i ? C.green : "#12121a",
              border: `2px solid ${block.correct===i ? C.green : C.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
            {block.correct===i && <ICheck />}
          </motion.button>
          <input value={opt} onChange={e=>setOpt(i,e.target.value)}
            placeholder={`Вариант ${i+1}`}
            style={{ flex:1, background:"#12121a", border:`1px solid ${C.border}`,
              borderRadius:8, padding:"8px 12px", color:C.text, fontSize:13,
              outline:"none", fontFamily:"inherit" }} />
        </div>
      ))}
      <div style={{ fontSize:11, color:C.green, marginBottom:10 }}>
        ✓ Зелёный кружок = правильный ответ
      </div>
      <Btn variant="danger" small onClick={remove}><ITrash />Удалить</Btn>
    </div>
  );
}

function BlockEditor({ block, update, remove }) {
  const header = { text:"📝 Текст", video:"🎬 Видео", quiz:"❓ Квиз" }[block.type];
  const [open, setOpen] = useState(true);
  return (
    <motion.div layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      style={{ background:"#12121a", borderRadius:12, border:`1px solid ${C.border}`,
        marginBottom:10, overflow:"hidden" }}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{ padding:"12px 16px", display:"flex", alignItems:"center",
          justifyContent:"space-between", cursor:"pointer" }}>
        <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{header}</span>
        <span style={{ color:C.muted, fontSize:18, transform: open?"rotate(180deg)":"none",
          transition:"transform .2s" }}>⌄</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}}
            style={{ overflow:"hidden" }}>
            <div style={{ padding:"0 16px 16px" }}>
              {block.type==="text"  && <TextBlock  block={block} update={update} remove={remove} />}
              {block.type==="video" && <VideoBlock block={block} update={update} remove={remove} />}
              {block.type==="quiz"  && <QuizBlock  block={block} update={update} remove={remove} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── STEP 2: Lessons ───────────────────────────────────────────────────────────
function StepLessons({ lessons, setLessons }) {
  const [activeLesson, setActiveLesson] = useState(lessons[0]?.id || null);

  const addLesson = () => {
    const l = makeLesson();
    setLessons(ls => [...ls, l]);
    setActiveLesson(l.id);
  };

  const updateLesson = (id, patch) =>
    setLessons(ls => ls.map(l => l.id===id ? {...l,...patch} : l));

  const removeLesson = (id) => {
    setLessons(ls => ls.filter(l => l.id!==id));
    setActiveLesson(lessons.find(l=>l.id!==id)?.id||null);
  };

  const addBlock = (lessonId, type) =>
    updateLesson(lessonId, {
      blocks: [...(lessons.find(l=>l.id===lessonId)?.blocks||[]), makeBlock(type)]
    });

  const updateBlock = (lessonId, blockId, patch) => {
    const lesson = lessons.find(l=>l.id===lessonId);
    updateLesson(lessonId, {
      blocks: lesson.blocks.map(b => b.id===blockId ? {...b,...patch} : b)
    });
  };

  const removeBlock = (lessonId, blockId) => {
    const lesson = lessons.find(l=>l.id===lessonId);
    updateLesson(lessonId, { blocks: lesson.blocks.filter(b=>b.id!==blockId) });
  };

  const active = lessons.find(l=>l.id===activeLesson);

  return (
    <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
      <h2 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:4 }}>Уроки</h2>
      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>
        Добавь уроки и наполни их контентом
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:16 }}>
        {/* Sidebar */}
        <div>
          <Reorder.Group axis="y" values={lessons} onReorder={setLessons}
            style={{ listStyle:"none", padding:0, margin:0 }}>
            {lessons.map((l, i) => (
              <Reorder.Item key={l.id} value={l}>
                <motion.div
                  onClick={()=>setActiveLesson(l.id)}
                  style={{
                    padding:"10px 12px", borderRadius:10, marginBottom:6, cursor:"pointer",
                    background: activeLesson===l.id ? C.accent+"22" : "#12121a",
                    border:`1px solid ${activeLesson===l.id ? C.accent : C.border}`,
                    display:"flex", alignItems:"center", gap:8,
                  }}>
                  <span style={{ color:C.muted, fontSize:10 }}><IDrag /></span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>Урок {i+1}</div>
                    <div style={{ fontSize:12, color:C.text, fontWeight:600,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {l.title}
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <Btn onClick={addLesson} small style={{ width:"100%", justifyContent:"center", marginTop:4 }}>
            <IPlus />Урок
          </Btn>
        </div>

        {/* Editor */}
        {active ? (
          <Card style={{ padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <input value={active.title}
                onChange={e=>updateLesson(active.id,{title:e.target.value})}
                style={{ background:"transparent", border:"none", color:C.text,
                  fontSize:16, fontWeight:700, outline:"none", flex:1, fontFamily:"inherit" }} />
              <Btn variant="danger" small onClick={()=>removeLesson(active.id)}>
                <ITrash />
              </Btn>
            </div>

            {active.blocks.map(b => (
              <BlockEditor key={b.id} block={b}
                update={patch=>updateBlock(active.id,b.id,patch)}
                remove={()=>removeBlock(active.id,b.id)} />
            ))}

            <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:C.muted, alignSelf:"center" }}>Добавить блок:</span>
              <Btn variant="ghost" small onClick={()=>addBlock(active.id,"text")}>
                <IText />Текст
              </Btn>
              <Btn variant="ghost" small onClick={()=>addBlock(active.id,"video")}>
                <IVideo />Видео
              </Btn>
              <Btn variant="ghost" small onClick={()=>addBlock(active.id,"quiz")}>
                <IQuiz />Квиз
              </Btn>
            </div>
          </Card>
        ) : (
          <Card style={{ display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:12, minHeight:200 }}>
            <div style={{ fontSize:40 }}>📋</div>
            <p style={{ color:C.muted, fontSize:14 }}>Создай первый урок</p>
            <Btn onClick={addLesson}><IPlus />Добавить урок</Btn>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

// ─── STEP 3: Preview / Publish ─────────────────────────────────────────────────
function StepPreview({ info, lessons, onPublish, publishing, publishError }) {
  const totalBlocks = lessons.reduce((s,l)=>s+l.blocks.length, 0);
  const quizCount   = lessons.reduce((s,l)=>s+l.blocks.filter(b=>b.type==="quiz").length, 0);

  return (
    <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
      <h2 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:4 }}>Предпросмотр</h2>
      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Проверь перед публикацией</p>

      {/* Course card preview */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
          <div style={{ width:72, height:72, borderRadius:16, background: C.accent+"33",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, flexShrink:0 }}>
            {info.emoji}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:4 }}>
              {info.title || "Без названия"}
            </div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:8, lineHeight:1.5 }}>
              {info.desc || "Описание не добавлено"}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[info.category, info.level,
                info.price ? `${info.price} ₽` : "Бесплатно",
                info.duration
              ].filter(Boolean).map((tag,i) => (
                <span key={i} style={{ background:C.border, borderRadius:6, padding:"3px 8px",
                  fontSize:11, color:C.muted }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        {[
          { label:"Уроков", val:lessons.length, icon:"📚" },
          { label:"Блоков контента", val:totalBlocks, icon:"📝" },
          { label:"Квизов", val:quizCount, icon:"❓" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign:"center", padding:16 }}>
            <div style={{ fontSize:24 }}>{s.icon}</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.text }}>{s.val}</div>
            <div style={{ fontSize:11, color:C.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Lessons list */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>Программа курса</div>
        {lessons.length === 0 ? (
          <p style={{ color:C.muted, fontSize:13 }}>Уроки не добавлены</p>
        ) : lessons.map((l,i) => (
          <div key={l.id} style={{ display:"flex", alignItems:"center", gap:12,
            padding:"10px 0", borderBottom: i<lessons.length-1?`1px solid ${C.border}`:"none" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:C.accent+"22",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:C.accentLight, flexShrink:0 }}>
              {i+1}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{l.title}</div>
              <div style={{ fontSize:11, color:C.muted }}>
                {l.blocks.length} блоков
                {l.blocks.filter(b=>b.type==="quiz").length > 0 &&
                  ` · ${l.blocks.filter(b=>b.type==="quiz").length} квиза`}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {publishError && (
        <div style={{ background:"#2a1a1a", border:`1px solid ${C.red}`, borderRadius:10,
          padding:"10px 16px", marginBottom:12, color:C.red, fontSize:13 }}>
          {publishError}
        </div>
      )}

      <motion.button
        whileHover={{ scale: publishing ? 1 : 1.02 }}
        whileTap={{ scale: publishing ? 1 : 0.98 }}
        onClick={onPublish}
        disabled={publishing}
        style={{
          width:"100%", padding:"16px", borderRadius:14, border:"none",
          background: publishing ? C.border : `linear-gradient(135deg, ${C.accent}, #a855f7)`,
          color:"#fff", fontSize:16, fontWeight:700,
          cursor: publishing ? "not-allowed" : "pointer",
          fontFamily:"inherit",
          boxShadow: publishing ? "none" : `0 8px 32px ${C.accent}44`,
        }}>
        {publishing ? "⏳ Сохраняем..." : "🚀 Опубликовать курс"}
      </motion.button>
    </motion.div>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ info, onReset }) {
  return (
    <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}}
      style={{ textAlign:"center", padding:"40px 0" }}>
      <motion.div animate={{ rotate:[0,10,-10,10,0] }} transition={{ delay:.3, duration:.5 }}
        style={{ fontSize:80, marginBottom:16 }}>
        🎉
      </motion.div>
      <h2 style={{ color:C.text, fontSize:24, fontWeight:800, marginBottom:8 }}>
        Курс опубликован!
      </h2>
      <p style={{ color:C.muted, fontSize:15, marginBottom:4 }}>
        <strong style={{ color:C.accentLight }}>{info.emoji} {info.title}</strong>
      </p>
      <p style={{ color:C.muted, fontSize:13, marginBottom:32 }}>
        Теперь расшарь ссылку и собирай студентов
      </p>

      <div style={{ background:C.card, borderRadius:12, padding:"12px 16px", marginBottom:24,
        display:"flex", alignItems:"center", gap:8, border:`1px solid ${C.border}` }}>
        <span style={{ color:C.muted, fontSize:13, flex:1 }}>
          edusnap.app/course/{info.title.toLowerCase().replace(/\s+/g,"-")||"my-course"}
        </span>
        <Btn small onClick={()=>navigator.clipboard?.writeText("Link copied!")}>
          Копировать
        </Btn>
      </div>

      <Btn onClick={onReset} style={{ margin:"0 auto" }}>
        <IPlus /> Создать ещё курс
      </Btn>
    </motion.div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
const STEPS = ["Информация","Уроки","Публикация"];

export default function CreateCourse() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);

  const [info, setInfo] = useState({
    emoji: "🚀", title:"", desc:"", category:"Программирование",
    level:"Новичок",
  });
  const setInfoField = (k,v) => setInfo(i=>({...i,[k]:v}));

  const [lessons, setLessons] = useState([makeLesson()]);

  const canNext = step===0 ? info.title.trim().length > 0 : true;

  // ── Сохранение в Supabase ──────────────────────────────────────────────────
  const handlePublish = async () => {
    setPublishing(true);
    setPublishError(null);

    try {
      // 1. Сохраняем курс
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: info.title,
          description: info.desc,
          emoji: info.emoji,
          category: info.category,
          level: info.level,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // 2. Сохраняем уроки
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];

        const { data: savedLesson, error: lessonError } = await supabase
          .from("lessons")
          .insert({
            course_id: course.id,
            title: lesson.title,
            order_index: i,
          })
          .select()
          .single();

        if (lessonError) throw lessonError;

        // 3. Сохраняем блоки урока
        for (let j = 0; j < lesson.blocks.length; j++) {
          const block = lesson.blocks[j];
          const { error: blockError } = await supabase
            .from("blocks")
            .insert({
              lesson_id: savedLesson.id,
              type: block.type,
              content: block.type === "text"  ? { text: block.content }
                     : block.type === "video" ? { url: block.url }
                     : { question: block.question, options: block.options, correct: block.correct },
              order_index: j,
            });

          if (blockError) throw blockError;
        }
      }

      setDone(true);
    } catch (err) {
      console.error(err);
      setPublishError("Ошибка: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (done) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:480, width:"100%" }}>
        <SuccessScreen info={info} onReset={()=>{ setDone(false); setStep(0);
          setInfo({emoji:"🚀",title:"",desc:"",category:"Программирование",level:"Новичок",price:"",duration:""});
          setLessons([makeLesson()]); }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter', system-ui, sans-serif",
      color:C.text, padding:"20px 16px 100px" }}>
      <div style={{ maxWidth: step===1 ? 900 : 600, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <div style={{ fontSize:24 }}>🔨</div>
          <div>
            <h1 style={{ fontSize:18, fontWeight:800, margin:0, color:C.text }}>
              Конструктор курсов
            </h1>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>EduSnap Creator</p>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display:"flex", gap:16, marginBottom:28, flexWrap:"wrap" }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Step n={i+1} label={label} active={step===i} done={step>i} />
              {i < STEPS.length-1 && (
                <div style={{ width:24, height:1, background:C.border }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step===0 && (
            <StepInfo key="info" data={info} set={setInfoField} />
          )}
          {step===1 && (
            <StepLessons key="lessons" lessons={lessons} setLessons={setLessons} />
          )}
          {step===2 && (
            <StepPreview key="preview" info={info} lessons={lessons}
              onPublish={handlePublish} publishing={publishing} publishError={publishError} />
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 2 && (
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
            {step > 0
              ? <Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>
                  <IArrow left />Назад
                </Btn>
              : <div />
            }
            <Btn onClick={()=>setStep(s=>s+1)} disabled={!canNext}>
              {step===1 ? "Предпросмотр" : "Далее"} <IArrow />
            </Btn>
          </div>
        )}
        {step===2 && (
          <Btn variant="ghost" onClick={()=>setStep(1)} style={{ marginTop:16 }}>
            <IArrow left />Редактировать уроки
          </Btn>
        )}
      </div>
    </div>
  );
}