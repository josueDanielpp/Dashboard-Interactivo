FROM node:20.19-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/DenueAgs
COPY --from=build /app/dist/ /usr/share/nginx/html/DenueAgs/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
