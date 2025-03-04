'use server';

import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit, z } from "genkit/beta";

// Type definitions for the response
const ExperienceLevelEnum = z.enum(['Junior', 'Mid-level', 'Senior']);
const MarketDemandEnum = z.enum(['Low', 'Medium', 'High']);
const SalaryAnalysisSchema = z.object({
  currentSalary: z.number(),
  marketRate: z.number(),
  percentageDifference: z.number(),
  experienceLevel: ExperienceLevelEnum,
  marketDemand: MarketDemandEnum,
  recommendations: z.array(z.string()),
  skills: z.array(z.string()),
  jobTitles: z.array(z.string()),
  industries: z.array(z.string()),
  yearsOfExperience: z.number(),
  educationLevel: z.string(),
  location: z.string(),
  currency: z.string(),
  salaryTimeframe: z.string(),
});

export type SalaryAnalysis = z.infer<typeof SalaryAnalysisSchema>;

// Defer initialization to runtime
let clientInstance: ReturnType<typeof genkit> | null = null;

// Function to get or initialize the client
function getClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID || 'salary-genkit';
  
  console.log('[getClient] GOOGLE_API_KEY present:', !!apiKey);
  console.log('[getClient] GOOGLE_PROJECT_ID:', projectId);
  console.log('[getClient] Environment variables:', Object.keys(process.env).filter(key => !key.includes('SECRET')).join(', '));

  if (!apiKey) {
    console.error('[getClient] ERROR: GOOGLE_API_KEY environment variable is not set');
    console.error('[getClient] This is required for the Genkit client to function properly');
    console.error('[getClient] Please check that the secret is properly configured in the Google Cloud Secret Manager');
    console.error('[getClient] and that it is correctly referenced in apphosting.yaml');
    
    // In production, we'll throw an error that will be caught by the error handler
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API service is not properly configured. Please contact support.');
    } else {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
  }

  try {
    // Initialize the client only when needed
    clientInstance = genkit({
      plugins: [googleAI({ apiKey })],
      model: gemini20Flash,
    });
    
    console.log('[getClient] Successfully initialized Genkit client');
    return clientInstance;
  } catch (error) {
    console.error('[getClient] Error initializing Genkit client:', error);
    throw error;
  }
}

const ANALYSIS_PROMPT = `Analyze this resume for the Swedish job market and provide monthly salary insights. 

IMPORTANT: You MUST return ONLY a valid JSON object without any markdown formatting, code blocks, or additional text. The response must match this exact format:

{
  "currentSalary": number,
  "marketRate": number,
  "percentageDifference": number,
  "experienceLevel": "Junior" | "Mid-level" | "Senior",
  "marketDemand": "Low" | "Medium" | "High",
  "recommendations": string[],
  "skills": string[],
  "jobTitles": string[],
  "industries": string[],
  "yearsOfExperience": number,
  "educationLevel": string,
  "location": string,
  "currency": string,
  "salaryTimeframe": string
}

Base your analysis on:
1. Years of experience
2. Skills and qualifications
3. Job responsibilities
4. Industry standards
5. Location within Sweden

If the resume doesn't specify a current salary, estimate one based on the experience level and skills.
For currency, use "SEK" and for salaryTimeframe, use "monthly".
Make sure percentageDifference is calculated as ((currentSalary - marketRate) / marketRate) * 100.`;

// Define a function that will be called at runtime to analyze the salary
export async function analyzeSalary(pdfContent: string): Promise<SalaryAnalysis> {
  const ai = getClient();
  
  // Define the flow at runtime
  const flow = ai.defineFlow(
    {
      name: "analyzeSalaryFlow",
      inputSchema: z.object({
        pdfContent: z.string(),
      }),
      outputSchema: SalaryAnalysisSchema,
    },
    async ({ pdfContent }) => {
      const { text } = await ai.generate([
        { media: { url: pdfContent } },
        { text: ANALYSIS_PROMPT }
      ]);
      
      console.log('[analyzeSalary] Raw response from Google AI:', text);
      
      try {
        const parsedData = JSON.parse(text);
        console.log('[analyzeSalary] Parsed data:', JSON.stringify(parsedData, null, 2));
        return parsedData;
      } catch (error) {
        console.error('[analyzeSalary] Error parsing JSON response:', error);
        console.error('[analyzeSalary] Raw text that failed to parse:', text);
        
        // Return a default object if parsing fails
        return {
          currentSalary: 0,
          marketRate: 0,
          percentageDifference: 0,
          experienceLevel: 'Junior',
          marketDemand: 'Medium',
          recommendations: ['Error parsing AI response. Please try again.'],
          skills: [],
          jobTitles: [],
          industries: [],
          yearsOfExperience: 0,
          educationLevel: '',
          location: '',
          currency: 'SEK',
          salaryTimeframe: 'monthly',
        };
      }
    }
  );
  
  // Execute the flow immediately
  return await flow({ pdfContent });
}
