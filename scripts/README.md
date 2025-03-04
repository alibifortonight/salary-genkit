# Setting Up Secrets for Salary Genkit

This directory contains scripts for setting up the necessary secrets for the Salary Genkit application.

## Setting up the Google API Key

The application requires a Google API Key to function properly. This key is used to authenticate with the Google AI API for salary analysis.

### Steps to set up the secret:

1. Make sure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Set the GOOGLE_API_KEY environment variable:
   ```bash
   export GOOGLE_API_KEY="your-google-api-key"
   ```

4. Run the set-secrets.sh script:
   ```bash
   ./scripts/set-secrets.sh
   ```

5. Verify that the secret has been set correctly:
   ```bash
   firebase apphosting:secrets:list
   ```

   You should see `salary_genkit_google_api_key` in the list.

6. Deploy the application:
   ```bash
   firebase deploy
   ```

## Troubleshooting

If you encounter any issues with the API key not being available in the deployed application:

1. Check that the secret is correctly set in the Secret Manager:
   ```bash
   firebase apphosting:secrets:list
   ```

2. Verify that the apphosting.yaml file references the correct secret name:
   ```yaml
   - variable: GOOGLE_API_KEY
     secret: salary_genkit_google_api_key
     availability:
       - BUILD
       - RUNTIME
   ```

3. Redeploy the application after making any changes:
   ```bash
   firebase deploy
   ```
