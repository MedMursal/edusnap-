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
      background: "white", borderTop: `2px solid ${t.secondary}`,
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 20px", zIndex: 100
    }}>
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path
        return (
          <button key={path} onClick={() => navigate(path)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, background: "none", border: "none", cursor: "pointer",
              color: active ? t.primary : "#94A3B8",
              transform: active ? "scale(1.15)" : "scale(1)",
              transition: "all 0.2s"
            }}>
            <Icon size={24} />
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}