FROM nginxinc/nginx-unprivileged:1.24.0

WORKDIR /usr/share/nginx/html

COPY ./apps/spa/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist/apps/spa/browser ./
# COPY needed, since native permissions altering wont work due to user restrictions by image
COPY --chown=nginx:nginx ./dist/apps/spa/browser/assets/config.template.json ./assets/config.template.json
COPY --chown=nginx:nginx ./dist/apps/spa/browser/assets/config.json ./assets/config.json
COPY --chmod=704 ./apps/spa/docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint"]

CMD ["nginx", "-g", "daemon off;"]

