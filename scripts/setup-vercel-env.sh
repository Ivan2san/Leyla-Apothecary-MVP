#!/bin/bash

# Vercel Environment Variables Setup Script
# This script reads from .env.local and adds them to Vercel

echo "🔧 Setting up Vercel Environment Variables"
echo "==========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found!"
  echo "Please create .env.local with your environment variables first."
  exit 1
fi

# Check if user is logged in to Vercel
if ! npx vercel whoami > /dev/null 2>&1; then
  echo "❌ Error: Not authenticated with Vercel"
  echo "Please run: npx vercel login"
  exit 1
fi

echo "✅ Authenticated with Vercel"
echo ""
echo "📋 Reading environment variables from .env.local..."
echo ""

# Function to add environment variable to Vercel
add_env_var() {
  local key=$1
  local value=$2
  local environment=$3

  if [ -z "$value" ] || [ "$value" = "your_"* ]; then
    echo "⚠️  Skipping $key (not configured)"
    return
  fi

  echo "Adding: $key to $environment"
  echo "$value" | npx vercel env add "$key" "$environment" --force > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "   ✅ Added successfully"
  else
    echo "   ❌ Failed to add"
  fi
}

# Read .env.local and add each variable
echo "Adding to Production environment..."
echo "-----------------------------------"

while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.*$ ]] || [ -z "$key" ]; then
    continue
  fi

  # Remove quotes from value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  # Add to production
  add_env_var "$key" "$value" "production"

done < .env.local

echo ""
echo "Adding to Preview environment..."
echo "--------------------------------"

while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.*$ ]] || [ -z "$key" ]; then
    continue
  fi

  # Remove quotes from value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  # Add to preview
  add_env_var "$key" "$value" "preview"

done < .env.local

echo ""
echo "Adding to Development environment..."
echo "------------------------------------"

while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.*$ ]] || [ -z "$key" ]; then
    continue
  fi

  # Remove quotes from value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  # Add to development
  add_env_var "$key" "$value" "development"

done < .env.local

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 To verify, run: npx vercel env ls"
echo ""
