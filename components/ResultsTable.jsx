"use client";

import { useLeadStore } from '@/store/leadStore';

const EMAIL_SOURCE_BADGE = {
  homepage: { label: 'Homepage', className: 'bg-emerald-100 text-emerald-700' },
  'contact-page': { label: 'Contact Page', className: 'bg-blue-100 text-blue-700' },
  'domain-pattern': { label: 'Domain Pattern', className: 'bg-amber-100 text-amber-700' },
};

function EmailSourceBadge({ source }) {
  if (!source) return <span className="text-neutral-400">—</span>;
  const badge = EMAIL_SOURCE_BADGE[source];
  if (!badge) return <span className="text-neutral-400">—</span>;
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
}

export default function ResultsTable() {
  const { results, loading } = useLeadStore();

  if (loading || results.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden mt-8 w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-neutral-600 text-sm border-b border-neutral-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Email Source</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Website</th>
              <th className="p-4 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {results.map((lead, i) => (
              <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50 last:border-0 transition-colors">
                <td className="p-4 font-medium text-neutral-900">{lead.name || 'N/A'}</td>
                <td className="p-4 text-neutral-600">{lead.category || 'N/A'}</td>
                <td className="p-4 text-neutral-600">{lead.location || 'N/A'}</td>
                <td className="p-4 text-neutral-600">{lead.email || 'N/A'}</td>
                <td className="p-4">
                  <EmailSourceBadge source={lead.emailSource} />
                </td>
                <td className="p-4 text-neutral-600">{lead.phone || 'N/A'}</td>
                <td className="p-4">
                  {lead.website && lead.website !== 'N/A' ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      Link
                    </a>
                  ) : 'N/A'}
                </td>
                <td className="p-4 text-neutral-500 text-xs">
                  <span className="bg-neutral-100 px-2 py-1 rounded-md">{lead.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-neutral-200 text-xs text-neutral-500">
        Found {results.length} businesses
      </div>
    </div>
  );
}
