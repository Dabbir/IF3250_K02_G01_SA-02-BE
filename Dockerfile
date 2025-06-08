FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p /app/src/logs && chmod -R 777 /app/src/logs
RUN mkdir -p uploads
EXPOSE 8080
USER node
CMD ["npm", "start"]