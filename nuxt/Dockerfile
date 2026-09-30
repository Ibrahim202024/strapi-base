ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS development
WORKDIR /app
COPY package.json yarn.lock* .yarnrc.yml* ./
RUN yarn install --immutable 2>/dev/null || npm install
COPY . .
EXPOSE 3001
CMD ["yarn", "dev"]

FROM development AS build
ARG STRAPI_URL=http://strapi:1337
ARG WEBSITE_URL=https://example.com
ENV STRAPI_URL=${STRAPI_URL} WEBSITE_URL=${WEBSITE_URL}
RUN yarn build

FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
