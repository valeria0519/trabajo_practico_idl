FROM nginx:alpine

# Copia toda la carpeta frontend/ (el contexto de build, definido en
# docker-compose.yml como "build: ./frontend") a la carpeta que Nginx
# sirve por defecto. index.html ya redirige a login.html.
COPY . /usr/share/nginx/html

EXPOSE 80
