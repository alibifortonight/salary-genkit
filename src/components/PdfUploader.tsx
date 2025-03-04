'use client';

import { useState, useRef } from 'react';
import styles from '@/styles/PdfUploader.module.css';
import { CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalysisResult from './AnalysisResult';
import { SalaryAnalysis } from '@/app/genkit';

// Extend the SalaryAnalysis type to include an optional error field
interface SalaryAnalysisWithError extends SalaryAnalysis {
  error?: string;
}

export default function PdfUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryAnalysisWithError | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      analyzeResume(selectedFile);
    }
  };

  const analyzeResume = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume');
      }

      const data = await response.json();
      console.log('[PdfUploader] API response data:', JSON.stringify(data, null, 2));
      
      // Validate that the required fields are present
      if (!data.currentSalary && data.currentSalary !== 0) {
        console.error('[PdfUploader] Missing currentSalary in response');
      }
      if (!data.marketRate && data.marketRate !== 0) {
        console.error('[PdfUploader] Missing marketRate in response');
      }
      
      setResult(data);
    } catch (err) {
      console.error('[PdfUploader] Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      analyzeResume(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div
        className={`${styles.dropzone} ${loading ? styles.loading : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
        {loading ? (
          <div className="flex flex-col items-center">
            <CircularProgress size={48} />
            <p className="mt-4 text-gray-600">Analyzing your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <CloudUploadIcon className="text-6xl text-blue-500 mb-4" />
            <p className="text-lg font-semibold mb-2">
              Drop your resume here or click to upload
            </p>
            <p className="text-sm text-gray-500">Supports PDF files</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <ErrorOutlineIcon className="mr-2" />
          {error}
        </div>
      )}

      {result && !error && <AnalysisResult result={result} />}
    </div>
  );
}
