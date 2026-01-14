import { SourceBadge } from './SourceBadge';
import type { QAResponse } from '@/lib/types';

interface AnswerBoxProps {
    response: QAResponse;
}

export function AnswerBox({ response }: AnswerBoxProps) {
    return (
        <div className="answer-box">
            <div className="answer-header">
                <div className="answer-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                </div>
                <span className="answer-label">AI Answer</span>
            </div>
            <div className="answer-content">
                <p>{response.answer}</p>
            </div>
            {response.sources.length > 0 && (
                <div className="answer-sources">
                    <span className="sources-label">Based on {response.sources.length} source{response.sources.length > 1 ? 's' : ''}</span>
                    <div className="sources-list">
                        {response.sources.map((source, index) => (
                            <SourceBadge
                                key={index}
                                documentName={source.source.documentName}
                                page={source.source.page}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
