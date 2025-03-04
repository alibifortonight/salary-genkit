#!/bin/bash

# This script checks and fixes the IAM permissions for the salary-genkit application.

# Exit on error
set -e

# Get the project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not determine project ID."
  echo "Please run 'gcloud config set project YOUR_PROJECT_ID' first."
  exit 1
fi

# Get the service account used by Cloud Run
SERVICE_ACCOUNT=$(gcloud run services describe salary-genkit --region=europe-west4 --format="value(spec.template.spec.serviceAccountName)")
if [ -z "$SERVICE_ACCOUNT" ]; then
  echo "Error: Could not determine service account for Cloud Run service."
  echo "Using default compute service account as fallback."
  SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"
fi

echo "Project ID: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"

# Check if the service account has the Secret Manager Secret Accessor role
HAS_ROLE=$(gcloud projects get-iam-policy $PROJECT_ID --format=json | jq -r ".bindings[] | select(.role == \"roles/secretmanager.secretAccessor\") | .members[] | select(. == \"serviceAccount:$SERVICE_ACCOUNT\")" 2>/dev/null)

if [ -z "$HAS_ROLE" ]; then
  echo "The service account does not have the Secret Manager Secret Accessor role."
  echo "Adding the role..."
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
  echo "Role added successfully!"
else
  echo "The service account already has the Secret Manager Secret Accessor role."
fi

# Check if the secret exists
SECRET_EXISTS=$(gcloud secrets list --filter="name:salary_genkit_google_api_key" --format="value(name)" 2>/dev/null)

if [ -z "$SECRET_EXISTS" ]; then
  echo "The secret 'salary_genkit_google_api_key' does not exist."
  echo "Please create it using the set-secrets.sh script."
else
  echo "The secret 'salary_genkit_google_api_key' exists."
  
  # Check if the service account has access to the specific secret
  SECRET_ACCESS=$(gcloud secrets get-iam-policy salary_genkit_google_api_key --format=json | jq -r ".bindings[] | select(.role == \"roles/secretmanager.secretAccessor\") | .members[] | select(. == \"serviceAccount:$SERVICE_ACCOUNT\")" 2>/dev/null)
  
  if [ -z "$SECRET_ACCESS" ]; then
    echo "The service account does not have access to the specific secret."
    echo "Adding access..."
    gcloud secrets add-iam-policy-binding salary_genkit_google_api_key \
      --member="serviceAccount:$SERVICE_ACCOUNT" \
      --role="roles/secretmanager.secretAccessor"
    echo "Access added successfully!"
  else
    echo "The service account already has access to the specific secret."
  fi
fi

echo "Permissions check completed!"
