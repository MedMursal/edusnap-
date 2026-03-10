import { useNavigate, useLocation } from "react-router-dom"
import { Home, BookOpen, User } from "lucide-react"
import { useState } from "react"

export default function BottomNav({ t }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [pressed, setPressed] = useState(null)

  if (location.pathname === "/ege/test") return null

  const tabs = [
    { path: "/",        icon: Home,     label: "Главная" },
    { path: "/ege",     icon: BookOpen, label: "ЕГЭ"     },
    { path: "/profile", icon: User,     label: "Профиль" },
  ]

  function handleTab(path) {
    setPressed(path)
    setTimeout(() => setPressed(null), 300)
    navigate(path)
  }

  return (
    <>
      <style>{`
        .bnav-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; background: none; border: none; cursor: pointer;
          flex: 1; padding: 8px 4px 4px; position: relative;
          transition: color 0.2s; -webkit-tap-highlight-color: transparent;
        }
        .bnav-btn:active .bnav-icon { animation: duo-bounce 0.28s ease; }
        .bnav-pill {
          position: absolute; top: 0; left: 12%; right: 12%;
          height: 3px; border-radius: 0 0 4px 4px;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bnav-label {
          font-size: 10px; font-weight: 700;
          font-family: 'Nunito', sans-serif;
          letter-spacing: 0.01em;
          transition: all 0.2s;
        }
        .bnav-icon-wrap {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 16px;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bnav-btn.active .bnav-icon-wrap {
          transform: translateY(-3px);
        }
      `}</style>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: t.surface,
        borderTop: `2px solid ${t.border}`,
        display: "flex",
        padding: "0 8px 20px",
        paddingBottom: `max(20px, env(safe-area-inset-bottom))`,
      }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path

          return (
            <button
              key={path}
              className={`bnav-btn${active ? " active" : ""}`}
              onClick={() => handleTab(path)}
              style={{ color: active ? t.primary : t.textMuted }}
            >
              {/* Активный индикатор сверху */}
              <div className="bnav-pill" style={{
                background: active ? t.primary : "transparent",
                opacity: active ? 1 : 0,
              }} />

              {/* Иконка с подложкой */}
              <div className="bnav-icon-wrap bnav-icon" style={{
                background: active ? t.secondary : "transparent",
              }}>
                <Icon
                  size={active ? 22 : 20}
                  strokeWidth={active ? 2.8 : 1.8}
                />
              </div>

              {/* Подпись */}
              <span className="bnav-label" style={{
                color: active ? t.primary : t.textMuted,
                opacity: active ? 1 : 0.7,
                transform: active ? "scale(1.05)" : "scale(1)",
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}