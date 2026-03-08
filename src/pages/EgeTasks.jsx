import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const SUBJECTS = ["Математика", "Русский язык", "Физика", "Химия", "Биология", "История", "Обществознание", "Информатика"];
const DIFFICULTIES = ["Лёгкое", "Среднее", "Сложное"];

const emptyForm = {
  subject: "Математика",
  topic: "",
  subtopic: "",
  question: "",
  answer: "",
  solution: "",
  difficulty: "Среднее",
  image_url: "",
  options: "",
};

const diffColor = { "Лёгкое": "#22c55e", "Среднее": "#f59e0b", "Сложное": "#ef4444" };

export default function EgeTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterSubject, setFilterSubject] = useState("Все");
  const [expandedId, setExpandedId] = useState(null);
  const [optionsList, setOptionsList] = useState(["", "", "", ""]);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase.from("ege_tasks").select("*");
    setTasks(data || []);
    setLoading(false);
  }

  function openNew() {
    setForm(emptyForm);
    setOptionsList(["", "", "", ""]);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(task) {
    setForm({
      subject: task.subject || "Математика",
      topic: task.topic || "",
      subtopic: task.subtopic || "",
      question: task.question || "",
      answer: task.answer || "",
      solution: task.solution || "",
      difficulty: task.difficulty || "Среднее",
      image_url: task.image_url || "",
      options: task.options || "",
    });
    try {
      const parsed = task.options ? JSON.parse(task.options) : [];
      const padded = [...parsed, "", "", "", ""].slice(0, Math.max(4, parsed.length));
      setOptionsList(padded);
    } catch {
      setOptionsList(["", "", "", ""]);
    }
    setEditId(task.id);
    setShowForm(true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ege-images").upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from("ege-images").getPublicUrl(fileName);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
    }
    setUploading(false);
  }

  function updateOption(i, val) {
    const updated = [...optionsList];
    updated[i] = val;
    setOptionsList(updated);
  }

  function addOption() {
    setOptionsList((prev) => [...prev, ""]);
  }

  function removeOption(i) {
    setOptionsList((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!form.question || !form.answer) return;
    setSaving(true);
    const filledOptions = optionsList.filter((o) => o.trim() !== "");
    const optionsJson = filledOptions.length >= 2 ? JSON.stringify(filledOptions) : "";
    const dataToSave = { ...form, options: optionsJson };
    if (editId) {
      await supabase.from("ege_tasks").update(dataToSave).eq("id", editId);
    } else {
      await supabase.from("ege_tasks").insert(dataToSave);
    }
    await fetchTasks();
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Удалить задание?")) return;
    await supabase.from("ege_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = filterSubject === "Все" ? tasks : tasks.filter((t) => t.subject === filterSubject);

  const inp = {
    width: "100%", background: "#2d2d2d", border: "none",
    borderRadius: 10, padding: "12px", color: "#fff",
    fontSize: 15, boxSizing: "border-box",
  };

  const LABELS = ["A", "B", "C", "D", "E", "F"];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Задания ЕГЭ</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{tasks.length} заданий</p>
        </div>
        <button onClick={openNew} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          + Добавить
        </button>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <button
          onClick={() => navigate(`/ege/test${filterSubject !== "Все" ? `?subject=${filterSubject}` : ""}`)}
          style={{
            width: "100%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff", border: "none", borderRadius: 14, padding: "14px",
            fontWeight: 700, fontSize: 16, cursor: "pointer", letterSpacing: 0.3,
          }}
        >
          🚀 Начать тест {filterSubject !== "Все" ? `· ${filterSubject}` : ""}
        </button>
      </div>

      <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {["Все", ...SUBJECTS].map((s) => (
          <button key={s} onClick={() => setFilterSubject(s)} style={{
            background: filterSubject === s ? "#7c3aed" : "#1e1e1e",
            color: filterSubject === s ? "#fff" : "#aaa",
            border: "none", borderRadius: 20, padding: "6px 14px",
            cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, fontWeight: 500,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: 60 }}>Загрузка...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: 60 }}>Нет заданий. Добавь первое!</p>
        ) : (
          filtered.map((task) => (
            <div key={task.id} style={{ background: "#1a1a1a", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
              <div onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                style={{ padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#2d2d2d", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#ccc" }}>{task.subject}</span>
                    {task.topic && <span style={{ background: "#2d2d2d", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#ccc" }}>{task.topic}</span>}
                    {task.subtopic && <span style={{ background: "#2d2d2d", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#aaa" }}>{task.subtopic}</span>}
                    {task.difficulty && (
                      <span style={{ borderRadius: 8, padding: "3px 10px", fontSize: 12, color: diffColor[task.difficulty] || "#aaa", background: "#2d2d2d" }}>
                        {task.difficulty}
                      </span>
                    )}
                    {(() => { try { const o = task.options ? JSON.parse(task.options) : []; return Array.isArray(o) && o.length >= 2; } catch { return false; } })() && (
                      <span style={{ background: "#1a3a2a", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#4ade80" }}>с вариантами</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#e5e5e5" }}>
                    {task.question.length > 120 && expandedId !== task.id
                      ? task.question.slice(0, 120) + "..."
                      : task.question}
                  </p>
                </div>
                <span style={{ color: "#555", marginLeft: 12, fontSize: 18 }}>{expandedId === task.id ? "▲" : "▼"}</span>
              </div>

              {expandedId === task.id && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #2a2a2a" }}>
                  {task.image_url && (
                    <img src={task.image_url} alt="задание" style={{ width: "100%", borderRadius: 10, marginTop: 14, objectFit: "contain", maxHeight: 300 }} />
                  )}
                  <div style={{ marginTop: 14, background: "#222", borderRadius: 10, padding: 14 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Ответ</p>
                    <p style={{ margin: 0, fontWeight: 700, color: "#22c55e", fontSize: 16 }}>{task.answer}</p>
                  </div>
                  {task.solution && (
                    <div style={{ marginTop: 10, background: "#222", borderRadius: 10, padding: 14 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Решение</p>
                      <p style={{ margin: 0, color: "#ccc", fontSize: 14, lineHeight: 1.6 }}>{task.solution}</p>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button onClick={() => openEdit(task)} style={{ flex: 1, background: "#2d2d2d", color: "#fff", border: "none", borderRadius: 10, padding: 10, cursor: "pointer", fontWeight: 600 }}>
                      ✏️ Редактировать
                    </button>
                    <button onClick={() => handleDelete(task.id)} style={{ flex: 1, background: "#2d1a1a", color: "#ef4444", border: "none", borderRadius: 10, padding: 10, cursor: "pointer", fontWeight: 600 }}>
                      🗑 Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#1a1a1a", borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "24px 20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{editId ? "Редактировать" : "Новое задание"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#888", fontSize: 24, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Предмет</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inp}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Тема</label>
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Например: Алгебра" style={inp} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Подтема</label>
              <input value={form.subtopic} onChange={(e) => setForm({ ...form, subtopic: e.target.value })} placeholder="Например: Квадратные уравнения" style={inp} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Сложность</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={inp}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Вопрос *</label>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                rows={4} placeholder="Текст задания..." style={{ ...inp, resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Картинка (необязательно)</label>
              <label style={{ display: "block", background: "#2d2d2d", borderRadius: 10, padding: "12px", textAlign: "center", cursor: "pointer", color: uploading ? "#888" : "#a78bfa" }}>
                {uploading ? "Загружаем..." : form.image_url ? "✅ Картинка загружена" : "📎 Выбрать файл"}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploading} />
              </label>
              {form.image_url && (
                <div style={{ marginTop: 8, position: "relative" }}>
                  <img src={form.image_url} alt="preview" style={{ width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "contain" }} />
                  <button onClick={() => setForm({ ...form, image_url: "" })}
                    style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", border: "none", borderRadius: 8, color: "#fff", padding: "4px 8px", cursor: "pointer" }}>
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* ВАРИАНТЫ ОТВЕТОВ */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: "#888" }}>Варианты ответов</label>
                <span style={{ fontSize: 11, color: "#555" }}>заполни мин. 2 чтобы активировать</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {optionsList.map((opt, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%", background: "#2d2d2d",
                      color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {LABELS[i] || i + 1}
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Вариант ${LABELS[i] || i + 1}`}
                      style={{ ...inp, flex: 1 }}
                    />
                    {optionsList.length > 2 && (
                      <button onClick={() => removeOption(i)} style={{
                        background: "#2d1a1a", border: "none", color: "#ef4444",
                        borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                        fontSize: 18, flexShrink: 0,
                      }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              {optionsList.length < 6 && (
                <button onClick={addOption} style={{
                  marginTop: 10, background: "#2d2d2d", border: "none", color: "#a78bfa",
                  borderRadius: 10, padding: "10px", width: "100%", cursor: "pointer", fontSize: 14,
                }}>
                  + Добавить вариант
                </button>
              )}
              <p style={{ fontSize: 11, color: "#555", margin: "8px 0 0" }}>
                Правильный ответ ниже должен совпадать с одним из вариантов
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Ответ *</label>
              <input value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Правильный ответ" style={inp} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Решение (необязательно)</label>
              <textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })}
                rows={4} placeholder="Разбор решения..." style={{ ...inp, resize: "vertical" }} />
            </div>

            <button onClick={handleSave} disabled={saving || uploading} style={{
              width: "100%", background: "#7c3aed", color: "#fff", border: "none",
              borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 16,
              cursor: "pointer", opacity: saving || uploading ? 0.6 : 1,
            }}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}