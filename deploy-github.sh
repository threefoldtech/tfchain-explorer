#!/bin/bash

# Enhanced GitHub Pages deployment script for TFChain Explorer
# This script handles the complete deployment process with detailed error handling

set -e  # Exit on error

# Configuration
REPO="threefoldtech/tfchain-explorer"
GITHUB_URL="git@github.com:${REPO}.git"
BUILD_DIR="dist"
BRANCH="gh-pages"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}   TFChain Explorer GitHub Pages Deployment Tool    ${NC}"
echo -e "${GREEN}====================================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}Step 1: Building the project...${NC}"
npm run build-force
echo -e "${GREEN}Build completed successfully!${NC}"

# Create or clean the deployment directory
DEPLOY_DIR="/tmp/tfchain-explorer-deploy"
echo -e "${YELLOW}Step 2: Preparing deployment directory...${NC}"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
echo -e "${GREEN}Deployment directory prepared!${NC}"

# Copy build files
echo -e "${YELLOW}Step 3: Copying build files...${NC}"
cp -R "$BUILD_DIR"/* "$DEPLOY_DIR"/
echo -e "${GREEN}Build files copied successfully!${NC}"

# Set up git in the deployment directory
echo -e "${YELLOW}Step 4: Setting up git repository...${NC}"
cd "$DEPLOY_DIR"
git init
git checkout -b "$BRANCH"

# Configure git
echo -e "${YELLOW}Step 5: Configuring git...${NC}"
git config user.name "GitHub Actions Bot"
git config user.email "actions@github.com"

# Add and commit files
echo -e "${YELLOW}Step 6: Adding files to git...${NC}"
git add .
git commit -m "Deploy TFChain Explorer to GitHub Pages"

# Add remote and push
echo -e "${YELLOW}Step 7: Pushing to GitHub...${NC}"
git remote add origin "$GITHUB_URL"

echo -e "${GREEN}====================================================${NC}"
echo -e "${YELLOW}Ready to push to GitHub!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${YELLOW}To complete deployment, you need to:${NC}"
echo -e "1. ${YELLOW}Ensure your SSH key is added to your GitHub account${NC}"
echo -e "2. ${YELLOW}Push the changes with the following command:${NC}"
echo -e "${GREEN}   cd $DEPLOY_DIR && git push -f origin $BRANCH${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${YELLOW}After successful push, your site will be available at:${NC}"
echo -e "${GREEN}https://threefoldtech.github.io/tfchain-explorer/${NC}"
echo -e "${GREEN}====================================================${NC}"

# Provide option to push directly
read -p "Would you like to attempt pushing to GitHub now? (y/n): " PUSH_NOW
if [[ "$PUSH_NOW" == "y" || "$PUSH_NOW" == "Y" ]]; then
    echo -e "${YELLOW}Pushing to GitHub...${NC}"
    git push -f origin "$BRANCH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}====================================================${NC}"
        echo -e "${GREEN}Deployment successful!${NC}"
        echo -e "${GREEN}Your site is now available at:${NC}"
        echo -e "${GREEN}https://threefoldtech.github.io/tfchain-explorer/${NC}"
        echo -e "${GREEN}====================================================${NC}"
    else
        echo -e "${RED}====================================================${NC}"
        echo -e "${RED}Deployment failed.${NC}"
        echo -e "${YELLOW}You can try pushing manually with:${NC}"
        echo -e "${GREEN}cd $DEPLOY_DIR && git push -f origin $BRANCH${NC}"
        echo -e "${RED}====================================================${NC}"
    fi
fi
