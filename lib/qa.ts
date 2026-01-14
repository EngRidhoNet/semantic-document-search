import type { SearchResult, QAResponse } from './types';

/**
 * Generate an extractive answer from search results
 * Returns the most relevant sentence/paragraph as a direct quote
 * NO generative AI - purely extractive
 */
export async function generateGroundedAnswer(
    query: string,
    searchResults: SearchResult[]
): Promise<QAResponse> {
    if (searchResults.length === 0) {
        return {
            answer: 'No relevant information found in the uploaded documents.',
            sources: [],
        };
    }

    // Get the top result as the most relevant
    const topResult = searchResults[0];

    // Extract the most relevant sentence from the top result
    const answer = extractBestSentence(query, topResult.content);

    if (!answer) {
        return {
            answer: 'The answer was not found in the uploaded documents.',
            sources: searchResults,
        };
    }

    return {
        answer,
        sources: searchResults,
    };
}

/**
 * Extract the most relevant sentence from content based on query keywords
 */
function extractBestSentence(query: string, content: string): string | null {
    // Split content into sentences
    const sentences = content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 20); // Filter very short fragments

    if (sentences.length === 0) {
        // If no good sentences, return trimmed content
        return content.length > 300 ? content.substring(0, 300) + '...' : content;
    }

    // Get query keywords (lowercase, remove common words)
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 'where', 'which', 'who', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will', 'to', 'for', 'of', 'in', 'on', 'at', 'by', 'with', 'from', 'and', 'or', 'but', 'not', 'this', 'that', 'these', 'those', 'it', 'its']);
    const queryKeywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

    // Score each sentence by keyword overlap
    let bestSentence = sentences[0];
    let bestScore = 0;

    for (const sentence of sentences) {
        const sentenceLower = sentence.toLowerCase();
        let score = 0;

        for (const keyword of queryKeywords) {
            if (sentenceLower.includes(keyword)) {
                score += 1;
            }
        }

        // Bonus for shorter, more focused sentences
        if (sentence.length < 200) {
            score += 0.5;
        }

        if (score > bestScore) {
            bestScore = score;
            bestSentence = sentence;
        }
    }

    // Format the answer
    const trimmedAnswer = bestSentence.trim();

    // Add ellipsis if it looks like a fragment
    if (!trimmedAnswer.match(/[.!?]$/)) {
        return `"${trimmedAnswer}..."`;
    }

    return `"${trimmedAnswer}"`;
}
