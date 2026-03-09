import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";

const ADMIN_ID = 5015547885;

const S = {
  bg: "#030712", surface: "#111827", surfaceUp: "#1f2937", border: "#374151",
  primary: "#6366f1", text: "#f9fafb", textMuted: "#9ca3af", textDim: "#6b7280",
  green: "#16a34a", greenText: "#4ade80", red: "#dc2626", redText: "#f87171",
};

const SUBJECTS = ["Биология", "Химия", "Физика", "Математика", "Русский язык"];
const DIFFICULTIES = ["1", "2", "3", "4", "5"];

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: S.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
        {hint && <span style={{ fontSize: 11, color: S.textDim, textTransform: "none", fontWeight: 400, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: S.surfaceUp, border: `1.5px solid ${S.border}`, color: S.text,
  borderRadius: 10, padding: "10px 13px", fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box", fontFamily: "inherit",
};
const textareaStyle = { ...inputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.6 };

function SearchTab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true); setNotFound(false); setResult(null); setForm(null); setSaved(false);
    const { data } = await supabase.from("ege_tasks").select("*").ilike("id", `${query.trim()}%`).limit(1);
    setSearching(false);
    if (!data || data.length === 0) { setNotFound(true); return; }
    const task = data[0];
    setResult(task);
    setForm({
      question: task.question || "",
      answer: task.answer || "",
      solution: task.solution || "",
      topic: task.topic || "",
      subtopic: task.subtopic || "",
      options: task.options || "",
      subject: task.subject || "Биология",
      difficulty: String(task.difficulty || "2"),
    });
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true); setError(""); setSaved(false);
    const { error: err } = await supabase.from("ege_tasks").update({
      question: form.question.trim(),
      answer: form.answer.trim(),
      solution: form.solution.trim() || null,
      topic: form.topic.trim() || null,
      subtopic: form.subtopic.trim() || null,
      options: form.options.trim() || null,
      subject: form.subject || null,
      difficulty: form.difficulty ? parseInt(form.difficulty) : null,
    }).eq("id", result.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleDelete() {
    if (!result) return;
    if (!window.confirm(`Удалить задание #${result.id.slice(0,6)}? Это необратимо.`)) return;
    await supabase.from("ege_tasks").delete().eq("id", result.id);
    setResult(null); setForm(null); setQuery("");
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Введи ID задания (первые 6 символов)..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={handleSearch} disabled={searching} style={{ background: S.primary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", flexShrink: 0 }}>
          {searching ? "..." : "🔍"}
        </button>
      </div>

      {notFound && <div style={{ textAlign: "center", color: S.textMuted, fontSize: 14, padding: 20 }}>Задание не найдено</div>}

      {form && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: S.surfaceUp, borderRadius: 10, padding: "8px 12px", fontSize: 11, color: S.textMuted, fontFamily: "monospace" }}>
            ID: {result.id} · Линия: {result.line_number || "—"} · Создано: {new Date(result.created_at).toLocaleDateString("ru")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
            <Field label="Предмет">
              <select value={form.subject} onChange={e => set("subject", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Сложность">
              <select value={form.difficulty} onChange={e => set("difficulty", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>★ {d}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Тема"><input value={form.topic} onChange={e => set("topic", e.target.value)} style={inputStyle} /></Field>
            <Field label="Подтема"><input value={form.subtopic} onChange={e => set("subtopic", e.target.value)} style={inputStyle} /></Field>
          </div>

          <Field label="Вопрос"><textarea value={form.question} onChange={e => set("question", e.target.value)} style={{ ...textareaStyle, minHeight: 120 }} /></Field>
          <Field label="Ответ"><input value={form.answer} onChange={e => set("answer", e.target.value)} style={inputStyle} /></Field>
          <Field label="Варианты (через ||)"><input value={form.options} onChange={e => set("options", e.target.value)} style={inputStyle} /></Field>
          <Field label="Объяснение"><textarea value={form.solution} onChange={e => set("solution", e.target.value)} style={textareaStyle} /></Field>

          {error && <div style={{ background: "rgba(127,29,29,0.3)", border: `1px solid ${S.red}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: S.redText }}>⚠️ {error}</div>}
          {saved && <div style={{ background: "rgba(22,101,52,0.3)", border: `1px solid ${S.green}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: S.greenText }}>✅ Сохранено!</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: saving ? S.surfaceUp : S.primary, color: saving ? S.textMuted : "#fff", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}>
              {saving ? "Сохраняем..." : "💾 Сохранить"}
            </button>
            <button onClick={handleDelete} style={{ background: "rgba(127,29,29,0.3)", color: S.redText, padding: "13px 16px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", border: `1px solid ${S.red}` }}>
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsTab() {
  const [users, setUsers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    setLoading(true);
    const [{ data: u }, { data: a }] = await Promise.all([
      supabase.from("users").select("*").order("total_tasks", { ascending: false }),
      supabase.from("user_answers").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(u || []);
    setAnswers(a || []);
    setLoading(false);
  }

  function exportCSV() {
    const rows = users.map(u => {
      const ua = answers.filter(a => a.user_id === u.id);
      const total = ua.length;
      const correct = ua.filter(a => a.is_correct).length;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const topicMap = {};
      ua.forEach(a => { const k = a.topic || "Без темы"; if (!topicMap[k]) topicMap[k] = { correct: 0, total: 0 }; topicMap[k].total++; if (a.is_correct) topicMap[k].correct++; });
      const top3 = Object.entries(topicMap).map(([k, v]) => ({ k, errors: v.total - v.correct })).sort((a, b) => b.errors - a.errors).slice(0, 3).map(({ k, errors }) => `${k}(${errors} ош.)`).join("; ");
      const accuracy = Object.entries(topicMap).map(([k, v]) => `${k}: ${Math.round((v.correct / v.total) * 100)}%`).join("; ");
      const lineMap = {};
      ua.filter(a => !a.is_correct && a.line_number).forEach(a => { lineMap[`Линия ${a.line_number}`] = (lineMap[`Линия ${a.line_number}`] || 0) + 1; });
      const weakLines = Object.entries(lineMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k}(${v})`).join("; ");
      const wrongTasks = ua.filter(a => !a.is_correct).slice(0, 5).map(a => `ID:${a.task_id} дал:${a.user_answer || "—"} верно:${a.correct_answer || "—"}`).join("; ");
      const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || "Без имени";
      return [u.id, name, u.username || "", u.total_tasks || 0, total, correct, `${pct}%`, u.streak || 0, top3, accuracy, weakLines, wrongTasks];
    });
    const headers = ["ID","Имя","Username","Всего решено","С проверкой","Правильно","Точность","Стрик","Топ-3 слабые темы","Точность по темам","Слабые линии ЕГЭ","Последние ошибки"];
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `edusnap_stats_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  }

  if (loading) return <div style={{ color: S.textMuted, padding: 20 }}>Загружаем статистику...</div>;

  const totalAnswers = answers.length;
  const correctAnswers = answers.filter(a => a.is_correct).length;
  const globalPct = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ label: "Пользователей", value: users.length }, { label: "Ответов", value: totalAnswers }, { label: "Точность", value: `${globalPct}%` }].map(({ label, value }) => (
          <div key={label} style={{ background: S.surfaceUp, borderRadius: 12, padding: "14px 12px", textAlign: "center", border: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: S.text }}>{value}</div>
            <div style={{ fontSize: 11, color: S.textMuted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <button onClick={exportCSV} style={{ width: "100%", background: S.green, color: "#fff", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", marginBottom: 16 }}>📥 Скачать CSV со статистикой</button>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["users", "Пользователи"], ["errors", "Ошибки по темам"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `2px solid ${tab === t ? S.primary : S.border}`, background: tab === t ? "rgba(99,102,241,0.15)" : S.surfaceUp, color: tab === t ? S.primary : S.textMuted }}>{label}</button>
        ))}
      </div>
      {tab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map(u => {
            const ua = answers.filter(a => a.user_id === u.id);
            const total = ua.length; const correct = ua.filter(a => a.is_correct).length;
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            const errorsByTopic = {};
            ua.filter(a => !a.is_correct).forEach(a => { const k = a.topic || "Без темы"; errorsByTopic[k] = (errorsByTopic[k] || 0) + 1; });
            const top3 = Object.entries(errorsByTopic).sort((a, b) => b[1] - a[1]).slice(0, 3);
            return (
              <div key={u.id} style={{ background: S.surfaceUp, borderRadius: 12, padding: "12px 14px", border: `1px solid ${S.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: S.text }}>{[u.first_name, u.last_name].filter(Boolean).join(" ") || "Без имени"}</div>
                    <div style={{ fontSize: 11, color: S.textMuted }}>@{u.username || u.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: pct >= 70 ? S.greenText : S.redText }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: S.textMuted }}>{correct}/{total}</div>
                  </div>
                </div>
                <div style={{ height: 4, background: S.border, borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", background: pct >= 70 ? S.green : S.red, width: `${pct}%`, borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 11, color: S.textMuted, marginBottom: top3.length ? 6 : 0 }}>Решено: {u.total_tasks || 0} · Стрик: {u.streak || 0}🔥</div>
                {top3.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {top3.map(([topic, count]) => (
                      <span key={topic} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(220,38,38,0.15)", color: S.redText }}>{topic} · {count} ош.</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {tab === "errors" && (() => {
        const errorsByTopic = {};
        answers.filter(a => !a.is_correct).forEach(a => { const k = a.topic || "Без темы"; errorsByTopic[k] = (errorsByTopic[k] || 0) + 1; });
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(errorsByTopic).sort((a, b) => b[1] - a[1]).map(([topic, count]) => (
              <div key={topic} style={{ background: S.surfaceUp, borderRadius: 12, padding: "10px 14px", border: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: S.text }}>{topic}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.redText }}>{count} ошибок</div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { dbUser } = useUser();
  const [activeTab, setActiveTab] = useState("search");
  const [form, setForm] = useState({ source_id: "", subject: "Биология", topic: "", subtopic: "", question: "", answer: "", solution: "", difficulty: "2", image_url: "", options: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (dbUser && dbUser.id !== ADMIN_ID) {
    return <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: S.redText, fontSize: 16 }}>⛔ Доступ запрещён</div></div>;
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) { setError("Вопрос и ответ обязательны"); return; }
    setSaving(true); setError(""); setSaved(false);
    const payload = { subject: form.subject || null, topic: form.topic || null, subtopic: form.subtopic || null, question: form.question.trim(), answer: form.answer.trim(), solution: form.solution.trim() || null, difficulty: form.difficulty ? parseInt(form.difficulty) : null, image_url: form.image_url.trim() || null, options: form.options.trim() || null, source_id: form.source_id.trim() || `manual_${Date.now()}` };
    const { error: err } = await supabase.from("ege_tasks").insert([payload]);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setForm(f => ({ ...f, source_id: "", question: "", answer: "", solution: "", image_url: "", options: "", topic: "", subtopic: "" }));
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text, padding: "24px 16px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ background: S.surfaceUp, border: "none", color: S.textMuted, width: 34, height: 34, borderRadius: 9, fontSize: 17, cursor: "pointer" }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Админ-панель</h1>
            <div style={{ fontSize: 12, color: S.textMuted }}>edusnap · admin</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["search", "🔍 Поиск"], ["add", "➕ Добавить"], ["stats", "📊 Статистика"]].map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `2px solid ${activeTab === t ? S.primary : S.border}`, background: activeTab === t ? "rgba(99,102,241,0.15)" : S.surfaceUp, color: activeTab === t ? S.primary : S.textMuted }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "search" && <SearchTab />}
        {activeTab === "stats" && <StatsTab />}

        {activeTab === "add" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
              <Field label="Предмет"><select value={form.subject} onChange={e => set("subject", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
              <Field label="Сложность"><select value={form.difficulty} onChange={e => set("difficulty", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{DIFFICULTIES.map(d => <option key={d} value={d}>★ {d}</option>)}</select></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Тема"><input value={form.topic} onChange={e => set("topic", e.target.value)} placeholder="Клетка, Генетика..." style={inputStyle} /></Field>
              <Field label="Подтема"><input value={form.subtopic} onChange={e => set("subtopic", e.target.value)} placeholder="Митоз, ДНК..." style={inputStyle} /></Field>
            </div>
            <Field label="Вопрос *" hint="поддерживается HTML"><textarea value={form.question} onChange={e => set("question", e.target.value)} placeholder="Текст задания..." style={{ ...textareaStyle, minHeight: 120 }} /></Field>
            <Field label="Ответ *"><input value={form.answer} onChange={e => set("answer", e.target.value)} placeholder="Правильный ответ" style={inputStyle} /></Field>
            <Field label="Варианты ответов" hint="через ||"><input value={form.options} onChange={e => set("options", e.target.value)} placeholder="Вариант 1 || Вариант 2 || Вариант 3" style={inputStyle} /></Field>
            <Field label="Решение / объяснение"><textarea value={form.solution} onChange={e => set("solution", e.target.value)} placeholder="Подробное объяснение..." style={textareaStyle} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
              <Field label="URL картинки"><input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." style={inputStyle} /></Field>
              <Field label="Source ID" hint="авто если пусто"><input value={form.source_id} onChange={e => set("source_id", e.target.value)} placeholder="manual_001" style={inputStyle} /></Field>
            </div>
            {error && <div style={{ background: "rgba(127,29,29,0.3)", border: `1px solid ${S.red}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: S.redText }}>⚠️ {error}</div>}
            {saved && <div style={{ background: "rgba(22,101,52,0.3)", border: `1px solid ${S.green}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: S.greenText }}>✅ Задание сохранено!</div>}
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? S.surfaceUp : S.primary, color: saving ? S.textMuted : "#fff", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none" }}>
              {saving ? "Сохраняем..." : "💾 Сохранить задание"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}