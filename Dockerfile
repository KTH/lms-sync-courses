FROM node:10-alpine

COPY ["config", "config"]
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

# Source files in root
COPY [".env.in", ".env.in"]
COPY ["app.js", "app.js"]
COPY ["run-periodically.js", "run-periodically.js"]

# Source files directories
COPY ["server", "server"]

RUN npm install --production --no-optional

EXPOSE 3000

CMD ["node", "app.js"]
