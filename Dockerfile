FROM node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# ---------- Stage 2: Serve ----------
FROM nginx:1.29.7-alpine
WORKDIR /app
# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*
# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html
# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]