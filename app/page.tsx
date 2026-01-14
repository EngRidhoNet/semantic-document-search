'use client';

import { useState, useCallback } from 'react';
import { UploadArea } from '@/components/UploadArea';
import { SearchInput } from '@/components/SearchInput';
import { ResultCard } from '@/components/ResultCard';
import { AnswerBox } from '@/components/AnswerBox';
import { DocumentList } from '@/components/DocumentList';
import type { SearchResult, QAResponse, UploadedDocument, IngestResponse, SearchResponse } from '@/lib/types';

const MAX_DOCUMENTS = 5;

export default function Home() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<QAResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const data: IngestResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      setDocuments(prev => [...prev, {
        name: data.documentName,
        chunkCount: data.chunkCount,
        uploadedAt: new Date(),
      }]);

      // Clear previous search results when new document is uploaded
      setSearchResults([]);
      setAnswer(null);
      setHasSearched(false);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string, includeAnswer: boolean) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          includeAnswer,
          topK: 5,
        }),
      });

      const data: SearchResponse = await response.json();

      setSearchResults(data.results);
      setAnswer(data.answer || null);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setAnswer({
        answer: 'An error occurred during search. Please try again.',
        sources: [],
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const canUpload = documents.length < MAX_DOCUMENTS;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Semantic Search</h1>
        <p>Search your documents like a human, not keywords</p>
      </header>

      <main className="main-content">
        {/* Upload Section */}
        <UploadArea
          onUpload={handleUpload}
          isUploading={isUploading}
          disabled={!canUpload}
        />

        {/* Document List */}
        <DocumentList documents={documents} maxDocuments={MAX_DOCUMENTS} />

        {/* Search Section - Only show when documents exist */}
        {documents.length > 0 && (
          <>
            <SearchInput
              onSearch={handleSearch}
              isSearching={isSearching}
              disabled={documents.length === 0}
            />

            {/* Results Section */}
            {hasSearched && (
              <div className="results-section">
                {/* AI Answer */}
                {answer && <AnswerBox response={answer} />}

                {/* Search Results */}
                {searchResults.length > 0 ? (
                  <>
                    <div className="results-header">
                      {searchResults.length} Relevant Passages
                    </div>
                    {searchResults.map((result, index) => (
                      <ResultCard key={index} result={result} index={index} />
                    ))}
                  </>
                ) : (
                  !answer && (
                    <div className="no-results">
                      No relevant information found in the uploaded documents.
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
