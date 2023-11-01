FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# FROM base AS prod-deps
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build

# NOTE:
# The above was lifted nearly verbatim from https://pnpm.io/docker
#
# We run using nginx rather than node (below), with a performance 
# and maturity assumption as to that preference, but that hasn't 
# been tested/confirmed
#
FROM nginx:1.19-alpine
COPY --from=build /app/public /usr/share/nginx/html

EXPOSE 3000

COPY --from=build /app/target/assets/css/index.css /usr/share/nginx/html/bundle.css
COPY --from=build /app/target/assets/js/bundle.js /usr/share/nginx/html/bundle.js
COPY --from=build /app/target/index.html /usr/share/nginx/html/index.html