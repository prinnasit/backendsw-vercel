# FROM...
FROM node:18.18.1
# Create app directory
WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production
# If you are building your code for production

# Bundle app source
COPY . .

EXPOSE 5000
CMD [ "npm", "start"]   