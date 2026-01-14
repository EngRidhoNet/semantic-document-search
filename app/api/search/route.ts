import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch, hasDocuments } from '@/lib/search';
import { generateGroundedAnswer } from '@/lib/qa';
import type { SearchRequest, SearchResponse, SearchResult, QAResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
    try {
        const body: SearchRequest = await request.json();
        const { query, includeAnswer = false, topK = 5 } = body;

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { results: [], answer: undefined },
                { status: 400 }
            );
        }

        // Check if any documents are indexed
        if (!hasDocuments()) {
            const noDocsResponse: SearchResponse = {
                results: [],
            };

            if (includeAnswer) {
                noDocsResponse.answer = {
                    answer: 'No documents have been uploaded yet. Please upload a PDF to search.',
                    sources: [],
                };
            }

            return NextResponse.json(noDocsResponse);
        }

        // Perform semantic search
        const results: SearchResult[] = await semanticSearch(query, { topK });

        // Build response
        const response: SearchResponse = { results };

        // Generate grounded answer if requested
        if (includeAnswer) {
            const qaResponse: QAResponse = await generateGroundedAnswer(query, results);
            response.answer = qaResponse;
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            {
                results: [],
                answer: {
                    answer: 'An error occurred during search. Please try again.',
                    sources: [],
                }
            },
            { status: 500 }
        );
    }
}
