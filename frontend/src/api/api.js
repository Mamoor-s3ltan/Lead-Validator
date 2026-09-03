// Base URL for the FastAPI backend. Override at build time with
// VITE_API_BASE (Vite) or REACT_APP_API_BASE (CRA) if you're not
// running the API on localhost:8000.
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch (err) {
    throw new ApiError('Could not reach the API. Is the backend running?', 0);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body && body.detail) detail = body.detail;
    } catch (_) {
      // response wasn't JSON, fall back to statusText
    }
    throw new ApiError(detail, res.status);
  }

  return res.json();
}

export function fetchLeads() {
  return request('/data');
}

export function classifyLead(leadId) {
  return request(`/leads/${leadId}/classify`, { method: 'POST' });
}

export { ApiError };