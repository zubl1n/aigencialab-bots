/**
 * src/lib/fx-rates.ts
 * USD→CLP exchange rate with 60-minute Supabase cache.
 * ONLY runs server-side (API routes, Server Components).
 */
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isRecent(dateStr: string, minutes = 60): boolean {
  return Date.now() - new Date(dateStr).getTime() < minutes * 60 * 1000;
}

/** Returns USD→CLP rate. Falls back to 950 if all sources fail. */
export async function getUSDtoCLP(): Promise<number> {
  try {
    const supabase = getAdminClient();

    // 1. Try cache
    const { data } = await supabase
      .from('fx_cache')
      .select('rate, updated_at')
      .eq('pair', 'USD_CLP')
      .single();

    if (data && isRecent(data.updated_at)) {
      return Number(data.rate);
    }

    // 2. Fetch from exchange rate API
    const res = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();
    const rate = Math.round(json.rates?.CLP ?? 950);

    // 3. Update cache
    await supabase.from('fx_cache').upsert({
      pair: 'USD_CLP',
      rate,
      updated_at: new Date().toISOString(),
    });

    return rate;
  } catch {
    // Fallback — never block rendering
    return 950;
  }
}

/** Simple sync fallback for client components */
export const FALLBACK_USD_CLP = 950;
