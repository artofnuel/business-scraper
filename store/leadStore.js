import { create } from 'zustand';

export const useLeadStore = create((set, get) => ({
  niche: '',
  location: '',
  source: 'google',
  loading: false,
  results: [],

  setNiche: (niche) => set({ niche }),
  setLocation: (location) => set({ location }),
  setSource: (source) => set({ source }),
  setResults: (results) => set({ results }),
  
  searchBusinesses: async () => {
    const { niche, location, source } = get();
    if (!niche || !location || !source) return;

    set({ loading: true, results: [] });

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, location, source }),
      });

      if (!response.ok) {
         throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      set({ results: data.results || [] });
    } catch (error) {
      console.error('Search error:', error);
      // Could add an error state here if needed
    } finally {
      set({ loading: false });
    }
  },
}));
