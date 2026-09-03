import StatusPill from './StatusPill';
import { formatConfidence, formatTimestamp, shortUrl } from '../utils/utils';

export default function LeadDetail({ lead, classifying, error, onClassify }) {
  if (!lead) {
    return (
      <div className="flex-1 flex items-center justify-center text-secondary text-[13px]">
        Select a lead to review its classification.
      </div>
    );
  }

  const hasResult = Boolean(lead.category);
  const buttonLabel = classifying ? 'Classifying…' : hasResult ? 'Reclassify' : 'Classify';

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="px-7 py-5 border-b border-border flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold m-0 mb-1">{lead.companyName}</h2>
          {lead.url ? (
            <a
              href={lead.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-secondary no-underline hover:text-ink hover:underline"
            >
              {shortUrl(lead.url)}
            </a>
          ) : (
            <span className="font-mono text-xs text-secondary">no url on file</span>
          )}
        </div>

        <button
          onClick={onClassify}
          disabled={classifying}
          className="shrink-0 border rounded px-[14px] py-2 text-xs font-medium transition-opacity
            border-accent bg-accent text-bg hover:opacity-85
            disabled:bg-border disabled:border-border disabled:text-secondary disabled:cursor-not-allowed"
        >
          {classifying && <span className="spinner mr-1.5 align-middle" />}
          {buttonLabel}
        </button>
      </div>

      {error && (
        <div className="mx-7 mt-4 px-3 py-2.5 border border-error text-error text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
          {error}
        </div>
      )}

      <div className="px-7 py-6 flex flex-col gap-6 max-w-[640px]">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Category
          </span>
          <StatusPill category={lead.category} tone={hasResult ? 'accent' : 'default'} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Confidence
          </span>
          <span className="font-mono text-[28px] font-medium">{formatConfidence(lead.confidence)}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Reasoning
          </span>
          <div className="text-[13px] leading-relaxed border-l-2 border-border pl-3.5 whitespace-pre-wrap">
            {lead.reasoning || 'No classification has been run for this lead yet.'}
          </div>
        </div>

        <div className="flex gap-6 pt-1 border-t border-border">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Model
            </span>
            <span className="font-mono text-[13px]">{lead.model || '—'}</span>
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Classified at
            </span>
            <span className="font-mono text-[13px]">{formatTimestamp(lead.classifiedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}