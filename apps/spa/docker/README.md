# Nginx Configuration

The current [nginx.conf](./nginx.conf) is a basic configuration file, that acts
as a simple reverse proxy for the SPA. You can customize it to your needs and
plug it in e.g. via k8s volumes.

## CSP

If you want to enforce Trusted Types and CSP, you can use the following
configurations in your nginx.conf file:

```
	# change nonce in the apps index.html
	sub_filter_once off;
	sub_filter csp_nonce $request_id;

	# add CSP and further security headers
	add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$request_id'; object-src 'none'; base-uri 'self'; connect-src 'self'; img-src 'self'; style-src 'self' 'nonce-$request_id'; font-src 'self'; frame-ancestors 'self'; trusted-types angular angular#bundler dompurify default; require-trusted-types-for 'script';" always;
	add_header Content-Type-Options "nosniff" always;
	add_header X-Frame-Options "SAMEORIGIN" always;
	add_header X-XSS-Protection "1; mode=block" always;
	add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

If you the Sentry Observability adapter and B2C for auth and user management,
add the following values to `connect-src`: `*.ingest.sentry.io *.b2clogin.com` +
your API domain and also for Sentry `worker-src 'self' blob:;`

## Compression

For compression, you can use the following configurations in your nginx.conf
file:

```
	gzip on;
	gzip_comp_level 5;
	gzip_min_length 1100;
	gzip_buffers 4 32k;
	gzip_proxied any;
	gzip_types
		application/javascript
		application/json
		application/x-javascript
		application/xml
		image/svg+xml
		text/css
		text/javascript
		text/js
		text/plain
		text/xml;
	gzip_vary on;
```
