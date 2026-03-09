const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://zdaofrgfojbjozvbnzjk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW9mcmdmb2piam96dmJuemprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAwODcyMSwiZXhwIjoyMDg4NTg0NzIxfQ.X2Vkjdglz1o4lQXcthgu2tlwagKpqQfW2_8Yd-LPfYU";
const OR_KEY = "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";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 3;       // параллельных запросов одновременно
const PAUSE_MS = 1200;      // пауза между батчами (мс)
const FETCH_LIMIT = 50;     // заданий за один запуск

async function rewriteSolution(solution) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OR_KEY}`,
      "HTTP-Referer": "https://egebiosprint.vercel.app",
      "X-Title": "EgeBioSprint"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{
        role: "user",
        content: `Перефразируй это объяснение к заданию ЕГЭ по биологии своими словами, сохранив весь смысл и все факты. Не добавляй ничего лишнего. Просто сразу пиши объяснение без вступлений. Текст:\n\n${solution}`
      }],
      max_tokens: 500,
      temperature: 0.4
    })
  });
  const data = await res.json();
  if (!data?.choices) console.log("\nOpenRouter ответ:", JSON.stringify(data).slice(0, 300));
  return data?.choices?.[0]?.message?.content || null;
}

async function processTask(task, index, total) {
  try {
    const newSolution = await rewriteSolution(task.solution);
    if (!newSolution) {
      console.log(`  [${index}/${total}] Пропуск ${task.source_id}`);
      return false;
    }
    await supabase.from("ege_tasks").update({ solution: newSolution + " !!" }).eq("id", task.id);
    console.log(`  [${index}/${total}] ✓ ${task.source_id}`);
    return true;
  } catch (e) {
    console.log(`  [${index}/${total}] Ошибка ${task.source_id}: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("Запуск...");
  const { data: tasks, error } = await supabase
    .from("ege_tasks")
    .select("id, source_id, solution")
    .not("solution", "is", null)
    .neq("solution", "")
    .not("solution", "like", "%!!%")
    .limit(FETCH_LIMIT);

  if (error) { console.error(error); return; }

  if (!tasks || tasks.length === 0) {
    console.log("Все задания уже переписаны!");
    return;
  }

  console.log(`Задания для переписывания: ${tasks.length}`);
  console.log(`Батчи по ${BATCH_SIZE} параллельно, пауза ${PAUSE_MS}ms\n`);

  let done = 0;

  // Разбиваем на батчи по BATCH_SIZE и обрабатываем параллельно
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    console.log(`Батч ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(tasks.length / BATCH_SIZE)}:`);

    const results = await Promise.all(
      batch.map((task, j) => processTask(task, i + j + 1, tasks.length))
    );

    done += results.filter(Boolean).length;

    // Пауза между батчами чтобы не превысить rate limit
    if (i + BATCH_SIZE < tasks.length) {
      await new Promise(r => setTimeout(r, PAUSE_MS));
    }
  }

  console.log(`\n=== ГОТОВО === Переписано: ${done}/${tasks.length}`);
  console.log(`Запусти снова если осталось больше заданий.`);
}

main().catch(console.error);
