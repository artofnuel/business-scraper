"use client";

import { useLeadStore } from '@/store/leadStore';
import SearchForm from '@/components/SearchForm';
import Loader from '@/components/Loader';
import ResultsTable from '@/components/ResultsTable';
import ExportButtons from '@/components/ExportButtons';

export default function Home() {
  const { loading } = useLeadStore();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            NWS — Nuel&apos;s Web Scrapper
          </h1>
          <p className="mt-2 text-neutral-500 max-w-2xl mx-auto">
            Simple Business Lead Scraper. Search for a niche in a location and automatically scrape websites for emails.
          </p>
        </header>

        <section className="mb-12">
          <SearchForm />
        </section>

        {loading && (
          <div className="my-16">
            <Loader />
          </div>
        )}

        {!loading && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ExportButtons />
            <ResultsTable />
          </section>
        )}
      </main>
    </div>
  );
}
