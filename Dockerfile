# Stage 1. Build the actual image
FROM kthse/kth-nodejs:12.0.0
WORKDIR /usr/src/app
COPY . .
RUN node -v
RUN npm ci --only=production

EXPOSE 3001
CMD ["node", "app.js"]
