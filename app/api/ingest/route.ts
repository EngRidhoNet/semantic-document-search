import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf';
import { chunkDocument } from '@/lib/chunk';
import { generateEmbeddings } from '@/lib/embed';
import { addChunks, addDocument, canAddDocument, documentExists, DEMO_LIMITS } from '@/lib/store';
import type { DocumentChunk, IngestResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<IngestResponse>> {
    try {
        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, documentName: '', chunkCount: 0, message: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { success: false, documentName: file.name, chunkCount: 0, message: 'Only PDF files are supported' },
                { status: 400 }
            );
        }

        // Validate file size (demo mode limit)
        if (file.size > DEMO_LIMITS.maxFileSizeBytes) {
            return NextResponse.json(
                {
                    success: false,
                    documentName: file.name,
                    chunkCount: 0,
                    message: `File size exceeds ${DEMO_LIMITS.maxFileSizeMB}MB limit`
                },
                { status: 400 }
            );
        }

        // Check document limit
        if (!canAddDocument()) {
            return NextResponse.json(
                {
                    success: false,
                    documentName: file.name,
                    chunkCount: 0,
                    message: `Maximum ${DEMO_LIMITS.maxDocuments} documents allowed in demo mode`
                },
                { status: 400 }
            );
        }

        // Check for duplicate
        if (documentExists(file.name)) {
            return NextResponse.json(
                { success: false, documentName: file.name, chunkCount: 0, message: 'Document already uploaded' },
                { status: 400 }
            );
        }

        // Extract text from PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { pages } = await extractTextFromPDF(buffer);

        if (pages.length === 0 || pages.every(p => p.trim().length === 0)) {
            return NextResponse.json(
                { success: false, documentName: file.name, chunkCount: 0, message: 'No text content found in PDF' },
                { status: 400 }
            );
        }

        // Chunk the document
        const chunksWithoutEmbeddings = chunkDocument(pages, file.name);

        if (chunksWithoutEmbeddings.length === 0) {
            return NextResponse.json(
                { success: false, documentName: file.name, chunkCount: 0, message: 'Could not extract meaningful content' },
                { status: 400 }
            );
        }

        // Generate embeddings for all chunks
        const texts = chunksWithoutEmbeddings.map(chunk => chunk.content);
        const embeddings = await generateEmbeddings(texts);

        // Combine chunks with embeddings
        const chunks: DocumentChunk[] = chunksWithoutEmbeddings.map((chunk, index) => ({
            ...chunk,
            embedding: embeddings[index],
        }));

        // Store chunks and document
        addChunks(chunks);
        addDocument({
            name: file.name,
            chunkCount: chunks.length,
            uploadedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            documentName: file.name,
            chunkCount: chunks.length,
            message: `Successfully processed ${file.name}`,
        });
    } catch (error) {
        console.error('Ingest error:', error);
        return NextResponse.json(
            {
                success: false,
                documentName: '',
                chunkCount: 0,
                message: error instanceof Error ? error.message : 'Failed to process document'
            },
            { status: 500 }
        );
    }
}
