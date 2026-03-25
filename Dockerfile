FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install Node dependencies (skip browser download — image already has browsers)
RUN npm ci

# Copy the rest of the project
COPY . .

# Run setup (auth) then the tests, and always generate the HTML report
CMD ["npx", "playwright", "test", "--reporter=html"]
