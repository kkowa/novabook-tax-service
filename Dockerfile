FROM node:18.3.0
WORKDIR /
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . ./
EXPOSE 3000
CMD ["node", "dist/index.js"]