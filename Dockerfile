FROM node:12-alpine

WORKDIR /app

COPY ["package.json", "/app/package.json"]
COPY ["package-lock.json", "/app/package-lock.json"]

# Source files in root
COPY [".env.in", ".env.in"]
COPY ["app.js", "app.js"]
COPY ["run-periodically.js", "run-periodically.js"]

# Source files directories
COPY ["server", "server"]
COPY ["config", "config"]

RUN npm ci --production

EXPOSE 3000

CMD ["node", "app.js"]
