FROM node:18-alpine as ui

WORKDIR /app
COPY ui/*.* ./
RUN npm install
COPY ui/src ./src
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm install 

COPY example/challenge.yaml challenge.yaml
COPY example/contracts/ contracts
COPY example/build/ build
COPY --from=ui /app/dist ./static
COPY src/ src/
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "prod" ]