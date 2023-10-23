# https://sveltesociety.dev/recipes/publishing-and-deploying/dockerize-a-svelte-app
FROM node:19 AS build

WORKDIR /app

# conditionally copy node_modules if available (e.g. we've done a local build)
# see https://stackoverflow.com/questions/31528384/conditional-copy-add-in-dockerfile
COPY package.json package-lock.json yarn.loc[k] node_module[s] ./

RUN yarn install
COPY . ./
RUN yarn run build

FROM nginx:1.19-alpine
COPY --from=build /app/public /usr/share/nginx/html

EXPOSE 3000

# yarn run build executes a rollup configured to write assets to target/assets
COPY --from=build /app/target/assets/svg/svelte.svg /usr/share/nginx/html/assets/svelte.svg
COPY --from=build /app/target/assets/css/index.css /usr/share/nginx/html/bundle.css
COPY --from=build /app/target/assets/js/bundle.js /usr/share/nginx/html/bundle.js
COPY --from=build /app/target/index.html /usr/share/nginx/html/index.html