# 🐳 Base image: Lightweight Node 20 with Alpine Linux
FROM node:20-alpine

# 📁 Set the working directory inside the container
WORKDIR /app

# 📦 Copy package definition and environment file
COPY package*.json ./
COPY .env.docker .env

# 📥 Install production dependencies only
RUN npm install --omit=dev

# 📁 Copy application source code
COPY . .

# 🛠️ Install required build tools and PM2 globally
RUN apk add --no-cache python3 make g++ && \
    npm install -g pm2 && \
    rm -rf /root/.npm /tmp/* /var/cache/apk/*

# 🌐 Define the environment
ENV NODE_ENV=production

# 🚪 Expose the internal app port
EXPOSE 1337

# 🚀 Launch the app with PM2 (better process management)
CMD ["pm2-runtime", "server.js", "--name=spaced-api"]