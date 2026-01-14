/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

    if (magnitude === 0) {
        return 0;
    }

    return dotProduct / magnitude;
}

/**
 * Find the top K most similar items from a list
 * Returns indices and similarity scores sorted by score descending
 */
export function findTopKSimilar(
    queryEmbedding: number[],
    embeddings: number[][],
    k: number
): { index: number; score: number }[] {
    const scores = embeddings.map((embedding, index) => ({
        index,
        score: cosineSimilarity(queryEmbedding, embedding),
    }));

    // Sort by score descending and take top K
    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
}
