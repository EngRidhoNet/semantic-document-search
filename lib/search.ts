import type { DocumentChunk, SearchResult } from './types';
import { generateEmbedding } from './embed';
import { cosineSimilarity } from './similarity';
import { getAllChunks } from './store';

// Minimum similarity score to consider a result relevant
const RELEVANCE_THRESHOLD = 0.3;
const DEFAULT_TOP_K = 5;

export interface SearchOptions {
    topK?: number;
    minScore?: number;
}

/**
 * Perform semantic search over stored documents
 * Returns top K most relevant chunks with similarity scores
 */
export async function semanticSearch(
    query: string,
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    const { topK = DEFAULT_TOP_K, minScore = RELEVANCE_THRESHOLD } = options;

    const chunks = getAllChunks();

    if (chunks.length === 0) {
        return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Calculate similarity scores for all chunks
    const scoredChunks = chunks.map(chunk => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // Filter by minimum score and take top K
    const relevantChunks = scoredChunks
        .filter(item => item.score >= minScore)
        .slice(0, topK);

    // Transform to SearchResult format
    return relevantChunks.map(({ chunk, score }) => ({
        content: chunk.content,
        score,
        source: chunk.source,
    }));
}

/**
 * Check if there are any documents indexed
 */
export function hasDocuments(): boolean {
    return getAllChunks().length > 0;
}
