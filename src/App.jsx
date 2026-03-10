import { useState, useEffect, createContext, useContext } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import BottomNav from "./components/BottomNav"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import EgeTasks from "./pages/EgeTasks"
import EgeTest from "./pages/EgeTest"
import AdminPanel from "./pages/AdminPanel"
import { getTelegramUser, getTelegramWebApp, isInTelegram } from "./telegram"
import { supabase } from "./supabase"
import WorkOnErrors from "./pages/WorkOnErrors"
import SpacedRepetition from "./pages/SpacedRepetition"

const BASE_THEMES = {
  coral:    { name: "Коралл",   emoji: "🪸", primary: "#FF6B4A", primaryBright: "#FF8166", primaryGlow: "rgba(255,107,74,0.35)", secondary: "rgba(255,107,74,0.12)", success: "#58CC02", error: "#FF4B4B", accent: "#FFB347" },
  sage:     { name: "Шалфей",  emoji: "🌿", primary: "#4DAA7A", primaryBright: "#5EC48E", primaryGlow: "rgba(77,170,122,0.35)",  secondary: "rgba(77,170,122,0.12)",  success: "#58CC02", error: "#FF4B4B", accent: "#A8D8A8" },
  ocean:    { name: "Океан",    emoji: "🌊", primary: "#3A9BD5", primaryBright: "#4DB0EC", primaryGlow: "rgba(58,155,213,0.35)", secondary: "rgba(58,155,213,0.12)",  success: "#58CC02", error: "#FF4B4B", accent: "#7EC8E3" },
  lavender: { name: "Лаванда", emoji: "💜", primary: "#9B72CF", primaryBright: "#B08AE0", primaryGlow: "rgba(155,114,207,0.35)",secondary: "rgba(155,114,207,0.12)", success: "#58CC02", error: "#FF4B4B", accent: "#C4A8FF" },
  dusk:     { name: "Закат",    emoji: "🌅", primary: "#E8845A", primaryBright: "#F09A72", primaryGlow: "rgba(232,132,90,0.35)", secondary: "rgba(232,132,90,0.12)",  success: "#58CC02", error: "#FF4B4B", accent: "#F5C87A" },
}

const DARK_PALETTE = {
  coral:    { bg: "#111111", surface: "#1C1C1C", surfaceUp: "#252525", border: "#2E2016", text: "#FFFFFF", textMuted: "#9A8A84", textDim: "#3D2820" },
  sage:     { bg: "#111111", surface: "#1C1C1C", surfaceUp: "#222822", border: "#1E3028", text: "#FFFFFF", textMuted: "#7A9080", textDim: "#243828" },
  ocean:    { bg: "#111111", surface: "#1C1C1C", surfaceUp: "#1A2030", border: "#1A2E44", text: "#FFFFFF", textMuted: "#5A8098", textDim: "#182840" },
  lavender: { bg: "#111111", surface: "#1C1C1C", surfaceUp: "#201828", border: "#2A2040", text: "#FFFFFF", textMuted: "#8070A8", textDim: "#261E3C" },
  dusk:     { bg: "#111111", surface: "#1C1C1C", surfaceUp: "#221810", border: "#342018", text: "#FFFFFF", textMuted: "#9A7060", textDim: "#3C2018" },
}

const LIGHT_PALETTE = {
  coral:    { bg: "#F7F7F7", surface: "#FFFFFF", surfaceUp: "#FFF0EB", border: "#FFD8CC", text: "#111111", textMuted: "#888888", textDim: "#D0A090" },
  sage:     { bg: "#F7F7F7", surface: "#FFFFFF", surfaceUp: "#EAF7EF", border: "#C0DCC8", text: "#111111", textMuted: "#888888", textDim: "#A0C8B0" },
  ocean:    { bg: "#F7F7F7", surface: "#FFFFFF", surfaceUp: "#E8F4FD", border: "#B8D8EE", text: "#111111", textMuted: "#888888", textDim: "#A0C8E0" },
  lavender: { bg: "#F7F7F7", surface: "#FFFFFF", surfaceUp: "#EEE8FF", border: "#D0C4EE", text: "#111111", textMuted: "#888888", textDim: "#C4B8E8" },
  dusk:     { bg: "#F7F7F7", surface: "#FFFFFF", surfaceUp: "#FFF2EA", border: "#EECEB8", text: "#111111", textMuted: "#888888", textDim: "#D8B8A0" },
}

export function buildTheme(themeKey, mode) {
  return { ...BASE_THEMES[themeKey], ...(mode === "light" ? LIGHT_PALETTE[themeKey] : DARK_PALETTE[themeKey]) }
}

// Инжектим CSS-переменные в :root — тема меняется мгновенно без перерендера
function injectCSSVars(t) {
  const root = document.documentElement
  Object.entries(t).forEach(([key, val]) => {
    // camelCase → --kebab-case
    const cssVar = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase()
    root.style.setProperty(cssVar, val)
  })
}

export const UserContext = createContext(null)
export function useUser() { return useContext(UserContext) }

const FREE_DAILY_LIMIT = 10

// Глобальные стили — один раз
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { font-family: 'Nunito', -apple-system, sans-serif; margin: 0; }
  
  @keyframes duo-bounce {
    0%   { transform: scale(1); }
    40%  { transform: scale(0.94); }
    70%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  @keyframes duo-pop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes duo-shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes fire-pulse {
    0%,100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 6px #FF6B4A88); }
    50%     { transform: scale(1.15) rotate(2deg); filter: drop-shadow(0 0 14px #FF6B4ABB); }
  }
  @keyframes xp-float {
    0%   { opacity:0; transform: translateY(0) scale(0.7); }
    30%  { opacity:1; transform: translateY(-12px) scale(1.2); }
    70%  { opacity:1; transform: translateY(-22px) scale(1); }
    100% { opacity:0; transform: translateY(-36px) scale(0.8); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes slide-up {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes correct-flash {
    0%   { background: var(--success); }
    100% { background: var(--surface); }
  }

  .duo-btn {
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    user-select: none;
  }
  .duo-btn:active { animation: duo-bounce 0.3s ease; }

  .slide-up { animation: slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in  { animation: fade-in  0.3s ease both; }

  .xp-shimmer {
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-bright) 40%, #fff8 50%, var(--primary-bright) 60%, var(--primary) 100%);
    background-size: 200% auto;
    animation: shimmer 2s linear infinite;
  }
`

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("duo-theme") || "coral")
  const [mode, setMode]   = useState(() => localStorage.getItem("duo-mode")  || "dark")
  const [tgUser, setTgUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  const t = buildTheme(theme, mode)

  // CSS-переменные обновляются мгновенно при смене темы
  useEffect(() => { injectCSSVars(t) }, [theme, mode])

  // Сохраняем выбор темы
  useEffect(() => { localStorage.setItem("duo-theme", theme) }, [theme])
  useEffect(() => { localStorage.setItem("duo-mode",  mode)  }, [mode])

  useEffect(() => { initUser() }, [])

  async function initUser() {
    const tg = getTelegramWebApp()
    if (tg) { tg.ready(); tg.expand() }

    const user = getTelegramUser()
    if (!user) { setUserLoading(false); return }

    setTgUser(user)
    const today     = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const { data: existing } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!existing) {
      const { data } = await supabase.from("users").insert({
        id: user.id, first_name: user.firstName, last_name: user.lastName,
        username: user.username, photo_url: user.photoUrl,
        tasks_today: 0, tasks_today_date: today,
        streak: 1, last_active: today,
      }).select().single()
      setDbUser(data)
    } else {
      const updates = { first_name: user.firstName, last_name: user.lastName, username: user.username, last_active: today }
      if (existing.tasks_today_date !== today) { updates.tasks_today = 0; updates.tasks_today_date = today }
      const lastActive = existing.last_active ? String(existing.last_active).split("T")[0] : null
      if      (lastActive === today)     { if (!existing.streak) updates.streak = 1 }
      else if (lastActive === yesterday) { updates.streak = (existing.streak || 0) + 1 }
      else                               { updates.streak = 1 }
      const { data } = await supabase.from("users").update(updates).eq("id", user.id).select().single()
      setDbUser(data)
    }
    setUserLoading(false)
  }

  async function incrementTasksToday() {
    if (!dbUser) return
    const today = new Date().toISOString().split("T")[0]
    const newCount = (dbUser.tasks_today_date === today ? dbUser.tasks_today : 0) + 1
    const { data } = await supabase.from("users")
      .update({ tasks_today: newCount, tasks_today_date: today, total_tasks: (dbUser.total_tasks || 0) + 1 })
      .eq("id", dbUser.id).select().single()
    setDbUser(data)
  }

  const today = new Date().toISOString().split("T")[0]
  const tasksToday = dbUser?.tasks_today_date === today ? dbUser?.tasks_today || 0 : 0
  const canDoTask  = !dbUser || dbUser.is_premium || tasksToday < FREE_DAILY_LIMIT

  const userCtx = { tgUser, dbUser, userLoading, tasksToday, canDoTask, freeLimit: FREE_DAILY_LIMIT, incrementTasksToday, isInTelegram: isInTelegram() }

  return (
    <UserContext.Provider value={userCtx}>
      <style>{GLOBAL_STYLES}</style>
      <BrowserRouter>
        <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
          <Routes>
            <Route path="/"        element={<Home     t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />} />
            <Route path="/profile" element={<Profile  t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />} />
            <Route path="/ege"     element={<EgeTasks t={t} />} />
            <Route path="/ege/test" element={<EgeTest t={t} />} />
            <Route path="/admin"   element={<AdminPanel />} />
            <Route path="/errors"  element={<WorkOnErrors t={t} />} />
            <Route path="/repeat"  element={<SpacedRepetition t={t} />} />
          </Routes>
          <BottomNav t={t} />
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  )
}