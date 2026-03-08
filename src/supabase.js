import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://zdaofrgfojbjozvbnzjk.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW9mcmdmb2piam96dmJuemprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDg3MjEsImV4cCI6MjA4ODU4NDcyMX0.Eur7oPY17SQbUU2g98ibsRkBjMbRQedG2Q7h4IdOSmA"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)