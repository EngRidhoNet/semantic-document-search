import { v4 as uuidv4 } from 'uuid';
import type { DocumentChunk, DocumentSource } from './types';

export interface ChunkOptions {
    minChunkLength?: number;
    maxChunkLength?: number;
}

const DEFAULT_OPTIONS: ChunkOptions = {
    minChunkLength: 50,
    maxChunkLength: 1000,
};

/**
 * Split text into paragraph-level chunks with metadata
 * Each chunk includes source document name and page number
 */
export function chunkDocument(
    pages: string[],
    documentName: string,
    options: ChunkOptions = {}
): Omit<DocumentChunk, 'embedding'>[] {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const chunks: Omit<DocumentChunk, 'embedding'>[] = [];

    pages.forEach((pageText, pageIndex) => {
        const pageNumber = pageIndex + 1;
        const paragraphs = splitIntoParagraphs(pageText, opts);

        paragraphs.forEach((content) => {
            if (content.length >= opts.minChunkLength!) {
                chunks.push({
                    id: uuidv4(),
                    content: content.trim(),
                    source: {
                        documentName,
                        page: pageNumber,
                    },
                });
            }
        });
    });

    return chunks;
}

/**
 * Split page text into meaningful paragraphs
 * Handles various text formats and ensures reasonable chunk sizes
 */
function splitIntoParagraphs(text: string, options: ChunkOptions): string[] {
    // First, split by double newlines (natural paragraph breaks)
    let paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

    // If paragraphs are too long, split further by single newlines
    const result: string[] = [];

    for (const paragraph of paragraphs) {
        if (paragraph.length <= options.maxChunkLength!) {
            result.push(paragraph);
        } else {
            // Split long paragraphs by sentences or single newlines
            const subParts = splitLongParagraph(paragraph, options.maxChunkLength!);
            result.push(...subParts);
        }
    }

    return result;
}

/**
 * Split a long paragraph into smaller chunks while preserving meaning
 */
function splitLongParagraph(text: string, maxLength: number): string[] {
    // Try splitting by single newlines first
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length > 1 && lines.every(l => l.length <= maxLength)) {
        return combineLinesToChunks(lines, maxLength);
    }

    // Fall back to sentence splitting
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return combineLinesToChunks(sentences.map(s => s.trim()), maxLength);
}

/**
 * Combine lines/sentences into chunks that don't exceed maxLength
 */
function combineLinesToChunks(items: string[], maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    for (const item of items) {
        const potentialChunk = currentChunk ? `${currentChunk} ${item}` : item;

        if (potentialChunk.length <= maxLength) {
            currentChunk = potentialChunk;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk);
            }
            // If single item is too long, include it anyway (better than losing content)
            currentChunk = item;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}
