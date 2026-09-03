import StatusPill from './StatusPill';
import AddLead from './AddLead';
import { formatConfidence, shortUrl } from '../utils/utils';

export default function LeadList({ leads, selectedId, onSelect, showAddForm, onToggleAddForm, onLeadCreated }) {
  return (
    <div className="w-[340px] shrink-0 border-r border-border flex flex-col overflow-hidden">
      <div className="px-[18px] py-4 border-b border-border flex items-baseline justify-between">
        <h1 className="text-[13px] font-semibold uppercase tracking-wide m-0">Leads</h1>
        <div className="flex items-center gap-3">
          <span className="font-mono text-secondary text-xs">{leads.length}</span>
          <button
            onClick={onToggleAddForm}
            className="text-accent text-xs font-medium hover:opacity-75"
          >
            {showAddForm ? 'Close' : '+ Add lead'}
          </button>
        </div>
      </div>

      {showAddForm && <AddLead onCreated={onLeadCreated} onCancel={onToggleAddForm} />}

      <div className="overflow-y-auto flex-1">
        {leads.length === 0 && (
          <div className="px-[18px] py-8 text-secondary text-xs">No leads to review.</div>
        )}

        {leads.map((lead) => {
          const isSelected = lead.id === selectedId;
          return (
            <button
              key={lead.id}
              onClick={() => onSelect(lead.id)}
              className={`w-full text-left flex flex-col gap-1 px-[18px] py-3 border-b border-border border-l-2 hover:bg-[#F2F1ED] ${
                isSelected ? 'border-l-accent bg-[#F0F3F1]' : 'border-l-transparent bg-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-[13px] truncate">{lead.companyName}</span>
              </div>

              {lead.url && (
                <span className="font-mono text-[11px] text-secondary truncate">
                  {shortUrl(lead.url)}
                </span>
              )}

              <div className="flex items-center gap-2 font-mono text-[11px] text-secondary">
                <StatusPill category={lead.category} />
                <span>{formatConfidence(lead.confidence)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}