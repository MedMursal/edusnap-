import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://jwsquzinwhjfklchkmst.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c3F1emlud2hqZmtsY2hrbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA0NDMsImV4cCI6MjA4ODQ2NjQ0M30.C8kcMd3iA_7QHgMOlXFEMLt80qwqbfy2kvTuKddhCEQ"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)