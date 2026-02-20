'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SearchResults } from '@/components/SearchResults';
import { ConversationRecord } from '@/lib/db/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [results, setResults] = useState<ConversationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results || []);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto max-w-6xl flex items-center">
          <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-red-800 font-bold flex items-center">
            <span>AI Archives - Search</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Semantic Search
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Find conversations by meaning, not just keywords
          </p>
          
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {hasSearched && (
          <SearchResults results={results} query={query} />
        )}
      </main>
    </div>
  );
}
