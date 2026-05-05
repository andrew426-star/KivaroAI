import { supabase } from './supabase';

const SID_KEY   = 'kv_sid';
const SINIT_KEY = 'kv_sinit';

function getSessionId(): string {
  let id = sessionStorage.getItem(SID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SID_KEY, id);
  }
  return id;
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua) && !/ipad|tablet/i.test(ua)) return 'Mobile';
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua))                                return 'Edge';
  if (/OPR\//i.test(ua))                                return 'Opera';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua))    return 'Chrome';
  if (/Firefox\//i.test(ua))                            return 'Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua))      return 'Safari';
  return 'Other';
}

async function ensureSession(page: string): Promise<void> {
  if (sessionStorage.getItem(SINIT_KEY)) return;
  const sessionId = getSessionId();
  const params = new URLSearchParams(window.location.search);

  const { error } = await supabase.from('visitor_sessions').insert({
    session_id:   sessionId,
    first_page:   page,
    referrer:     document.referrer || null,
    utm_source:   params.get('utm_source'),
    utm_medium:   params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    device_type:  detectDevice(),
    browser:      detectBrowser(),
  });

  if (!error) sessionStorage.setItem(SINIT_KEY, '1');
}

// Active page-view tracking (module-level so it persists across renders)
let activeView: { id: string; ts: number } | null = null;

export async function trackPageView(page: string): Promise<void> {
  // Never track admin pages
  if (page.startsWith('/admin')) return;

  try {
    await ensureSession(page);

    const sessionId = getSessionId();
    const now = Date.now();

    // Finalize the previous page's duration
    if (activeView) {
      const secs = Math.round((now - activeView.ts) / 1000);
      supabase
        .from('page_views')
        .update({ duration_seconds: secs })
        .eq('id', activeView.id)
        .then(() => {});
    }

    // Insert the new page view
    const { data } = await supabase
      .from('page_views')
      .insert({ session_id: sessionId, page, referrer: document.referrer || null })
      .select('id')
      .single();

    activeView = data ? { id: data.id, ts: now } : null;

    // Keep session last_active current
    supabase
      .from('visitor_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .then(() => {});
  } catch {
    // Analytics errors must never surface to the user
  }
}
