// /api/remind.js
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role ключ, не anon
)

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  })
}

export default async function handler(req, res) {
  // Защита — только Vercel Cron может вызвать
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const today = new Date().toISOString().split("T")[0]

  // Берём всех у кого tasks_today_date не сегодня — значит ещё не решали
  const { data: users, error } = await supabase
    .from("users")
    .select("id, first_name, streak")
    .or(`tasks_today_date.neq.${today},tasks_today_date.is.null`)

  if (error) return res.status(500).json({ error })

  let sent = 0
  for (const user of users) {
    const streakWarning = user.streak > 1
      ? `\n🔥 Твой стрик <b>${user.streak} дней</b> сгорит если не решишь хотя бы одну задачу сегодня!`
      : ""

    await sendMessage(
      user.id,
      `👋 <b>${user.first_name || "Привет"}</b>, не забудь порешать задачи ЕГЭ сегодня!${streakWarning}\n\n📚 Открыть тренажёр → @ege_bio_sprint_bot`
    )
    sent++

    // Пауза чтобы не словить rate limit от Telegram (30 сообщений/сек)
    if (sent % 25 === 0) await new Promise(r => setTimeout(r, 1000))
  }

  return res.status(200).json({ sent })
}