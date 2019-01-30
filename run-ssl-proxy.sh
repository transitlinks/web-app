docker run -d \
  --name nginx-auto-ssl \
  --restart on-failure \
  -p 8811:3001 \
  -p 443:3001 \
  -e ALLOWED_DOMAINS=local.transitlinks.net \
  -e SITES='local.transitlinks.net=localhost:3001;' \
  valian/docker-nginx-auto-ssl
