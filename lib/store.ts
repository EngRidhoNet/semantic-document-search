import type { DocumentChunk, UploadedDocument } from './types';

/**
 * In-memory vector store for document chunks
 * Uses module-level singleton pattern for serverless compatibility
 */

// Global store - persists across requests in the same serverless instance
let chunks: DocumentChunk[] = [];
let documents: UploadedDocument[] = [];

// Demo mode limits
const MAX_DOCUMENTS = 5;
const MAX_FILE_SIZE_MB = 5;

export const DEMO_LIMITS = {
    maxDocuments: MAX_DOCUMENTS,
    maxFileSizeMB: MAX_FILE_SIZE_MB,
    maxFileSizeBytes: MAX_FILE_SIZE_MB * 1024 * 1024,
};

/**
 * Add chunks to the store
 */
export function addChunks(newChunks: DocumentChunk[]): void {
    chunks = [...chunks, ...newChunks];
}

/**
 * Add a document record
 */
export function addDocument(doc: UploadedDocument): void {
    documents = [...documents, doc];
}

/**
 * Get all chunks
 */
export function getAllChunks(): DocumentChunk[] {
    return chunks;
}

/**
 * Get all documents
 */
export function getAllDocuments(): UploadedDocument[] {
    return documents;
}

/**
 * Get chunk count
 */
export function getChunkCount(): number {
    return chunks.length;
}

/**
 * Get document count
 */
export function getDocumentCount(): number {
    return documents.length;
}

/**
 * Check if we can add more documents (demo mode limit)
 */
export function canAddDocument(): boolean {
    return documents.length < MAX_DOCUMENTS;
}

/**
 * Check if a document with this name already exists
 */
export function documentExists(name: string): boolean {
    return documents.some(doc => doc.name === name);
}

/**
 * Remove a document and its chunks
 */
export function removeDocument(name: string): void {
    chunks = chunks.filter(chunk => chunk.source.documentName !== name);
    documents = documents.filter(doc => doc.name !== name);
}

/**
 * Clear all data (reset store)
 */
export function clearStore(): void {
    chunks = [];
    documents = [];
}

/**
 * Get store statistics
 */
export function getStoreStats(): {
    documentCount: number;
    chunkCount: number;
    canAddMore: boolean;
} {
    return {
        documentCount: documents.length,
        chunkCount: chunks.length,
        canAddMore: canAddDocument(),
    };
}
