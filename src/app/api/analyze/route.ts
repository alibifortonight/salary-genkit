import { NextRequest, NextResponse } from 'next/server';
import { analyzeSalaryFlow } from '../../genkit';
import { ErrorResponse, SalaryAnalysisResponse } from '@/types/api';

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
 * Generate with retry logic
 */
async function generateWithRetry(pdfContent: string, retries = 3): Promise<SalaryAnalysisResponse> {
  try {
    if (!analyzeSalaryFlow) {
      throw new Error('API service is not configured. Missing API key.');
    }
    return await analyzeSalaryFlow({ pdfContent });
  } catch (error: any) {
    console.error('[generateWithRetry] Attempt failed:', error);

    if (retries > 0) {
      console.log(`[generateWithRetry] Retrying... ${retries} attempts remaining`);
      await sleep(1000);
      return generateWithRetry(pdfContent, retries - 1);
    }

    throw error;
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
