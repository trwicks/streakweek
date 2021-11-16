FROM node:latest as build-stage
WORKDIR /app
ARG REACT_APP_API_HOST
ARG REACT_APP_API_PORT
ENV REACT_APP_API_HOST=$REACT_APP_API_HOST
ENV REACT_APP_API_PORT=$REACT_APP_API_PORT
COPY package*.json /app/
RUN npm install
COPY ./ /app/
RUN npm run build

FROM nginx:alpine
COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf