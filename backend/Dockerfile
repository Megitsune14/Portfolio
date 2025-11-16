FROM node:alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine

WORKDIR /app
COPY --from=build /app/dist .
COPY --from=build /app/package.json /app/package-lock.json .
RUN npm ci

CMD ["npm", "run", "start"]