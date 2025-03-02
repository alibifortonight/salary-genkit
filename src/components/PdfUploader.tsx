'use client';

import { useState, useRef } from 'react';
import styles from '@/styles/PdfUploader.module.css';
import { CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface SalaryAnalysisResponse {
  salary: {
    amount: string;
    currency: string;
    period: string;
  };
  experience: {
    level: string;
    years: number;
    skills: string[];
  };
  market: {
    demand: string;
    reasons: string[];
    location: string;
    industry: string;
  };
  analysis: {
    factors: string[];
    considerations: string[];
    confidence: number;
  };
  error?: string;
}

export default function PdfUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryAnalysisResponse | null>(null);

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

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      analyzeResume(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
        <CloudUploadIcon className="text-gray-400 text-5xl mb-4" />
        <h2 className="text-xl font-semibold mb-2">Upload Your Resume</h2>
        <p className="text-gray-500">
          Drag and drop your PDF resume here, or click to select
        </p>
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <CircularProgress />
          <p className="mt-4">Analyzing your resume...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 text-center text-red-600">
          <ErrorOutlineIcon className="text-4xl mb-2" />
          <p>{error}</p>
        </div>
      )}

      {result && !loading && !error && (
        <div className="mt-8 space-y-6">
          <div>
            <h3>Estimated Salary</h3>
            <p className="text-2xl font-bold">
              {result.salary.amount} {result.salary.currency}/{result.salary.period}
            </p>
          </div>

          <div>
            <h3>Experience Level</h3>
            <p>
              {result.experience.level} ({result.experience.years} years of experience)
            </p>
            <div className="mt-2">
              <h4>Key Skills</h4>
              <ul className="list-disc list-inside">
                {result.experience.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3>Market Analysis</h3>
            <p>
              <strong>Demand:</strong> {result.market.demand}
            </p>
            <div className="mt-2">
              <h4>Reasons</h4>
              <ul className="list-disc list-inside">
                {result.market.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
            <p className="mt-2">
              <strong>Location:</strong> {result.market.location}
            </p>
            <p>
              <strong>Industry:</strong> {result.market.industry}
            </p>
          </div>

          <div>
            <h3>Additional Analysis</h3>
            <div>
              <h4>Salary Factors</h4>
              <ul className="list-disc list-inside">
                {result.analysis.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <h4>Market Considerations</h4>
              <ul className="list-disc list-inside">
                {result.analysis.considerations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>
            <p className="mt-2">
              <strong>Confidence Score:</strong>{' '}
              {(result.analysis.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
