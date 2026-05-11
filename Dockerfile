FROM node:20-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install &> /dev/null && npm install -g nodemon &> /dev/null
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
