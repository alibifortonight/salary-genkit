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
    
    // Check if this is a configuration error
    if (error.message && error.message.includes('not properly configured')) {
      console.error('[generateWithRetry] Configuration error detected. Not retrying.');
      return {
        currentSalary: 0,
        marketRate: 0,
        percentageDifference: 0,
        experienceLevel: 'Junior',
        marketDemand: 'Medium',
        recommendations: ['The salary analysis service is currently unavailable due to a configuration issue. Our team has been notified.'],
        skills: [],
        jobTitles: [],
        industries: [],
        yearsOfExperience: 0,
        educationLevel: '',
        location: '',
        currency: 'SEK',
        salaryTimeframe: 'monthly',
        error: 'Service configuration error'
      };
    }
    
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
 * Helper function to check if the secret is accessible
 */
async function checkSecretAccess() {
  try {
    console.log('[checkSecretAccess] Attempting to check secret access...');
    
    // Only attempt this in production environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[checkSecretAccess] Not in production, skipping check');
      return false;
    }
    
    // Check if the Firebase CLI is available
    const { exec } = require('child_process');
    const command = 'firebase apphosting:secrets:list --json';
    
    return new Promise<boolean>((resolve) => {
      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error('[checkSecretAccess] Error executing command:', error);
          console.error('[checkSecretAccess] stderr:', stderr);
          resolve(false);
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          console.log('[checkSecretAccess] Secrets list:', JSON.stringify(result, null, 2));
          
          // Check if our secret is in the list
          const hasSecret = result.some((secret: any) => 
            secret.name === 'salary_genkit_google_api_key');
          
          console.log('[checkSecretAccess] Has salary_genkit_google_api_key:', hasSecret);
          resolve(hasSecret);
        } catch (parseError) {
          console.error('[checkSecretAccess] Error parsing command output:', parseError);
          console.log('[checkSecretAccess] Command output:', stdout);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('[checkSecretAccess] Error checking secret access:', error);
    return false;
  }
}

/**
 * POST endpoint for resume analysis
 */
export async function POST(request: NextRequest) {
  console.log('[POST] Starting request processing...');
  
  try {
    // Check if we can access the secret
    await checkSecretAccess();
    
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
