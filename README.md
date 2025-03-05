# Salary Genkit

A Next.js application that analyzes resumes using Genkit AI to provide salary estimates for the Swedish job market.

## Features

- PDF resume analysis
- Monthly salary estimation in SEK
- Experience level assessment
- Market demand analysis
- Key skills identification
- Swedish market context
- Confidence scoring

## Tech Stack

- Next.js 14
- TypeScript
- Genkit AI with Gemini Pro
- Material-UI
- Tailwind CSS

## Prerequisites

- Node.js 18.x or higher
- Google API Key for Genkit

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PROJECT_ID=your_google_project_id_here
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/salary-genkit.git
cd salary-genkit
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### POST /api/analyze

Analyzes a resume and returns salary information.

#### Request
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file (max 10MB)

#### Response
```json
{
  "estimatedSalary": "45,000 SEK/month",
  "details": {
    "experience": {
      "level": "Mid-level",
      "years": 5,
      "keySkills": ["React", "Node.js", "TypeScript"]
    },
    "analysis": {
      "demand": {
        "level": "High",
        "reasons": ["Growing tech sector", "Skill shortage"]
      },
      "location": "Stockholm",
      "industry": "Technology",
      "salaryFactors": ["Technical expertise", "Market demand"],
      "considerations": ["Company size", "Benefits package"]
    }
  },
  "confidenceScore": 0.85
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- 400: Invalid request (wrong file type, size)
- 422: Invalid AI response format
- 503: Service configuration error
- 500: Server error

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Genkit AI](https://genkit.ai) for the AI capabilities
- [Next.js](https://nextjs.org) for the framework
- [Material-UI](https://mui.com) for the UI components
