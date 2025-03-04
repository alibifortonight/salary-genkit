export interface SalaryAnalysisResponse {
  estimatedSalary: number;
  experience: {
    level: string;
    years: number;
    keySkills: string[];
  };
  marketDemand: {
    level: string;
    reasons: string[];
  };
  location: string;
  industry: string;
  salaryFactors: string[];
  considerations: string[];
  confidenceScore: number;
}

export interface ErrorResponse {
    error: string;
}
