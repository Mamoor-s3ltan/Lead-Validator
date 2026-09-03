// get_leads_with_latest() joins each lead with its most recent
// classification row. This normalizer copes with either a flat shape
// (category/confidence/... on the lead itself) or a nested
// `latest_classification` object, so the UI doesn't care which one
// the query returns.
export function normalizeLead(raw) {
  const cls = raw.latest_classification || raw.classification || raw;

  return {
    id: raw.id ?? raw.lead_id,
    companyName: raw.company_name ?? raw.companyName ?? 'Untitled lead',
    url: raw.url ?? null,
    category: cls.category ?? null,
    confidence: cls.confidence ?? null,
    reasoning: cls.reasoning ?? null,
    model: cls.model ?? null,
    classifiedAt: cls.created_at ?? cls.classified_at ?? null,
  };
}

export function formatConfidence(confidence) {
  if (confidence === null || confidence === undefined) return '—';
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return `${pct.toFixed(1)}%`;
}

export function formatTimestamp(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
  } catch (_) {
    return url;
  }
}