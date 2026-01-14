// Core data models for the Semantic Search platform

export interface DocumentSource {
  documentName: string;
  page: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  source: DocumentSource;
}

export interface SearchResult {
  content: string;
  score: number;
  source: DocumentSource;
}

export interface QAResponse {
  answer: string;
  sources: SearchResult[];
}

export interface IngestResponse {
  success: boolean;
  documentName: string;
  chunkCount: number;
  message: string;
}

export interface SearchRequest {
  query: string;
  includeAnswer?: boolean;
  topK?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  answer?: QAResponse;
}

export interface UploadedDocument {
  name: string;
  chunkCount: number;
  uploadedAt: Date;
}
