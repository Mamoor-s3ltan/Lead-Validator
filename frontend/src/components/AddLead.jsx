import { useState } from 'react';
import { createLead, ApiError } from '../api/api';

const inputClasses =
  'w-full bg-transparent border border-border px-2.5 py-1.5 text-[13px] text-ink placeholder:text-secondary ' +
  'focus:outline-none focus:border-accent';

export default function AddLead({ onCreated, onCancel }) {
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const lead = await createLead({ companyName: companyName.trim(), url: companyUrl.trim() });
      setCompanyName('');
      setCompanyUrl('');
      onCreated?.(lead);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add lead.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-[18px] py-3 border-b border-border flex flex-col gap-2">
      <input
        type="text"
        placeholder="Company name"
        required
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className={inputClasses}
      />
      <input
        type="url"
        placeholder="Company url"
        required
        value={companyUrl}
        onChange={(e) => setCompanyUrl(e.target.value)}
        className={inputClasses}
      />

      {error && (
        <div className="text-error text-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="submit"
          disabled={submitting}
          className="border border-accent bg-accent text-bg text-xs font-medium px-3 py-1.5 rounded
            hover:opacity-85 disabled:bg-border disabled:border-border disabled:text-secondary disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding…' : 'Add lead'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-secondary text-xs px-2 py-1.5 hover:text-ink disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}