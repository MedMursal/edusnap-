// Получаем юзера из Telegram WebApp
// Если открыто в браузере (не в Telegram) — возвращаем null

export function getTelegramUser() {
    try {
      const tg = window.Telegram?.WebApp
      if (!tg) return null
  
      tg.ready()
      tg.expand()
  
      const user = tg.initDataUnsafe?.user
      if (!user) return null
  
      return {
        id: user.id,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        username: user.username || null,
        photoUrl: user.photo_url || null,
        languageCode: user.language_code || "ru",
      }
    } catch {
      return null
    }
  }
  
  export function getTelegramWebApp() {
    return window.Telegram?.WebApp || null
  }
  
  // Определяем — запущено в Telegram или нет
  export function isInTelegram() {
    return !!window.Telegram?.WebApp?.initData
  }