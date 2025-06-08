FROM node:18-alpine
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Set environment variable
ENV NODE_ENV=development

EXPOSE 8080

CMD ["npm", "run", "dev"]