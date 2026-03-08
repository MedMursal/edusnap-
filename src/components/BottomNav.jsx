import { useNavigate, useLocation } from "react-router-dom"
import { Home, BookOpen, PlusCircle, User, ClipboardList } from "lucide-react"

export default function BottomNav({ t }) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: "/",        icon: Home,          label: "Главная"  },
    { path: "/catalog", icon: BookOpen,      label: "Курсы"    },
    { path: "/create",  icon: PlusCircle,    label: "Создать"  },
    { path: "/ege",     icon: ClipboardList, label: "ЕГЭ"      },
    { path: "/profile", icon: User,          label: "Профиль"  },
  ]

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: t.surface,
      borderTop: `1px solid ${t.border}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "10px 8px 28px",
      zIndex: 100,
      backdropFilter: "blur(20px)",
    }}>
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path
        return (
          <button key={path} onClick={() => navigate(path)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, background: "none", border: "none", cursor: "pointer",
              color: active ? t.primary : t.textMuted,
              transition: "all 0.2s",
              padding: "6px 12px",
              borderRadius: 999,
              position: "relative",
            }}>
            {active && (
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: t.secondary,
                borderRadius: 999,
              }} />
            )}
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} style={{ position: "relative", zIndex: 1 }} />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              position: "relative", zIndex: 1,
              letterSpacing: 0.2,
            }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}