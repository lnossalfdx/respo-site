import { createClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      photos: {
        Row: {
          id: string;
          name: string;
          image_path: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_path: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_path?: string;
          image_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }

  client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}
