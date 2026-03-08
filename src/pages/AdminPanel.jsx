import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const ADMIN_PASSWORD = "edusnap2025";

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
  transition: "border-color 0.15s",
};

const textareaStyle = {
  ...inputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.6,
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [form, setForm] = useState({
    source_id: "", subject: "Биология", topic: "", subtopic: "",
    question: "", answer: "", solution: "", difficulty: "2",
    image_url: "", options: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function login() {
    if (pwInput === ADMIN_PASSWORD) { setAuthed(true); setPwError(""); }
    else setPwError("Неверный пароль");
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      setError("Вопрос и ответ обязательны"); return;
    }
    setSaving(true); setError(""); setSaved(false);

    const payload = {
      subject: form.subject || null,
      topic: form.topic || null,
      subtopic: form.subtopic || null,
      question: form.question.trim(),
      answer: form.answer.trim(),
      solution: form.solution.trim() || null,
      difficulty: form.difficulty ? parseInt(form.difficulty) : null,
      image_url: form.image_url.trim() || null,
      options: form.options.trim() || null,
      source_id: form.source_id.trim() || `manual_${Date.now()}`,
    };

    const { error: err } = await supabase.from("ege_tasks").insert([payload]);

    if (err) { setError(err.message); setSaving(false); return; }

    setSaved(true); setSaving(false);
    setForm(f => ({ ...f, source_id: "", question: "", answer: "", solution: "", image_url: "", options: "", topic: "", subtopic: "" }));
    setTimeout(() => setSaved(false), 3000);
  }

  // — AUTH GATE —
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, boxSizing: "border-box" }}>
        <div style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>🔐</div>
        <h2 style={{ color: S.text, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 20, margin: "0 0 20px" }}>
          Админ-панель
        </h2>
        <input
          type="password"
          value={pwInput}
          onChange={e => setPwInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="Пароль"
          autoFocus
          style={{ ...inputStyle, marginBottom: 10 }}
        />
        {pwError && <div style={{ color: S.redText, fontSize: 12, marginBottom: 10 }}>{pwError}</div>}
        <button onClick={login}
          style={{ width: "100%", background: S.primary, color: "#fff", padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}>
          Войти
        </button>
        <button onClick={() => navigate(-1)}
          style={{ width: "100%", background: "transparent", border: `1.5px solid ${S.border}`, color: S.textMuted, padding: "10px", borderRadius: 10, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
          ← Назад
        </button>
      </div>
    </div>
  );

  // — ADMIN FORM —
  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text, padding: "24px 16px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)}
            style={{ background: S.surfaceUp, border: "none", color: S.textMuted, width: 34, height: 34, borderRadius: 9, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ←
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Добавить задание</h1>
            <div style={{ fontSize: 12, color: S.textMuted, marginTop: 2 }}>edusnap · admin</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Row: subject + difficulty */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
            <Field label="Предмет">
              <select value={form.subject} onChange={e => set("subject", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Сложность">
              <select value={form.difficulty} onChange={e => set("difficulty", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>★ {d}</option>)}
              </select>
            </Field>
          </div>

          {/* Row: topic + subtopic */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Тема">
              <input value={form.topic} onChange={e => set("topic", e.target.value)}
                placeholder="Клетка, Генетика..." style={inputStyle} />
            </Field>
            <Field label="Подтема">
              <input value={form.subtopic} onChange={e => set("subtopic", e.target.value)}
                placeholder="Митоз, ДНК..." style={inputStyle} />
            </Field>
          </div>

          {/* Question */}
          <Field label="Вопрос *" hint="поддерживается HTML (<table>, <img> и т.д.)">
            <textarea value={form.question} onChange={e => set("question", e.target.value)}
              placeholder="Текст задания..." style={{ ...textareaStyle, minHeight: 120 }} />
          </Field>

          {/* Answer */}
          <Field label="Ответ *" hint="для мультивыбора: 134, для соответствия: 21342">
            <input value={form.answer} onChange={e => set("answer", e.target.value)}
              placeholder="Правильный ответ" style={inputStyle} />
          </Field>

          {/* Options */}
          <Field label="Варианты ответов" hint="разделяй через || (для single/multiselect)">
            <input value={form.options} onChange={e => set("options", e.target.value)}
              placeholder="Вариант 1 || Вариант 2 || Вариант 3" style={inputStyle} />
          </Field>

          {/* Solution */}
          <Field label="Решение / объяснение">
            <textarea value={form.solution} onChange={e => set("solution", e.target.value)}
              placeholder="Подробное объяснение для студента..." style={textareaStyle} />
          </Field>

          {/* Image URL + source_id */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
            <Field label="URL картинки">
              <input value={form.image_url} onChange={e => set("image_url", e.target.value)}
                placeholder="https://..." style={inputStyle} />
            </Field>
            <Field label="Source ID" hint="авто если пусто">
              <input value={form.source_id} onChange={e => set("source_id", e.target.value)}
                placeholder="manual_001" style={inputStyle} />
            </Field>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(127,29,29,0.3)", border: `1px solid ${S.red}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: S.redText }}>
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {saved && (
            <div style={{ background: "rgba(22,101,52,0.3)", border: `1px solid ${S.green}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: S.greenText }}>
              ✅ Задание сохранено в базу!
            </div>
          )}

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            style={{ background: saving ? S.surfaceUp : S.primary, color: saving ? S.textMuted : "#fff", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", transition: "background 0.15s" }}>
            {saving ? "Сохраняем..." : "💾 Сохранить задание"}
          </button>

          {/* Quick tip */}
          <div style={{ background: S.surfaceUp, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: S.textDim, lineHeight: 1.6 }}>
            <strong style={{ color: S.textMuted }}>Типы заданий автоматически:</strong><br />
            • <code style={{ color: "#a5b4fc" }}>single</code> — варианты через || + ответ одна буква<br />
            • <code style={{ color: "#a5b4fc" }}>multiselect</code> — варианты через || + ответ типа «134»<br />
            • <code style={{ color: "#a5b4fc" }}>sequence</code> — ответ цифры + слово «последовательность» в вопросе<br />
            • <code style={{ color: "#a5b4fc" }}>match</code> — вопрос содержит таблицу + ответ цифры<br />
            • <code style={{ color: "#a5b4fc" }}>text</code> — всё остальное
          </div>
        </div>
      </div>
    </div>
  );
}