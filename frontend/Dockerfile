FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (prefer lockfile for reproducibility)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm rebuild esbuild

# Copy the rest of the project
COPY . .

# Build the frontend
RUN npm run build

# Nginx stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
