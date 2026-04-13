# Dashboard Aguascalientes

Plataforma interactiva para explorar concentración territorial, distribución por municipio y comportamiento por giro SCIAN a partir de datos del DENUE.

## Acceso para reclutador

- Usuario: `reclutador@aguascalientes.mx`
- Contraseña: `DashboardAgs2026!`

## Valor del proyecto

Este proyecto fue pensado como una pieza de portafolio con enfoque profesional. No se limita a mostrar componentes visuales: integra autenticación con refresh de sesión, consumo de servicios protegidos, publicación bajo subruta (`/DenueAgs`), containerización para producción y una experiencia cartográfica con interacción real sobre el mapa.

## Principales capacidades

- Visualización territorial con OpenLayers y capas WMS publicadas desde GeoServer.
- Filtro espacial compartido entre mapa y gráficas mediante dibujo de polígonos en el mapa.
- KPIs ejecutivos e indicadores comparativos alimentados por endpoints backend.
- Gráficas por municipio y por giro SCIAN con actualización dinámica.
- Manejo de sesión moderno: `accessToken` en memoria y `refreshToken` vía cookie `httpOnly`.
- Reintento automático de requests ante expiración de sesión.
- Diseño responsive para escritorio, tablet y móvil.
- Despliegue listo para producción en Docker + Nginx.

## Stack técnico

- React 19
- TypeScript
- Vite
- Axios
- ECharts
- OpenLayers
- Nginx
- Docker

## Estructura del proyecto

- `src/features/dashboard/`
  Núcleo funcional del tablero: mapa, paneles, layouts y visualizaciones.
- `src/services/`
  Servicios de autenticación, manejo de sesión y consumo de APIs.
- `src/services/api/`
  Configuración HTTP, headers, refresh de sesión y reintentos en `401`.
- `public/`
  Assets estáticos del proyecto.
- `nginx/default.conf`
  Configuración para servir la SPA bajo `/DenueAgs/`.

## Ejecución en desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
```

## Despliegue con Docker

Construir la imagen:

```bash
docker build -t denueags-dashboard:latest .
```

Probar localmente:

```bash
docker run --rm -p 8080:80 denueags-dashboard:latest
```

Abrir:

```text
http://localhost:8080/DenueAgs/
```

## Publicación en servidor mediante archivo tar

Construir y exportar la imagen en tu máquina:

```bash
docker build -t denueags-dashboard:latest .
docker save -o denueags-dashboard.tar denueags-dashboard:latest
```

Subir `denueags-dashboard.tar` al servidor y ejecutar:

```bash
docker load -i denueags-dashboard.tar
docker run -d \
  --name denueags-dashboard \
  --restart unless-stopped \
  -p 80:80 \
  denueags-dashboard:latest
```

La aplicación quedará disponible en:

```text
http://TU_HOST/DenueAgs/
```

## Enfoque de ingeniería

La implementación prioriza tres frentes: claridad de producto, integración real con servicios geoespaciales y una entrega técnicamente desplegable. La intención es demostrar criterio en frontend, capacidad de integración con backend y atención al detalle en experiencia de usuario, autenticación y publicación en producción.

---

## English Version

# Aguascalientes Dashboard

Interactive platform for exploring territorial concentration, distribution by municipality, and behavior by SCIAN business category using DENUE data.

## Recruiter Access

- User: `reclutador@aguascalientes.mx`
- Password: `DashboardAgs2026!`

## Project Value

This project was designed as a professional portfolio piece. It goes beyond displaying visual components: it integrates authentication with session refresh, protected service consumption, deployment under a subpath (`/DenueAgs`), production containerization, and a cartographic experience with real map interaction.

## Main Capabilities

- Territorial visualization with OpenLayers and WMS layers published from GeoServer.
- Shared spatial filtering between the map and charts through polygon drawing on the map.
- Executive KPIs and comparative indicators powered by backend endpoints.
- Charts by municipality and SCIAN business category with dynamic updates.
- Modern session handling: `accessToken` in memory and `refreshToken` through an `httpOnly` cookie.
- Automatic request retry when the session expires.
- Responsive design for desktop, tablet, and mobile.
- Production-ready deployment with Docker + Nginx.

## Technical Stack

- React 19
- TypeScript
- Vite
- Axios
- ECharts
- OpenLayers
- Nginx
- Docker

## Project Structure

- `src/features/dashboard/`
  Core dashboard functionality: map, panels, layouts, and visualizations.
- `src/services/`
  Authentication services, session handling, and API consumption.
- `src/services/api/`
  HTTP configuration, headers, session refresh, and retry handling for `401` responses.
- `public/`
  Static project assets.
- `nginx/default.conf`
  Configuration for serving the SPA under `/DenueAgs/`.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Docker Deployment

Build the image:

```bash
docker build -t denueags-dashboard:latest .
```

Test it locally:

```bash
docker run --rm -p 8080:80 denueags-dashboard:latest
```

Open:

```text
http://localhost:8080/DenueAgs/
```

## Server Publication Through a Tar File

Build and export the image on your machine:

```bash
docker build -t denueags-dashboard:latest .
docker save -o denueags-dashboard.tar denueags-dashboard:latest
```

Upload `denueags-dashboard.tar` to the server and run:

```bash
docker load -i denueags-dashboard.tar
docker run -d \
  --name denueags-dashboard \
  --restart unless-stopped \
  -p 80:80 \
  denueags-dashboard:latest
```

The application will be available at:

```text
http://YOUR_HOST/DenueAgs/
```

## Engineering Focus

The implementation prioritizes three areas: product clarity, real integration with geospatial services, and a technically deployable delivery. The goal is to demonstrate frontend judgment, backend integration capability, and attention to detail in user experience, authentication, and production publication.
