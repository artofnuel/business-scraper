"use client";

import { useLeadStore } from '@/store/leadStore';

export default function SearchForm() {
  const { niche, location, source, loading, setNiche, setLocation, setSource, searchBusinesses } = useLeadStore();

  const handleSearch = (e) => {
    e.preventDefault();
    searchBusinesses();
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-700 mb-1">Business Niche</label>
        <input 
          type="text" 
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. Plumbers" 
          className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          required
          disabled={loading}
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
        <input 
          type="text" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Houston" 
          className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          required
          disabled={loading}
        />
      </div>

      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-neutral-700 mb-1">Source</label>
        <select 
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          disabled={loading}
        >
          <option value="google">Google Places</option>
          <option value="osm">OpenStreetMap</option>
        </select>
      </div>

      <div className="flex items-end">
        <button 
          type="submit" 
          disabled={loading || !niche || !location}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-6 rounded-lg transition-colors h-[42px]"
        >
          {loading ? 'Searching...' : 'Find Businesses'}
        </button>
      </div>
    </form>
  );
}
