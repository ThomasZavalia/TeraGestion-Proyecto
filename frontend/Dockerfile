# 1. Build de la App con Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Servidor Nginx para entregar el Front
FROM nginx:stable-alpine
# Copiamos la carpeta 'dist' que genera Vite/React
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos una config básica de Nginx (te la paso abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]