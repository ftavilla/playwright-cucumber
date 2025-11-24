FROM mcr.microsoft.com/playwright:v1.52.0-jammy

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Create necessary folders for results
RUN mkdir -p test-results/screenshots

# Set environment variables for headless tests
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

CMD ["npm", "test"]
