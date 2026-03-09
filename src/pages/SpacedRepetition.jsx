import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";

const INTERVALS = [1, 3, 7, 14]; // дни по стрику 0,1,2,3+

export default function SpacedRepetition({ t }) {
  const navigate = useNavigate();
  const { tgUser, dbUser } = useUser();
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDueCount(); }, [tgUser, dbUser]);

  async function fetchDueCount() {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    setLoading(true);
    const { count } = await supabase
      .from("spaced_repetition")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString());
    setDueCount(count || 0);
    setLoading(false);
  }

  async function startReview() {
    const userId = tgUser?.id || dbUser?.id;
    if (!userId) return;
    const { data: srRows } = await supabase
      .from("spaced_repetition")
      .select("task_id")
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString())
      .limit(20);
    if (!srRows?.length) return;
    const ids = srRows.map(r => r.task_id).join(",");
    navigate(`/ege/test?sr_ids=${ids}`);
  }

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
            <div style={{ fontSize: 12, color: t.textMuted }}>Умный алгоритм повторения</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "88px 16px 0" }}>
        {dueCount === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Всё повторено!</div>
            <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 24 }}>Нет заданий для повторения сейчас. Решай новые задания — неправильные появятся здесь.</div>
            <button onClick={() => navigate("/ege")} style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, color: "#fff", padding: "14px 32px", borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none" }}>
              К заданиям
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: t.surface, borderRadius: 20, padding: 24, marginBottom: 16, border: `1px solid ${t.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🧠</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: t.primary }}>{dueCount}</div>
              <div style={{ fontSize: 15, color: t.textMuted, marginBottom: 20 }}>
                {dueCount === 1 ? "задание ждёт повторения" : dueCount < 5 ? "задания ждут повторения" : "заданий ждут повторения"}
              </div>
              <button onClick={startReview} style={{ width: "100%", background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, color: "#fff", padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: `0 4px 20px ${t.primaryGlow}` }}>
                🚀 Начать повторение
              </button>
            </div>

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