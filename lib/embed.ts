import { pipeline, env, type FeatureExtractionPipeline, type Tensor } from '@xenova/transformers';

// Configure transformers.js for server-side usage
env.allowLocalModels = false;
env.useBrowserCache = false;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;

// Singleton pattern for the embedding pipeline
let embeddingPipeline: FeatureExtractionPipeline | null = null;

async function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
    if (!embeddingPipeline) {
        embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME) as FeatureExtractionPipeline;
    }
    return embeddingPipeline;
}

/**
 * Generate embedding for a single text string using local model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text, { pooling: 'mean', normalize: true }) as Tensor;
    return Array.from(output.data as Float32Array);
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
        return [];
    }

    const extractor = await getEmbeddingPipeline();
    const embeddings: number[][] = [];

    // Process one at a time for stability
    for (const text of texts) {
        const output = await extractor(text, { pooling: 'mean', normalize: true }) as Tensor;
        embeddings.push(Array.from(output.data as Float32Array));
    }

    return embeddings;
}

/**
 * Get the expected embedding dimensions
 */
export function getEmbeddingDimensions(): number {
    return EMBEDDING_DIMENSIONS;
}
