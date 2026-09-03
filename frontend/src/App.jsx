import { useEffect, useState, useCallback } from 'react';
import LeadList from './components/LeadList';
import LeadDetail from './components/LeadDetail';
import { fetchLeads, classifyLead, ApiError } from './api/api.js';
import { normalizeLead } from './utils/utils.js';
import './index.css';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Per-lead classify state, keyed by lead id, so classifying one
  // lead never disables the button on another.
  const [classifyingId, setClassifyingId] = useState(null);
  const [classifyErrors, setClassifyErrors] = useState({});

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await fetchLeads();
      const normalized = raw.map(normalizeLead);
      setLeads(normalized);
      setSelectedId((current) => current ?? normalized[0]?.id ?? null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleClassify = useCallback(async () => {
    if (selectedId == null || classifyingId != null) return;

    setClassifyingId(selectedId);
    setClassifyErrors((prev) => ({ ...prev, [selectedId]: null }));

    try {
      const saved = await classifyLead(selectedId);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === selectedId
            ? {
                ...lead,
                category: saved.category,
                confidence: saved.confidence,
                reasoning: saved.reasoning,
                model: saved.model,
                classifiedAt: saved.created_at ?? saved.classified_at ?? new Date().toISOString(),
              }
            : lead
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 409
            ? 'This lead is already being classified.'
            : err.message
          : 'Classification failed.';
      setClassifyErrors((prev) => ({ ...prev, [selectedId]: message }));
    } finally {
      setClassifyingId(null);
    }
  }, [selectedId, classifyingId]);

  const selectedLead = leads.find((l) => l.id === selectedId) || null;

  return (
    <div className="flex h-screen items-stretch">
      <LeadList leads={leads} selectedId={selectedId} onSelect={setSelectedId} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-secondary text-[13px]">
          Loading leads…
        </div>
      ) : loadError ? (
        <div className="flex-1 flex items-center justify-center text-error text-[13px]">
          {loadError}
        </div>
      ) : (
        <LeadDetail
          lead={selectedLead}
          classifying={classifyingId === selectedId}
          error={selectedLead ? classifyErrors[selectedLead.id] : null}
          onClassify={handleClassify}
        />
      )}
    </div>
  );
}