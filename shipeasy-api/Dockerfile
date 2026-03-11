# ──────────────────────────────────────────────
# Stage 1 — Install production dependencies only
# ──────────────────────────────────────────────
FROM node:22 AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ──────────────────────────────────────────────
# Stage 2 — Lean production image
# ──────────────────────────────────────────────
FROM node:22-slim AS production

WORKDIR /app

# Create non-root user/group first so we can set correct ownership
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create logs directory; set ownership so non-root appuser can write
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "index.js"]
