FROM node:latest
COPY . .
RUN npm install --save-dev
CMD ["npm", "start"]