const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://zdaofrgfojbjozvbnzjk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW9mcmdmb2piam96dmJuemprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAwODcyMSwiZXhwIjoyMDg4NTg0NzIxfQ.X2Vkjdglz1o4lQXcthgu2tlwagKpqQfW2_8Yd-LPfYU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const MAX_TASKS = 200;

// ─── URL для химии ───────────────────────────────────────────
const SUBJECT_SLUG = "himiya";
const SUBJECT_NAME = "Химия";
const BANK_URL = `https://neofamily.ru/${SUBJECT_SLUG}/task-bank?sources=1282`;
const TASK_URL = (id) => `https://neofamily.ru/${SUBJECT_SLUG}/task-bank/${id}`;
// ─────────────────────────────────────────────────────────────

function cleanHtml(html) {
  return (html||"")
    .replace(/&laquo;/g,"«").replace(/&raquo;/g,"»").replace(/&nbsp;/g," ")
    .replace(/&ndash;/g,"–").replace(/&mdash;/g,"—").replace(/&amp;/g,"&")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')
    .replace(/&deg;/g,"°").replace(/&times;/g,"×")
    .replace(/&#(\d+);/g,(_,c)=>String.fromCharCode(parseInt(c)))
    .replace(/ (style|class|id|width|height|align|valign|border|cellpadding|cellspacing)="[^"]*"/gi,"")
    .trim();
}

function stripHtml(html) {
  return cleanHtml(html||"")
    .replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n")
    .replace(/<\/tr>/gi,"\n").replace(/<\/td>/gi," | ").replace(/<\/th>/gi," | ")
    .replace(/<img[^>]+>/gi,"").replace(/<[^>]+>/g,"")
    .replace(/\n{3,}/g,"\n\n").trim();
}

function getDifficulty(tl) {
  if (!tl) return "Среднее";
  const n = parseInt(tl.value !== undefined ? tl.value : tl);
  if (n<=3) return "Легкое"; if (n<=6) return "Среднее"; return "Сложное";
}

function getLineNumber(tl) {
  if (!tl) return null;
  if (typeof tl === "number") return tl;
  if (tl.name !== undefined) return parseInt(tl.name) || null;
  if (tl.number !== undefined) return parseInt(tl.number) || null;
  return null;
}

function parseOptions(text) {
  const m = text.match(/(?:^|\n)\s*[1-6АБВГДЕабвгде][\)\.]\s*[^\n]{2,}/g);
  if (!m || m.length < 2) return null;
  const opts = m.map(s=>s.replace(/^\s*[1-6АБВГДЕабвгде][\)\.]\s*/,"").trim()).filter(s=>s.length>1);
  return opts.length >= 2 ? opts.join("||") : null;
}

async function collectIds(browser) {
  console.log(`Шаг 1: собираем ID заданий ${SUBJECT_NAME}...`);
  const page = await browser.newPage();
  const taskIds = new Set();

  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("backend.neofamily.ru/api/task")) return;
    try {
      const ct = response.headers()["content-type"] || "";
      if (!ct.includes("json")) return;
      const body = await response.json().catch(() => null);
      if (!body) return;
      const items = body.data || body.tasks || (Array.isArray(body) ? body : null);
      if (!items) return;
      items.forEach(item => {
        // Берём все задания — не фильтруем по subject_id
        // (у химии может быть другой subject_id чем у биологии)
        taskIds.add(String(item.id));
      });
    } catch(e) {}
  });

  await page.goto(BANK_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  let noGrowth = 0;
  while (noGrowth < 30 && taskIds.size < MAX_TASKS * 3) {
    const prev = taskIds.size;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    if (taskIds.size === prev) noGrowth++;
    else noGrowth = 0;
    process.stdout.write(`\rНайдено ID: ${taskIds.size} (без роста: ${noGrowth}/30)   `);
  }

  await page.close();
  console.log(`\nИтого ID: ${taskIds.size}`);
  return Array.from(taskIds);
}

async function getTaskData(page, taskId) {
  try {
    await page.goto(TASK_URL(taskId), { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(400);
    return await page.evaluate(() => {
      const el = document.getElementById("__NEXT_DATA__");
      if (!el) return null;
      try {
        const json = JSON.parse(el.textContent);
        const queries = json?.props?.pageProps?.dehydratedState?.queries || [];
        for (const q of queries) {
          const d = q?.state?.data;
          if (d && d.question !== undefined && d.answer !== undefined) return d;
        }
        return null;
      } catch(e) { return null; }
    });
  } catch(e) { return null; }
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  const ids = await collectIds(browser);
  if (ids.length === 0) {
    console.log("ID не найдены!");
    await browser.close();
    return;
  }

  // Загружаем уже сохранённые ID из базы
  console.log("Загружаем уже сохранённые ID из базы...");
  const { data: existing } = await supabase
    .from("ege_tasks")
    .select("source_id");
  const existingIds = new Set((existing || []).map(r => r.source_id));
  console.log(`Уже в базе: ${existingIds.size}`);

  const newIds = ids.filter(id => !existingIds.has(id));
  console.log(`Новых для парсинга: ${newIds.length}`);

  if (newIds.length === 0) {
    console.log("Все задания уже в базе!");
    await browser.close();
    return;
  }

  console.log("Шаг 2: собираем данные...");
  const taskPage = await browser.newPage();
  const tasks = [];
  let saved = 0;

  for (let i = 0; i < newIds.length && tasks.length < MAX_TASKS; i++) {
    const id = newIds[i];
    process.stdout.write(`\r[${i+1}/${newIds.length}] Собрано: ${tasks.length} | ID: ${id}   `);

    const td = await getTaskData(taskPage, id);
    if (!td) continue;

    const rawHtml = td.question || "";
    if (!rawHtml) continue;

    const answerArr = td.answer || [];
    const answer = (Array.isArray(answerArr) ? answerArr.join(", ") : String(answerArr || "")).replace(/Источник:.*$/gs, "").trim();
    if (!answer || answer === "—" || answer.trim() === "") continue;

    const image_url = (() => {
      const m = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      return (m?.[1] && !m[1].includes("srennab")) ? m[1] : "";
    })();

    let topic = SUBJECT_NAME, subtopic = "Общее";
    if (Array.isArray(td.themes) && td.themes.length > 0) {
      subtopic = td.themes[0].name || "Общее";
      topic = td.themes[0].section?.name || subtopic;
    }

    const lineNumber = getLineNumber(td.task_line);

    tasks.push({
      source_id: String(id),
      subject: SUBJECT_NAME, topic, subtopic,
      question: cleanHtml(rawHtml).slice(0, 3000),
      answer: (answer || "—").slice(0, 300),
      solution: stripHtml(td.solution || "").replace(/Источник:.*$/gs, "").trim().slice(0, 2000),
      difficulty: getDifficulty(td.task_line),
      image_url,
      options: parseOptions(stripHtml(rawHtml)),
      line_number: lineNumber,
    });

    if (tasks.length % 50 === 0) {
      const batch = tasks.slice(tasks.length - 50);
      const res = await supabase.from("ege_tasks").upsert(batch, { onConflict: "source_id" });
      saved += 50;
      if (res.error) console.error("\nОшибка:", res.error.message);
      else console.log(`\n✓ Сохранено: ${saved}`);
    }
  }

  const rem = tasks.length % 50;
  if (rem > 0) {
    const res = await supabase.from("ege_tasks").upsert(tasks.slice(tasks.length - rem), { onConflict: "source_id" });
    if (!res.error) saved += rem;
  }

  await browser.close();

  console.log(`\n\n=== ГОТОВО ===`);
  console.log(`Предмет: ${SUBJECT_NAME}`);
  console.log(`Собрано: ${tasks.length}`);
  console.log(`С номером линии: ${tasks.filter(t=>t.line_number).length}`);
  console.log(`С картинками: ${tasks.filter(t=>t.image_url).length}`);
  console.log(`С вариантами: ${tasks.filter(t=>t.options).length}`);

  const byLine = {};
  tasks.forEach(t => {
    const k = t.line_number || "нет";
    byLine[k] = (byLine[k]||0) + 1;
  });
  console.log("По линиям:", JSON.stringify(byLine));
}

main().catch(console.error);
