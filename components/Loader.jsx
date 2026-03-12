import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-neutral-500">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
      <p className="text-sm font-medium animate-pulse">Searching businesses & scraping websites...</p>
    </div>
  );
}
