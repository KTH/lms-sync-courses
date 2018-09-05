FROM kthse/kth-nodejs-api:2.4

COPY ["package.json", "package.json"]
COPY ["config", "config"]

# Source files in root
COPY ["app.js", "app.js"]
COPY ["run-periodically.js", "run-periodically.js"]

# Source files directories
COPY ["server", "server"]

RUN npm install --production --no-optional

EXPOSE 3000

CMD ["node", "app.js"]
