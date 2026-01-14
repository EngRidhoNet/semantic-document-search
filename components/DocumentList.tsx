import type { UploadedDocument } from '@/lib/types';

interface DocumentListProps {
    documents: UploadedDocument[];
    maxDocuments: number;
}

export function DocumentList({ documents, maxDocuments }: DocumentListProps) {
    if (documents.length === 0) {
        return null;
    }

    return (
        <div className="document-list">
            <div className="document-list-header">
                <span className="document-count">
                    {documents.length} of {maxDocuments} documents
                </span>
            </div>
            <div className="document-items">
                {documents.map((doc, index) => (
                    <div key={index} className="document-item">
                        <div className="document-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div className="document-info">
                            <span className="document-name">{doc.name}</span>
                            <span className="document-chunks">{doc.chunkCount} chunks</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
