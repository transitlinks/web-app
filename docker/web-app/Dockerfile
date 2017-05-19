FROM vhalme/txlinks-base
RUN mkdir /transitlinks
RUN mkdir /transitlinks/images
RUN cd /transitlinks && \
  git clone https://github.com/transitlinks/web-app.git && \
  cd web-app && \
  npm install
ADD assets/start.sh /
RUN chmod a+x /start.sh
CMD /start.sh
