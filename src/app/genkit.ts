'use server';

import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit, z } from "genkit/beta";

// Initialize Genkit client
const apiKey = process.env.GOOGLE_API_KEY;
const projectId = process.env.GOOGLE_PROJECT_ID || 'salary-genkit';
console.log('[Startup] GOOGLE_API_KEY present:', !!apiKey);
console.log('[Startup] GOOGLE_PROJECT_ID:', projectId);

if (!apiKey) {
  throw new Error('[Startup] GOOGLE_API_KEY environment variable is not set');
}

const ai = genkit({
  plugins: [googleAI({ 
    apiKey,
    projectId
  })],
  model: gemini20Flash,
});

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

export type SalaryAnalysis = z.infer<typeof SalaryAnalysisSchema>;

const ANALYSIS_PROMPT = `Analyze this resume for the Swedish job market and provide monthly salary insights. Return ONLY a JSON object without any markdown formatting or additional text. The response must match this exact format:

{
  "estimatedSalary": 45000,
  "experience": {
    "level": "Mid-level",
    "years": 5,
    "keySkills": ["JavaScript", "React", "Node.js"]
  },
  "marketDemand": {
    "level": "High",
    "reasons": ["Growing tech sector", "High demand for web developers"]
  },
  "location": "Stockholm",
  "industry": "Technology",
  "salaryFactors": ["Strong technical skills", "Relevant experience"],
  "considerations": ["Market competition", "Company size"],
  "confidenceScore": 0.85
}

Important rules:
1. Return ONLY the JSON object, no other text
2. estimatedSalary must be a number in SEK
3. experience.level must be exactly "Junior", "Mid-level", or "Senior"
4. experience.years must be a number
5. marketDemand.level must be exactly "Low", "Medium", or "High"
6. confidenceScore must be a number between 0 and 1

Base your analysis on:
1. Technical skills and expertise
2. Years of experience
3. Current Swedish market conditions
4. Industry standards
5. Location within Sweden`;

export const analyzeSalaryFlow = ai.defineFlow(
  {
    name: "analyzeSalaryFlow",
    inputSchema: z.object({
      pdfContent: z.string()
    }),
    outputSchema: SalaryAnalysisSchema,
  },
  async ({ pdfContent }) => {
    const { text } = await ai.generate([
      { media: { url: pdfContent } },
      { text: ANALYSIS_PROMPT }
    ]);

    // Parse the JSON response
    try {
      // Remove any markdown formatting or extra text
      const jsonStr = text.replace(/```json\n|\n```|```/g, '').trim();
      console.log('[analyzeSalaryFlow] Cleaned response:', jsonStr);
      
      const result = JSON.parse(jsonStr);
      return SalaryAnalysisSchema.parse(result);
    } catch (error) {
      console.error('[analyzeSalaryFlow] Error parsing response:', error);
      console.error('[analyzeSalaryFlow] Raw response:', text);
      throw new Error('Failed to parse salary analysis response');
    }
  }
);
