FROM ubuntu:latest
USER root


RUN mkdir -p /home/app/node_modules

WORKDIR /home/app

COPY package*.json ./

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x  | bash -
RUN apt-get -y install nodejs
RUN npm install