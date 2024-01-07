ARG NGINX_VERSION=stable
ARG RELEASE_VERSION
ARG ENVIRONMENT_NAME

FROM nginx:${NGINX_VERSION}-alpine

WORKDIR /usr/share/nginx/html

COPY ./apps/spa/docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

COPY ./apps/spa/docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY ./dist/apps/spa/browser ./

EXPOSE 80

ENTRYPOINT ["docker-entrypoint"]

CMD ["nginx", "-g", "daemon off;"]
