FROM ubuntu:latest

ENV NODE_PATH=.
ENV NODE_ENV production

RUN apt-get update; \
    apt-get -y install curl gnupg; \
    curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs

COPY . /app
WORKDIR /app

RUN set -ex; \
    npm install -g; \
    cd metrics; \
    npm install -g

ARG USER_ID=1001
ARG GROUP_ID=1001

RUN set -ex; \
  addgroup --gid $GROUP_ID --system containeruser; \
  adduser --system --uid $USER_ID --gid $GROUP_ID containeruser; \
  chown -R containeruser:containeruser /home/app

USER containeruser

CMD node index.js