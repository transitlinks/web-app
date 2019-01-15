FROM ubuntu:16.04
RUN apt-get update
RUN apt-get install -y build-essential python curl git vim
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g n
RUN n 8.7.0
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN apt update
RUN apt install yarn
RUN npm install -g babel-cli
