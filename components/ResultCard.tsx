import { SourceBadge } from './SourceBadge';
import type { SearchResult } from '@/lib/types';

interface ResultCardProps {
    result: SearchResult;
    index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
    const relevancePercent = Math.round(result.score * 100);

    return (
        <div className="result-card" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="result-header">
                <SourceBadge
                    documentName={result.source.documentName}
                    page={result.source.page}
                />
                <span className="relevance-score">
                    {relevancePercent}% match
                </span>
            </div>
            <p className="result-content">{result.content}</p>
        </div>
    );
}
