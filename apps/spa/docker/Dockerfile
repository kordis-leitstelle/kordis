FROM nginxinc/nginx-unprivileged:1.24.0

WORKDIR /usr/share/nginx/html

COPY ./apps/spa/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx ./dist/apps/spa/browser ./
COPY --chmod=704 ./apps/spa/docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint"]

CMD ["nginx", "-g", "daemon off;"]

