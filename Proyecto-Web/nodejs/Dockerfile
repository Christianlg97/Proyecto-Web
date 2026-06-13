FROM node:24-alpine

# Imagen del backend (Node.js) para el contenedor del servicio "nodejs".
# - Instala dependencias desde package.json/package-lock.json
# - Copia el código fuente del backend
# - Expone el puerto 3000 (API)
# Nota: los datos de usuarios se montan por volumen desde docker-compose.yml

WORKDIR /app

COPY package*.json ./
COPY secrets.js ./
RUN npm install

COPY . .

# Directorio auxiliar dentro de la imagen (no es el directorio de usuarios montado).
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
