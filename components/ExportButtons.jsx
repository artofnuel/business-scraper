"use client";

import { useLeadStore } from '@/store/leadStore';
import { DownloadCloud, FileSpreadsheet } from 'lucide-react';

export default function ExportButtons() {
  const { results, loading } = useLeadStore();

  if (loading || results.length === 0) return null;

  const exportData = async (format) => {
    try {
      const response = await fetch(`/api/export?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export. Check console for details.');
    }
  };

  return (
    <div className="flex gap-4 mt-6">
      <button 
        onClick={() => exportData('csv')}
        className="flex items-center gap-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
      >
        <DownloadCloud className="w-4 h-4 text-neutral-500" />
        Download CSV
      </button>
      <button 
        onClick={() => exportData('excel')}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Download Excel
      </button>
    </div>
  );
}
