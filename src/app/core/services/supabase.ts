import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private _client: SupabaseClient | null = null;

  get client(): SupabaseClient {
    if (!this._client) {
      if (
        environment.supabaseUrl === 'REPLACE_WITH_SUPABASE_URL' ||
        environment.supabaseKey === 'REPLACE_WITH_SUPABASE_ANON_KEY'
      ) {
        throw new Error(
          'Supabase credentials missing. Set supabaseUrl and supabaseKey in src/environments/environment.ts'
        );
      }

      this._client = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );
    }
    return this._client;
  }
}