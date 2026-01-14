'use client';

import { useState, useCallback } from 'react';

interface SearchInputProps {
    onSearch: (query: string, includeAnswer: boolean) => Promise<void>;
    isSearching: boolean;
    disabled?: boolean;
}

export function SearchInput({ onSearch, isSearching, disabled }: SearchInputProps) {
    const [query, setQuery] = useState('');
    const [includeAnswer, setIncludeAnswer] = useState(true);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isSearching && !disabled) {
            await onSearch(query.trim(), includeAnswer);
        }
    }, [query, includeAnswer, isSearching, disabled, onSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-input-wrapper">
                    <div className="search-icon">
                        {isSearching ? (
                            <div className="spinner-small" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        )}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question or search your documents…"
                        disabled={disabled || isSearching}
                        className="search-input"
                    />
                    {query && !isSearching && (
                        <button
                            type="button"
                            className="clear-button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M15 9l-6 6M9 9l6 6" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="search-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={includeAnswer}
                            onChange={(e) => setIncludeAnswer(e.target.checked)}
                            disabled={disabled || isSearching}
                        />
                        <span>Generate AI answer</span>
                    </label>
                    <button
                        type="submit"
                        disabled={!query.trim() || isSearching || disabled}
                        className="search-button"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>
        </div>
    );
}
