# franken-evidence-board/Dockerfile

# 1) Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build CRA app (outputs to build/)
RUN npm run build

# 2) Runtime stage - nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
