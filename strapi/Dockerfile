ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS development
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable
COPY . .
EXPOSE 1337
CMD ["yarn", "develop"]

FROM development AS build
RUN yarn build

FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn workspaces focus --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/config ./config
COPY --from=build /app/src ./src
ENV NODE_ENV=production
EXPOSE 1337
CMD ["yarn", "start"]
