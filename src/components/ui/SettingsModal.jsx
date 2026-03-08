import { motion, AnimatePresence } from "framer-motion"
import { X, Check } from "lucide-react"

const themeNames = {
  coral:    { label: "Коралл",  emoji: "🪸", color: "#FF6B4A" },
  sage:     { label: "Шалфей", emoji: "🌿", color: "#4DAA7A" },
  ocean:    { label: "Океан",   emoji: "🌊", color: "#3A9BD5" },
  lavender: { label: "Лаванда",emoji: "💜", color: "#9B72CF" },
  dusk:     { label: "Закат",   emoji: "🌅", color: "#E8845A" },
}

export default function SettingsModal({ t, theme, setTheme, themes, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          zIndex: 200,
          display: "flex", alignItems: "flex-end",
        }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%",
            background: t.surface,
            borderRadius: "28px 28px 0 0",
            padding: "8px 20px 48px",
            border: `1px solid ${t.border}`,
            borderBottom: "none",
          }}
        >
          {/* Handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 99,
            background: t.border, margin: "12px auto 24px",
          }} />

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 28,
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text }}>
              ⚙️ Настройки
            </h2>
            <button onClick={onClose} style={{
              background: t.surfaceUp, border: "none",
              borderRadius: 999, width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: t.textMuted,
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Theme label */}
          <p style={{
            fontSize: 12, fontWeight: 700, color: t.textMuted,
            letterSpacing: 1, marginBottom: 14, textTransform: "uppercase",
          }}>Цветовая палитра</p>

          {/* Theme grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
            {Object.entries(themes).map(([key, val]) => {
              const info = themeNames[key]
              const active = theme === key
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTheme(key)}
                  style={{
                    background: active ? val.secondary : t.surfaceUp,
                    border: `2px solid ${active ? val.primary : t.border}`,
                    borderRadius: 18, padding: "14px 16px",
                    cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999,
                      background: info.color,
                      boxShadow: active ? `0 0 12px ${info.color}80` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>{info.emoji}</div>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: active ? val.primary : t.text,
                    }}>{info.label}</span>
                  </div>
                  {active && (
                    <div style={{
                      width: 20, height: 20, borderRadius: 999,
                      background: val.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={12} color="white" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}