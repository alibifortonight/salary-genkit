'use client';

import { useState } from 'react';
import styles from '@/styles/PdfUploader.module.css';
import { CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface AnalysisResult {
  estimatedSalary: string;
  details: {
    experience: {
      level: string;
      years: number;
      keySkills: string[];
    };
    analysis: {
      demand: {
        level: string;
        reasons: string[];
      };
      location: string;
      industry: string;
      salaryFactors: string[];
      considerations: string[];
    };
  };
  confidenceScore: number;
}

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);
    setResult(null);

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

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
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['pdf-uploader']}>
      <div className={styles['upload-section']}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className={styles['file-input']}
          disabled={loading}
        />
        <button
          onClick={handleUpload}
          className={styles['upload-button']}
          disabled={!file || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {error && (
        <div className={styles['error-message']}>
          <ErrorOutlineIcon className={styles['error-icon']} />
          {error}
        </div>
      )}

      {loading && (
        <div className={styles['loading-container']}>
          <CircularProgress size={40} />
          <p>Analyzing your resume...</p>
        </div>
      )}

      {result && (
        <div className={styles['analysis-results']}>
          <div className={styles['salary-section']}>
            <h2 className={styles['salary-amount']}>{result.estimatedSalary}</h2>
            <p className={styles['salary-period']}>Estimated Monthly Salary</p>
            <p className={styles['confidence-score']}>
              Confidence Score: {(result.confidenceScore * 100).toFixed(1)}%
            </p>
          </div>

          <div className={styles['experience-section']}>
            <h3>Experience Level</h3>
            <p>
              {result.details.experience.level} ({result.details.experience.years}{' '}
              years of experience)
            </p>
          </div>

          <div className={styles['skills-section']}>
            <h3>Key Skills</h3>
            <div className={styles['skills-list']}>
              {result.details.experience.keySkills.map((skill, index) => (
                <span key={index} className={styles['skill-tag']}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className={styles['explanation-section']}>
            <h3>Market Analysis</h3>
            <p>
              Market Demand: <strong>{result.details.analysis.demand.level}</strong>
            </p>
            <p>Location: {result.details.analysis.location}</p>
            <p>Industry: {result.details.analysis.industry}</p>
          </div>

          <div className={styles['explanation-section']}>
            <h3>Demand Factors</h3>
            <ul>
              {result.details.analysis.demand.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>

          <p className={styles.disclaimer}>
            Note: This salary estimate is based on current market conditions and the
            information provided in your resume. Actual salaries may vary based on
            specific company policies, location, and other factors.
          </p>
        </div>
      )}
    </div>
  );
}
