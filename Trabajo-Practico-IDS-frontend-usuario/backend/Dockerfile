FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

# El punto de entrada real es src/app.js (no index.js).
CMD ["node", "src/app.js"]
