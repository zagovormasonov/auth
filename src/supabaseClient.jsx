import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fsjcyqjddjwyzekkpyfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzamN5cWpkZGp3eXpla2tweWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTYxMzcsImV4cCI6MjA1OTA5MjEzN30.oJHx5REchPMvCVQ3h8Qe0CuVkKs6Oc_6Am2YO4yHoDg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);