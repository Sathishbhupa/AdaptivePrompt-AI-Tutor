import { supabaseBrowser } from './supabase';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function apiFetch(path: string, init: RequestInit = {}) {
  const supabase = supabaseBrowser();
  let { data } = await supabase.auth.getSession();
  let accessToken = data.session?.access_token;

  if (!accessToken) {
    const refreshed = await supabase.auth.refreshSession();
    accessToken = refreshed.data.session?.access_token;
  }

  if (!accessToken) throw new Error('Please sign in first.');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let response = await fetch(`${API_URL}${path}`, { ...init, headers });

  // A valid browser session can outlive an expired access token. Refresh once, then retry.
  if (response.status === 401) {
    const refreshed = await supabase.auth.refreshSession();
    const newToken = refreshed.data.session?.access_token;
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(`${API_URL}${path}`, { ...init, headers });
    }
  }

  return response;
}
