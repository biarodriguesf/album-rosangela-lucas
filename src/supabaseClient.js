import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tfeldnqkabhznfzlipra.supabase.co";

const supabaseAnonKey =
  "sb_publishable_rqeEAoROjf-fzJTpDV3Mag_WxgzySg7";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);