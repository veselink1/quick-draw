# pull official base image
FROM node:12-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY ./client/package.json ./
COPY ./client/package-lock.json ./
RUN npm install --silent
RUN npm install serve --silent

# add app
COPY ./client ./

RUN npm run build

# start app
CMD ["npx", "serve", "-s", "build"]
