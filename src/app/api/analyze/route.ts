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

/**
 * Schema for salary analysis response from Genkit
 * Defines the structure and validation rules for the AI's output
 */
const SalaryAnalysisSchema = z.object({
  estimatedSalary: z.number().describe("Estimated monthly salary in SEK based on the resume"),
  experience: z.object({
    level: z.enum(["Junior", "Mid-level", "Senior"]).describe("Experience level of the candidate"),
    years: z.number().describe("Total years of relevant experience"),
    keySkills: z.array(z.string()).describe("Key technical skills identified from the resume")
  }),
  marketDemand: z.object({
    level: z.enum(["Low", "Medium", "High"]).describe("Current market demand level for this profile"),
    reasons: z.array(z.string()).describe("Specific reasons for the market demand assessment")
  }),
  location: z.string().describe("Relevant location within Sweden"),
  industry: z.string().describe("Primary industry context"),
  salaryFactors: z.array(z.string()).describe("Key factors influencing the salary estimation"),
  considerations: z.array(z.string()).describe("Important market considerations"),
  confidenceScore: z.number().min(0).max(1).describe("Confidence score of the estimation")
});

// Skip initialization during build time
const isServer = typeof window === 'undefined';
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Initialize Genkit client
const initGenkit = () => {
  console.log('[initGenkit] Starting Genkit initialization...');
  console.log('[initGenkit] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PHASE: process.env.NEXT_PHASE,
    isServer,
    isBuildTime
  });

  // Skip initialization during build time to avoid environment variable errors
  if (!isServer || isBuildTime) {
    console.log('[initGenkit] Skipping initialization - not server or build time');
    return null;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('[initGenkit] GOOGLE_API_KEY environment variable is not set');
    return null;
  }
  console.log('[initGenkit] GOOGLE_API_KEY is set');

  console.log('[initGenkit] Creating Genkit instance...');
  const instance = genkit({
    plugins: [googleAI({ apiKey })],
    model: gemini20Flash,
  });
  console.log('[initGenkit] Genkit instance created successfully');
  return instance;
};

const ai = initGenkit();
console.log('[Startup] Genkit initialization result:', { initialized: !!ai });

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

/**
 * Formats the AI output for frontend consumption
 * @param output - The validated output from Genkit
 * @returns Formatted response object
 */
const formatResponse = (output: z.infer<typeof SalaryAnalysisSchema> | null) => {
  if (!output) {
    return {
      error: "Failed to analyze the resume"
    };
  }

  return {
    estimatedSalary: `${output.estimatedSalary.toLocaleString()} SEK/month`,
    details: {
      experience: {
        level: output.experience.level,
        years: output.experience.years,
        keySkills: output.experience.keySkills
      },
      analysis: {
        demand: {
          level: output.marketDemand.level,
          reasons: output.marketDemand.reasons
        },
        location: output.location,
        industry: output.industry,
        salaryFactors: output.salaryFactors,
        considerations: output.considerations
      }
    },
    confidenceScore: output.confidenceScore
  };
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

    console.log('[POST] Loading prompt...');
    const prompt = ai.prompt(path.join(process.cwd(), 'src/prompts/salary-analysis.prompt'));
    
    console.log('[POST] Sending request to Genkit...');
    const { output } = await prompt({ pdfUrl: dataUrl });

    console.log('[POST] Received response from Genkit');
    console.log('[POST] Formatting response...');
    const response = formatResponse(output);
    console.log('[POST] Response formatted successfully:', { hasError: 'error' in response });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[POST] Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
