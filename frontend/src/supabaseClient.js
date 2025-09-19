import { createClient } from '@supabase/supabase-js'


//this was the second step foe connect supabase with my fronted 
//I have installed first npm @supabase/supabase-js library in my frontend then
// I cteated .env file in which i have added my both the url and key 
// then I create this file for configure with my supasa
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)