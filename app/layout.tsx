import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semantic Search | Business Document Intelligence",
  description: "Search your business documents using natural language. Upload PDFs and ask questions grounded in your document content.",
  keywords: ["semantic search", "document search", "PDF search", "business intelligence", "AI search"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
