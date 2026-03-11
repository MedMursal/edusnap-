import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";

const SUBJECTS = [
  { key: "все", label: "Все предметы", emoji: "🧠" },
  { key: "биология", label: "Биология", emoji: "🌿" },
  { key: "химия", label: "Химия", emoji: "⚗️" },
  { key: "физика", label: "Физика", emoji: "⚡" },
  { key: "русский", label: "Русский", emoji: "📝" },
];

export default function SpacedRepetition({ t }) {
  const navigate = useNavigate();
  const { tgUser, dbUser } = useUser();
  const [selectedSubject, setSelectedSubject] = useState("все");
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCounts(); }, [tgUser, dbUser]);

  async function fetchCounts() {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    setLoading(true);

    const { data: srRows } = await supabase
      .from("spaced_repetition")
      .select("task_id")
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString());

    if (!srRows?.length) { setCounts({}); setLoading(false); return; }

    const taskIds = srRows.map(r => r.task_id);
    const { data: tasks } = await supabase
      .from("ege_tasks")
      .select("id, subject")
      .in("id", taskIds);

    const c = {};
    (tasks || []).forEach(tk => {
      const s = (tk.subject || "").toLowerCase().trim();
      c[s] = (c[s] || 0) + 1;
    });
    setCounts(c);
    setLoading(false);
  }

  async function startReview(subject) {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;

    const { data: srRows } = await supabase
      .from("spaced_repetition")
      .select("task_id")
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString())
      .limit(100);

    if (!srRows?.length) return;
    const taskIds = srRows.map(r => r.task_id);

    let q = supabase.from("ege_tasks").select("id").in("id", taskIds);
    if (subject !== "все") q = q.eq("subject", subject);
    const { data: tasks } = await q.limit(20);

    if (!tasks?.length) return;
    const ids = tasks.map(t => t.id).join(",");
    navigate(`/ege/test?sr_ids=${ids}`);
  }

  const totalDue = Object.values(counts).reduce((a, b) => a + b, 0);
  const dueForSelected = selectedSubject === "все" ? totalDue : (counts[selectedSubject] || 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: t.textMuted }}>Загружаем...</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, paddingBottom: 100 }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: t.surface, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/profile")} style={{ background: t.surfaceUp, border: "none", color: t.textMuted, width: 36, height: 36, borderRadius: 999, fontSize: 17, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Интервальное повторение</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Умный алгоритм запоминания</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 16px 0" }}>

        {/* Выбор предмета */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20, scrollbarWidth: "none" }}>
          {SUBJECTS.map(s => {
            const cnt = s.key === "все" ? totalDue : (counts[s.key] || 0);
            const active = selectedSubject === s.key;
            return (
              <button key={s.key} onClick={() => setSelectedSubject(s.key)} style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: `2px solid ${active ? t.primary : t.border}`,
                background: active ? `${t.primary}22` : t.surface,
                color: active ? t.primary : t.textMuted,
                transition: "all 0.15s",
              }}>
                <span>{s.emoji}</span>
                <span>{s.label}</span>
                {cnt > 0 && (
                  <span style={{ background: active ? t.primary : t.surfaceUp, color: active ? "#fff" : t.textMuted, borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {dueForSelected === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Всё повторено!</div>
            <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 24 }}>
              {selectedSubject === "все"
                ? "Нет заданий для повторения. Решай новые — неправильные появятся здесь."
                : `По предмету «${selectedSubject}» нет заданий для повторения.`}
            </div>
            <button onClick={() => navigate("/ege")} style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, color: "#fff", padding: "14px 32px", borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none" }}>
              К заданиям
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: t.surface, borderRadius: 20, padding: 24, marginBottom: 16, border: `1px solid ${t.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>
                {SUBJECTS.find(s => s.key === selectedSubject)?.emoji || "🧠"}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: t.primary }}>{dueForSelected}</div>
              <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 20 }}>
                {dueForSelected === 1 ? "задание ждёт повторения" : dueForSelected < 5 ? "задания ждут повторения" : "заданий ждут повторения"}
                {selectedSubject !== "все" && <span style={{ color: t.primary, fontWeight: 700 }}> · {selectedSubject}</span>}
              </div>
              <button onClick={() => startReview(selectedSubject)} style={{ width: "100%", background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, color: "#fff", padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: `0 4px 20px ${t.primaryGlow}` }}>
                🚀 Начать повторение
              </button>
            </div>

            {/* Разбивка по предметам если выбрано "все" */}
            {selectedSubject === "все" && Object.keys(counts).length > 0 && (
              <div style={{ background: t.surface, borderRadius: 16, padding: 16, marginBottom: 16, border: `1px solid ${t.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>По предметам</div>
                {Object.entries(counts).map(([subj, cnt], i, arr) => {
                  const s = SUBJECTS.find(s => s.key === subj) || { emoji: "📚", label: subj };
                  return (
                    <div key={subj} onClick={() => setSelectedSubject(subj)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{s.emoji}</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ background: `${t.primary}22`, color: t.primary, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 800 }}>{cnt}</span>
                        <span style={{ color: t.textMuted, fontSize: 14 }}>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ background: t.surface, borderRadius: 16, padding: 16, border: `1px solid ${t.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Как работает алгоритм</div>
              {[
                { icon: "❌", text: "Неправильный ответ", sub: "Задание появится завтра" },
                { icon: "✅", text: "Правильно 1 раз", sub: "Повторение через 3 дня" },
                { icon: "✅✅", text: "Правильно 2 раза", sub: "Повторение через 7 дней" },
                { icon: "🏆", text: "Правильно 3 раза", sub: "Задание выучено!" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${t.border}` : "none" }}>
                  <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}