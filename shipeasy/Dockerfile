# Build Stage
FROM node:20-alpine AS build
ARG ENVIRONMENT=production
ENV NODE_ENV=${ENVIRONMENT}
WORKDIR /usr/src/ng-app

# Copy package.json and lock files first to leverage Docker caching
COPY package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source files
COPY . .

# Build Angular app
RUN yarn run stat-build -- --configuration=$NODE_ENV

# Production Stage
FROM nginx:1.15.8-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/ng-app/dist/smartagent/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]