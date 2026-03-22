FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --production=false

# Build
COPY . .
# PAYLOAD_SECRET required during Next.js build when NODE_ENV=production
ARG PAYLOAD_SECRET=build-placeholder-replace-at-runtime
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/package.json ./
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/next.config.mjs ./
COPY --from=base /app/payload.config.ts ./
COPY --from=base /app/collections ./collections
COPY --from=base /app/endpoints ./endpoints
COPY --from=base /app/globals ./globals
COPY --from=base /app/hooks ./hooks
COPY --from=base /app/access ./access
COPY --from=base /app/app ./app
COPY --from=base /app/seed ./seed

EXPOSE 3000
CMD ["npm", "start"]
