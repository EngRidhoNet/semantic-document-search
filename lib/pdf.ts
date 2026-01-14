const pdfParse = require('pdf-parse');

export interface PDFExtractResult {
    text: string;
    pageCount: number;
    pages: string[];
}

/**
 * Extract text content from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractResult> {
    const data = await pdfParse(buffer);

    const text: string = data.text;
    const pageCount: number = data.numpages;

    // Split text into pages (pdf-parse v1 doesn't provide per-page text)
    const pages = splitIntoPages(text, pageCount);

    return {
        text,
        pageCount,
        pages,
    };
}

/**
 * Split text into approximate pages
 */
function splitIntoPages(text: string, pageCount: number): string[] {
    // Try splitting by form feed character first
    const formFeedSplit = text.split('\f');
    if (formFeedSplit.length === pageCount) {
        return formFeedSplit.map(page => page.trim()).filter(p => p.length > 0);
    }

    // If no form feeds, distribute text evenly across pages
    if (pageCount <= 1) {
        return [text.trim()].filter(p => p.length > 0);
    }

    // Split by double newlines and distribute
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    const paragraphsPerPage = Math.ceil(paragraphs.length / pageCount);

    const pages: string[] = [];
    for (let i = 0; i < pageCount; i++) {
        const start = i * paragraphsPerPage;
        const end = start + paragraphsPerPage;
        const pageParagraphs = paragraphs.slice(start, end);
        pages.push(pageParagraphs.join('\n\n').trim());
    }

    return pages.filter(p => p.length > 0);
}
