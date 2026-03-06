# ──────────────────────────────────────────────────────────────────
# Stage 1 — Build
# ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

# Build-time config — override in docker-compose build.args or CLI
ARG ENVIRONMENT=production
ARG API_URL=/api
ARG API_URL_MASTER=/api/
ARG SOCKET_URL=

ENV NODE_ENV=${ENVIRONMENT}

WORKDIR /usr/src/ng-app

# Copy lock file alongside package.json for reproducible installs
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production=false

COPY . .

# Inject backend URLs into Angular environment file at build time.
# Defaults to relative paths (/api/) so nginx proxies to the backend
# container — no hardcoded hostnames baked into the image.
RUN sed -i "s|#{baseUrl}#|${API_URL}|g" src/environments/environment.prod.ts \
 && sed -i "s|baseUrlMaster: '[^']*'|baseUrlMaster: '${API_URL_MASTER}'|g" src/environments/environment.prod.ts \
 && if [ -n "${SOCKET_URL}" ]; then \
      sed -i "s|socketUrl:\"[^\"]*\"|socketUrl:\"${SOCKET_URL}\"|g" src/environments/environment.prod.ts; \
    fi

RUN yarn run stat-build -- --configuration=${NODE_ENV}

# ──────────────────────────────────────────────────────────────────
# Stage 2 — Serve
# nginx:stable-alpine automatically runs envsubst on files placed
# under /etc/nginx/templates/, injecting runtime env vars.
# ──────────────────────────────────────────────────────────────────
FROM nginx:stable-alpine

# Template — nginx entrypoint substitutes ${BACKEND_URL} at startup
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# TLS template available for production use — swap via volume mount
COPY nginx-tls.conf.template /etc/nginx/ssl/nginx-tls.conf.template

COPY --from=build /usr/src/ng-app/dist/smartagent/ /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]