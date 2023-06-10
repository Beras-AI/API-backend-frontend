# Gunakan image Node.js versi 14 sebagai base image
FROM node:18.2.0-buster-slim
LABEL maintainer="Andrea Rossi andrearssi@gmail.com"

# Set direktori kerja di dalam container
WORKDIR /app


COPY ./backend .

# Install dependensi
RUN npm install

# Tampilkan port yang akan digunakan oleh aplikasi
EXPOSE 5000

# Jalankan aplikasi saat container berjalan
CMD [ "npm", "start" ]
