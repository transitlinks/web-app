FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y build-essential python curl git vim
RUN curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN mkdir /transitlinks
RUN cd /transitlinks && \
  git clone https://github.com/transitlinks/web-app.git && \
  cd web-app && \
  npm install
ADD assets/start.sh /
RUN chmod a+x /start.sh
CMD /start.sh
