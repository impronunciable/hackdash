FROM ubuntu:latest

RUN mkdir -p /home/app/node_modules /home/app/metrics/node_modules

WORKDIR /home/app

COPY metrics/package*.json ./metrics/
COPY package*.json ./

RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN set -ex; \
    npm install -g; \
    cd metrics; \
    npm install

ARG USER_ID=1001
ARG GROUP_ID=1001

RUN set -ex; \
  addgroup --gid $GROUP_ID --system containeruser; \
  adduser --system --uid $USER_ID --gid $GROUP_ID containeruser; \
  chown -R containeruser:containeruser /home/app

USER containeruser

CMD npm run start