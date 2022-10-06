FROM python:3 as contracts

RUN pip install eth-brownie

WORKDIR /contracts
COPY contracts/contracts contracts/
COPY contracts/brownie-config.yaml .
RUN brownie compile


FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install 
COPY --from=contracts /contracts contracts/ 
COPY src/ src/
RUN npm run build
COPY static/ static/

CMD [ "npm", "run", "prod" ]