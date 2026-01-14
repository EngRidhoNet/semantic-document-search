'use client';

import { useCallback, useState } from 'react';

interface UploadAreaProps {
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
    disabled?: boolean;
}

export function UploadArea({ onUpload, isUploading, disabled }: UploadAreaProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): string | null => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return 'Only PDF files are supported';
        }
        if (file.size > 5 * 1024 * 1024) {
            return 'File size must be less than 5MB';
        }
        return null;
    };

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        try {
            await onUpload(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
    }, [onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled || isUploading) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [disabled, isUploading, handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled && !isUploading) {
            setIsDragOver(true);
        }
    }, [disabled, isUploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
        // Reset input
        e.target.value = '';
    }, [handleFile]);

    return (
        <div className="upload-area-container">
            <div
                className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleInputChange}
                    disabled={disabled || isUploading}
                    className="file-input"
                    id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="upload-label">
                    <div className="upload-icon">
                        {isUploading ? (
                            <div className="spinner" />
                        ) : (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        )}
                    </div>
                    <div className="upload-text">
                        {isUploading ? (
                            <span>Processing document...</span>
                        ) : (
                            <>
                                <span className="upload-primary">Drop a PDF here</span>
                                <span className="upload-secondary">or click to browse</span>
                            </>
                        )}
                    </div>
                    <div className="upload-hint">
                        PDF files up to 5MB
                    </div>
                </label>
            </div>
            {error && <div className="upload-error">{error}</div>}
        </div>
    );
}
