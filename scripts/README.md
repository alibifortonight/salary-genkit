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

6. Run the check-permissions.sh script to ensure the service account has the necessary permissions:
   ```bash
   ./scripts/check-permissions.sh
   ```

7. Deploy the application:
   ```bash
   firebase deploy
   ```

## Checking and Fixing Permissions

If you encounter issues with the application not being able to access the secrets, you can use the check-permissions.sh script to verify and fix the IAM permissions:

```bash
./scripts/check-permissions.sh
```

This script will:
1. Check if the service account used by Cloud Run has the Secret Manager Secret Accessor role
2. Add the role if it's missing
3. Check if the service account has access to the specific secret
4. Add the necessary permissions if they're missing

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

3. Check the IAM permissions using the check-permissions.sh script:
   ```bash
   ./scripts/check-permissions.sh
   ```

4. Check the logs for any errors:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=salary-genkit" --limit=50
   ```

5. Redeploy the application after making any changes:
   ```bash
   firebase deploy
   ```
