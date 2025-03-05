#!/bin/bash

# This script sets up the necessary secrets in Google Cloud Secret Manager
# for the salary-genkit application.

# Exit on error
set -e

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY environment variable is not set."
  echo "Please set it before running this script."
  exit 1
fi

# Set the secret in Google Cloud Secret Manager
echo "Setting GEMINI_API_KEY in Secret Manager..."
echo -n "$GEMINI_API_KEY" | firebase apphosting:secrets:set --force --data-file - salary_genkit_gemini_api_key

echo "Secret successfully set!"
echo "The application should now be able to access the API key."
