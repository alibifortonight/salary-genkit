import { NextRequest, NextResponse } from 'next/server';
import { analyzeSalary } from '@/app/genkit';
import { SalaryAnalysis } from '@/app/genkit';
import { ErrorResponse } from '@/types/api';

export interface SalaryAnalysisResponse extends SalaryAnalysis {
  error?: string;
}

/**
 * Validates the uploaded file
 */
function validateFile(file: File): string | null {
  if (!file) {
    return 'No file uploaded';
  }

  if (!file.type.includes('pdf')) {
    return 'Invalid file type. Please upload a PDF file.';
  }

  return null;
}

/**
 * Converts a File to a base64 data URL
 */
async function fileToDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Attempts to generate an analysis with retries
 */
async function generateWithRetry(pdfContent: string, retries = 3): Promise<SalaryAnalysisResponse> {
  try {
    console.log('[generateWithRetry] Attempting to analyze salary...');
    const result = await analyzeSalary(pdfContent);
    console.log('[generateWithRetry] Analysis successful:', JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('[generateWithRetry] Attempt failed:', error);
    
    if (retries > 0) {
      console.log(`[generateWithRetry] Retrying... (${retries} attempts left)`);
      await sleep(1000);
      return generateWithRetry(pdfContent, retries - 1);
    }
    
    console.error('[generateWithRetry] All retries failed. Returning default response with error.');
    
    // If all retries fail, return an error response
    return {
      currentSalary: 0,
      marketRate: 0,
      percentageDifference: 0,
      experienceLevel: 'Junior',
      marketDemand: 'Medium',
      recommendations: ['Failed to analyze your resume. Please try again later.'],
      skills: [],
      jobTitles: [],
      industries: [],
      yearsOfExperience: 0,
      educationLevel: '',
      location: '',
      currency: 'SEK',
      salaryTimeframe: 'monthly',
      error: error.message || 'Failed to analyze salary after multiple attempts'
    };
  }
}

/**
 * POST endpoint for resume analysis
 */
export async function POST(request: NextRequest) {
  console.log('[POST] Starting request processing...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    const validationError = validateFile(file);
    if (validationError) {
      console.error('[POST] File validation failed:', validationError);
      return NextResponse.json({ error: validationError } as ErrorResponse, { status: 400 });
    }

    console.log('[POST] File validation passed, converting to data URL...');
    const dataUrl = await fileToDataUrl(file);
    
    console.log('[POST] Generating analysis...');
    const output = await generateWithRetry(dataUrl);
    
    console.log('[POST] Analysis generated successfully');
    return NextResponse.json(output);
    
  } catch (error: any) {
    console.error('[POST] Error processing request:', error);
    
    return NextResponse.json(
      { error: 'Error processing the resume' } as ErrorResponse, 
      { status: 500 }
    );
  }
}
