import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useUser } from "../App";

export default function WorkOnErrors({ t }) {
  const navigate = useNavigate();
  const { tgUser } = useUser();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("topic"); // "topic" | "line"

  useEffect(() => { if (tgUser?.id) fetchErrors(); }, [tgUser]);

  async function fetchErrors() {
    setLoading(true);
    // Берём все ответы пользователя
    const { data } = await supabase
      .from("user_answers")
      .select("*")
      .eq("user_id", tgUser.id)
      .order("created_at", { ascending: false });

    // Для каждого task_id берём только последний ответ
    const latestByTask = {};
    (data || []).forEach(row => {
      if (!latestByTask[row.task_id]) latestByTask[row.task_id] = row;
    });

    // Оставляем только те где последний ответ неправильный
    const errors = Object.values(latestByTask).filter(r => !r.is_correct);
    setErrors(errors);
    setLoading(false);
  }

  // Группировка ошибок
  const groups = {};
  errors.forEach(e => {
    const key = groupBy === "line"
      ? `Линия ${e.line_number || "?"}`
      : (e.topic || "Без темы");
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  // Уникальные task_id для персонализированного теста
  const uniqueTaskIds = [...new Set(errors.map(e => e.task_id))];

  function startPersonalTest(taskIds) {
    navigate(`/ege/test?error_ids=${taskIds.join(",")}`);
  }

  if (!tgUser) return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: t.textMuted, fontSize: 15 }}>Войди через Telegram</span>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: t.textMuted, fontSize: 15 }}>Загружаем ошибки...</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, background: t.surface, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/profile")} style={{ background: t.surfaceUp, border: "none", color: t.textMuted, width: 36, height: 36, borderRadius: 999, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Работа над ошибками</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>{uniqueTaskIds.length} заданий с ошибками</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "76px 16px 0" }}>

        {errors.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ошибок нет!</div>
            <div style={{ color: t.textMuted, fontSize: 14 }}>Ты решаешь всё правильно</div>
          </div>
        ) : (<>

          {/* Кнопка персонализированного теста */}
          <button
            onClick={() => startPersonalTest(uniqueTaskIds.slice(0, 20))}
            style={{ width: "100%", background: `linear-gradient(135deg, ${t.primary}, ${t.primaryBright})`, color: "#fff", padding: 16, borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: `0 4px 20px ${t.primaryGlow}`, marginBottom: 16 }}>
            🎯 Пройти тест по ошибкам ({Math.min(uniqueTaskIds.length, 20)} заданий)
          </button>

          {/* Переключатель группировки */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["topic", "line"].map(g => (
              <button key={g} onClick={() => setGroupBy(g)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `2px solid ${groupBy === g ? t.primary : t.border}`, background: groupBy === g ? t.secondary : t.surface, color: groupBy === g ? t.primary : t.textMuted }}>
                {g === "topic" ? "По темам" : "По линиям"}
              </button>
            ))}
          </div>

          {/* Группы ошибок */}
          {Object.entries(groups).sort((a, b) => b[1].length - a[1].length).map(([groupName, items]) => {
            const groupTaskIds = [...new Set(items.map(e => e.task_id))];
            const errorPct = Math.round((items.length / errors.length) * 100);
            return (
              <div key={groupName} style={{ background: t.surface, borderRadius: 16, padding: 14, marginBottom: 10, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{groupName}</div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>{items.length} ошибок · {groupTaskIds.length} заданий</div>
                  </div>
                  <button
                    onClick={() => startPersonalTest(groupTaskIds)}
                    style={{ background: t.secondary, color: t.primary, border: "none", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Тренировать
                  </button>
                </div>
                {/* Прогресс-бар */}
                <div style={{ height: 4, background: t.surfaceUp, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: t.error, borderRadius: 999, width: `${errorPct}%` }} />
                </div>
              </div>
            );
          })}
        </>)}
      </div>
    </div>
  );
}