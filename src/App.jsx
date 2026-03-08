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

const BASE_THEMES = {
  coral:    { name: "Коралл",  emoji: "🪸", primary: "#FF6B4A", primaryBright: "#FF8166", primaryGlow: "rgba(255,107,74,0.3)", secondary: "rgba(255,107,74,0.12)", success: "#52C97A", error: "#FF5C7A", accent: "#FFB347" },
  sage:     { name: "Шалфей", emoji: "🌿", primary: "#4DAA7A", primaryBright: "#5EC48E", primaryGlow: "rgba(77,170,122,0.3)",  secondary: "rgba(77,170,122,0.12)",  success: "#52C97A", error: "#FF6B6B", accent: "#A8D8A8" },
  ocean:    { name: "Океан",   emoji: "🌊", primary: "#3A9BD5", primaryBright: "#4DB0EC", primaryGlow: "rgba(58,155,213,0.3)", secondary: "rgba(58,155,213,0.12)", success: "#4ECBA0", error: "#FF6B7A", accent: "#7EC8E3" },
  lavender: { name: "Лаванда",emoji: "💜", primary: "#9B72CF", primaryBright: "#B08AE0", primaryGlow: "rgba(155,114,207,0.3)",secondary: "rgba(155,114,207,0.12)",success: "#6AC99B", error: "#FF6B8A", accent: "#C4A8FF" },
  dusk:     { name: "Закат",   emoji: "🌅", primary: "#E8845A", primaryBright: "#F09A72", primaryGlow: "rgba(232,132,90,0.3)", secondary: "rgba(232,132,90,0.12)", success: "#6AC99B", error: "#FF6B7A", accent: "#F5C87A" },
}

const DARK_PALETTE = {
  coral:    { bg: "#1C1210", surface: "#251714", surfaceUp: "#2F1E1A", border: "#3D2820", text: "#FAF0EC", textMuted: "#A07060", textDim: "#4A2A20" },
  sage:     { bg: "#0F1A14", surface: "#152019", surfaceUp: "#1C2A20", border: "#26382A", text: "#EAF5EE", textMuted: "#607A6A", textDim: "#2A3E30" },
  ocean:    { bg: "#0A1420", surface: "#101E30", surfaceUp: "#17273E", border: "#1F3350", text: "#E8F4FD", textMuted: "#4A7090", textDim: "#1A3050" },
  lavender: { bg: "#130F1E", surface: "#1A1428", surfaceUp: "#221B33", border: "#2E2545", text: "#F0EAFF", textMuted: "#7060A0", textDim: "#2E2545" },
  dusk:     { bg: "#15100E", surface: "#1E1612", surfaceUp: "#281D17", border: "#38271F", text: "#FFF0E8", textMuted: "#906050", textDim: "#402820" },
}

const LIGHT_PALETTE = {
  coral:    { bg: "#FFF5F2", surface: "#FFFFFF", surfaceUp: "#FFF0EB", border: "#FFD5C8", text: "#1A0A06", textMuted: "#A07060", textDim: "#D0A090" },
  sage:     { bg: "#F2FAF5", surface: "#FFFFFF", surfaceUp: "#EAF7EF", border: "#C8E8D4", text: "#061A0F", textMuted: "#4A7A5A", textDim: "#A0C8B0" },
  ocean:    { bg: "#F0F8FF", surface: "#FFFFFF", surfaceUp: "#E8F4FD", border: "#C0DDF0", text: "#061020", textMuted: "#4A7090", textDim: "#A0C8E0" },
  lavender: { bg: "#F5F0FF", surface: "#FFFFFF", surfaceUp: "#EEE8FF", border: "#D4C8F0", text: "#0F0820", textMuted: "#7060A0", textDim: "#C4B8E8" },
  dusk:     { bg: "#FFF8F4", surface: "#FFFFFF", surfaceUp: "#FFF2EA", border: "#F0D4C0", text: "#150806", textMuted: "#906050", textDim: "#D8B8A0" },
}

export function buildTheme(themeKey, mode) {
  return { ...BASE_THEMES[themeKey], ...(mode === "light" ? LIGHT_PALETTE[themeKey] : DARK_PALETTE[themeKey]) }
}

export const UserContext = createContext(null)
export function useUser() { return useContext(UserContext) }

const FREE_DAILY_LIMIT = 10

export default function App() {
  const [theme, setTheme] = useState("coral")
  const [mode, setMode] = useState("dark")
  const [tgUser, setTgUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const t = buildTheme(theme, mode)

  useEffect(() => { initUser() }, [])

  async function initUser() {
    const tg = getTelegramWebApp()
    if (tg) { tg.ready(); tg.expand() }

    const user = getTelegramUser()
    if (!user) { setUserLoading(false); return }

    setTgUser(user)
    const today = new Date().toISOString().split("T")[0]
    const { data: existing } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!existing) {
      const { data } = await supabase.from("users").insert({
        id: user.id, first_name: user.firstName, last_name: user.lastName,
        username: user.username, photo_url: user.photoUrl,
        tasks_today: 0, tasks_today_date: today,
      }).select().single()
      setDbUser(data)
    } else {
      const updates = { first_name: user.firstName, last_name: user.lastName, username: user.username, last_active: today }
      if (existing.tasks_today_date !== today) { updates.tasks_today = 0; updates.tasks_today_date = today }
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
  const canDoTask = !dbUser || dbUser.is_premium || tasksToday < FREE_DAILY_LIMIT

  const userCtx = { tgUser, dbUser, userLoading, tasksToday, canDoTask, freeLimit: FREE_DAILY_LIMIT, incrementTasksToday, isInTelegram: isInTelegram() }

  return (
    <UserContext.Provider value={userCtx}>
      <BrowserRouter>
        <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
          <Routes>
            <Route path="/" element={<Home t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />} />
            <Route path="/profile" element={<Profile t={t} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />} />
            <Route path="/ege" element={<EgeTasks t={t} />} />
            <Route path="/ege/test" element={<EgeTest t={t} />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          <BottomNav t={t} />
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  )
}