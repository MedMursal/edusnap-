import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import BottomNav from "./components/BottomNav"
import Home from "./pages/Home"
import Catalog from "./pages/Catalog"
import Profile from "./pages/Profile"
import CreateCourse from "./pages/CreateCourse"
import CoursePage from "./pages/CoursePage"

const themes = {
  blue:   { bg: "#EFF6FF", primary: "#2563EB", secondary: "#DBEAFE", text: "#1E3A5F", accent: "#60A5FA" },
  green:  { bg: "#F0FDF4", primary: "#16A34A", secondary: "#DCFCE7", text: "#14532D", accent: "#4ADE80" },
  purple: { bg: "#FAF5FF", primary: "#7C3AED", secondary: "#EDE9FE", text: "#3B0764", accent: "#A78BFA" },
  orange: { bg: "#FFF7ED", primary: "#EA580C", secondary: "#FFEDD5", text: "#431407", accent: "#FB923C" },
  dark:   { bg: "#0F172A", primary: "#6366F1", secondary: "#1E293B", text: "#F1F5F9",  accent: "#818CF8" },
}

export default function App() {
  const [theme, setTheme] = useState("blue")
  const t = themes[theme]

  return (
    <BrowserRouter>
      <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
        <Routes>
          <Route path="/" element={<Home t={t} theme={theme} setTheme={setTheme} themes={themes} />} />
          <Route path="/catalog" element={<Catalog t={t} />} />
          <Route path="/create" element={<CreateCourse />} />
          <Route path="/profile" element={<Profile t={t} />} />
          <Route path="/course/:id" element={<CoursePage />} />
        </Routes>
        <BottomNav t={t} />
      </div>
    </BrowserRouter>
  )
}