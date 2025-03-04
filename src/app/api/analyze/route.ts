import { NextResponse } from 'next/server';
import { genkit, z } from 'genkit/beta';
import { gemini20Flash, googleAI } from '@genkit-ai/googleai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import path from 'path';

// Enable Firebase telemetry
console.log('[Startup] Enabling Firebase telemetry...');
enableFirebaseTelemetry();
console.log('[Startup] Firebase telemetry enabled');

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Type definitions for the response
const ExperienceLevelEnum = z.enum(['Junior', 'Mid-level', 'Senior']);
const MarketDemandEnum = z.enum(['Low', 'Medium', 'High']);

const SalaryAnalysisSchema = z.object({
  estimatedSalary: z.number(),
  experience: z.object({
    level: ExperienceLevelEnum,
    years: z.number(),
    keySkills: z.array(z.string())
  }),
  marketDemand: z.object({
    level: MarketDemandEnum,
    reasons: z.array(z.string())
  }),
  location: z.string(),
  industry: z.string(),
  salaryFactors: z.array(z.string()),
  considerations: z.array(z.string()),
  confidenceScore: z.number()
});

type SalaryAnalysis = z.infer<typeof SalaryAnalysisSchema>;

// Initialize Genkit client
let ai: any = null;

// Initialize on module load
if (typeof window === 'undefined') {
  console.log('[Startup] Running server-side initialization...');
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log('[Startup] GOOGLE_API_KEY present:', !!apiKey);
  
  if (apiKey) {
    console.log('[Startup] Creating Genkit instance...');
    try {
      ai = genkit({
        plugins: [googleAI({ apiKey })],
        model: gemini20Flash,
      });
      console.log('[Startup] Genkit instance created successfully');
      console.log('[Startup] Genkit instance details:', ai);
    } catch (error) {
      console.error('[Startup] Error creating Genkit instance:', error);
      console.error('[Startup] Error stack:', error.stack);
    }
  } else {
    console.error('[Startup] GOOGLE_API_KEY environment variable is not set');
  }
} else {
  console.log('[Startup] Skipping server-side initialization (running in browser)');
}

/**
 * Validates the uploaded file
 * @param file - The uploaded file
 * @returns Error message if validation fails, null if validation passes
 */
const validateFile = (file: File): string | null => {
  if (!file) {
    return 'No file provided';
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Invalid file type. Only PDF files are allowed';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds limit of 10MB';
  }
  return null;
};

/**
 * Converts a File to a base64 data URL
 * @param file - The file to convert
 * @returns Promise resolving to the data URL
 */
const fileToDataUrl = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (ai: any, dataUrl: string, retries = MAX_RETRIES): Promise<any> => {
  try {
    console.log(`[generateWithRetry] Attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
    const { output } = await ai.generate({
      model: gemini20Flash,
      prompt: [
        { media: { url: dataUrl } },
        { text: `Analyze this resume for the Swedish job market and provide:
1. Monthly salary estimate in SEK based on experience and skills
2. Experience level, years, and key technical skills
3. Market demand analysis with specific reasons
4. Location and industry context within Sweden
5. Key salary factors and market considerations

Focus on current Swedish market conditions and ensure the salary is appropriate for the Swedish job market.` }
      ],
      output: {
        schema: SalaryAnalysisSchema
      }
    });
    return output;
  } catch (error: any) {
    console.error(`[generateWithRetry] Error:`, {
      status: error.status,
      message: error.message,
      traceId: error.traceId
    });

    if (error.status === 503 && retries > 0) {
      console.log(`[generateWithRetry] Retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return generateWithRetry(ai, dataUrl, retries - 1);
    }
    
    throw error;
  }
};

const formatResponse = (output: SalaryAnalysis) => {
  try {
    return {
      salary: {
        amount: output.estimatedSalary.toLocaleString('sv-SE'),
        currency: 'SEK',
        period: 'monthly'
      },
      experience: {
        level: output.experience.level,
        years: output.experience.years,
        skills: output.experience.keySkills
      },
      market: {
        demand: output.marketDemand.level,
        reasons: output.marketDemand.reasons,
        location: output.location,
        industry: output.industry
      },
      analysis: {
        factors: output.salaryFactors,
        considerations: output.considerations,
        confidence: output.confidenceScore
      }
    };
  } catch (error) {
    console.error('[formatResponse] Error formatting response:', error);
    return { error: 'Error formatting the analysis results' };
  }
};

/**
 * POST endpoint for resume analysis
 * Accepts a PDF file and returns salary analysis for the Swedish job market
 */
export async function POST(req: Request) {
  console.log('[POST] Starting request processing...');
  try {
    if (!ai) {
      console.error('[POST] Genkit client not initialized');
      return NextResponse.json(
        { error: 'Service is not properly configured' },
        { status: 503 }
      );
    }

    console.log('[POST] Parsing form data...');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    console.log('[POST] Validating file...', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    const validationError = validateFile(file);
    if (validationError) {
      console.error('[POST] File validation failed:', validationError);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    console.log('[POST] Converting file to data URL...');
    const dataUrl = await fileToDataUrl(file);
    console.log('[POST] File converted successfully');

    console.log('[POST] Creating prompt...');
    const output = await generateWithRetry(ai, dataUrl);

    console.log('[POST] Received response from Genkit:', JSON.stringify(output, null, 2));
    console.log('[POST] Formatting response...');
    const response = formatResponse(output);
    console.log('[POST] Response formatted successfully:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[POST] Error processing request:', {
      status: error.status,
      message: error.message,
      traceId: error.traceId
    });
    
    const statusCode = error.status || 500;
    const errorMessage = statusCode === 503 
      ? 'The service is temporarily unavailable. Please try again in a few moments.'
      : 'An error occurred while processing your request';
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
