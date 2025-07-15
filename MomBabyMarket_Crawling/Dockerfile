FROM node:18-alpine

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

# Set Chrome path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create output directories
RUN mkdir -p data/images data/json logs

# Build TypeScript
RUN npm run build

# Change ownership to node user
RUN chown -R node:node /app

# Run as non-root user
USER node

# Expose port for health check
EXPOSE 3000

# Start crawler
CMD ["npm", "start"]
