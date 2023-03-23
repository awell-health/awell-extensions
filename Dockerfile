FROM node:18-alpine

RUN apk update && apk add python3 make g++

RUN mkdir /app
WORKDIR /app

COPY \
  .pnp.cjs \
  .pnp.loader.mjs \
  .yarnrc.yml \
  package.json \
  tsconfig.json \
  yarn.lock \
  /app/
COPY .yarn /app/.yarn

RUN yarn

COPY lib /app/lib
COPY extensions /app/extensions
COPY src /app/src

RUN yarn build

# Run app using node to make sure that signals are propagated
# See https://github.com/yarnpkg/berry/pull/2347#issuecomment-771502152
ENTRYPOINT [ "node", "-r", "./.pnp.cjs", "dist/src/index.js" ]