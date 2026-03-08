import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import BottomNav from "./components/BottomNav"
import Home from "./pages/Home"
import Catalog from "./pages/Catalog"
import Profile from "./pages/Profile"
import CreateCourse from "./pages/CreateCourse"
import CoursePage from "./pages/CoursePage"
import EgeTasks from "./pages/EgeTasks"
import EgeTest from "./pages/EgeTest"

export const themes = {
  coral: {
    name: "Коралл",
    emoji: "🪸",
    bg: "#1C1210",
    surface: "#251714",
    surfaceUp: "#2F1E1A",
    border: "#3D2820",
    primary: "#FF6B4A",
    primaryBright: "#FF8166",
    primaryGlow: "rgba(255,107,74,0.3)",
    secondary: "rgba(255,107,74,0.12)",
    text: "#FAF0EC",
    textMuted: "#A07060",
    textDim: "#4A2A20",
    accent: "#FFB347",
    success: "#52C97A",
    error: "#FF5C7A",
  },
  sage: {
    name: "Шалфей",
    emoji: "🌿",
    bg: "#0F1A14",
    surface: "#152019",
    surfaceUp: "#1C2A20",
    border: "#26382A",
    primary: "#4DAA7A",
    primaryBright: "#5EC48E",
    primaryGlow: "rgba(77,170,122,0.3)",
    secondary: "rgba(77,170,122,0.12)",
    text: "#EAF5EE",
    textMuted: "#607A6A",
    textDim: "#2A3E30",
    accent: "#A8D8A8",
    success: "#52C97A",
    error: "#FF6B6B",
  },
  ocean: {
    name: "Океан",
    emoji: "🌊",
    bg: "#0A1420",
    surface: "#101E30",
    surfaceUp: "#17273E",
    border: "#1F3350",
    primary: "#3A9BD5",
    primaryBright: "#4DB0EC",
    primaryGlow: "rgba(58,155,213,0.3)",
    secondary: "rgba(58,155,213,0.12)",
    text: "#E8F4FD",
    textMuted: "#4A7090",
    textDim: "#1A3050",
    accent: "#7EC8E3",
    success: "#4ECBA0",
    error: "#FF6B7A",
  },
  lavender: {
    name: "Лаванда",
    emoji: "💜",
    bg: "#130F1E",
    surface: "#1A1428",
    surfaceUp: "#221B33",
    border: "#2E2545",
    primary: "#9B72CF",
    primaryBright: "#B08AE0",
    primaryGlow: "rgba(155,114,207,0.3)",
    secondary: "rgba(155,114,207,0.12)",
    text: "#F0EAFF",
    textMuted: "#7060A0",
    textDim: "#2E2545",
    accent: "#C4A8FF",
    success: "#6AC99B",
    error: "#FF6B8A",
  },
  dusk: {
    name: "Закат",
    emoji: "🌅",
    bg: "#15100E",
    surface: "#1E1612",
    surfaceUp: "#281D17",
    border: "#38271F",
    primary: "#E8845A",
    primaryBright: "#F09A72",
    primaryGlow: "rgba(232,132,90,0.3)",
    secondary: "rgba(232,132,90,0.12)",
    text: "#FFF0E8",
    textMuted: "#906050",
    textDim: "#402820",
    accent: "#F5C87A",
    success: "#6AC99B",
    error: "#FF6B7A",
  },
}

export default function App() {
  const [theme, setTheme] = useState("coral")
  const t = themes[theme]

  return (
    <BrowserRouter>
      <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
        <Routes>
          <Route path="/" element={<Home t={t} theme={theme} setTheme={setTheme} themes={themes} />} />
          <Route path="/catalog" element={<Catalog t={t} />} />
          <Route path="/create" element={<CreateCourse t={t} />} />
          <Route path="/profile" element={<Profile t={t} theme={theme} setTheme={setTheme} themes={themes} />} />
          <Route path="/course/:id" element={<CoursePage t={t} />} />
          <Route path="/ege" element={<EgeTasks t={t} />} />
          <Route path="/ege/test" element={<EgeTest t={t} />} />
        </Routes>
        <BottomNav t={t} />
      </div>
    </BrowserRouter>
  )
}