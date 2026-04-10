# 🏛️ Portal de Gobierno Abierto

El **Portal de Gobierno Abierto** es la capa visual, narrativa y ciudadana del ecosistema de datos de la Municipalidad. Su objetivo es "traducir" y acercar la información pública al vecino, periodistas y tomadores de decisiones mediante tableros dinámicos, noticias y canales de participación. 

Este proyecto se integra de forma asíncrona con el repositorio técnico de Datos Abiertos (plataforma Andino/CKAN) procesando sus datasets públicos, y cuenta con un CMS ligero propio para la gestión de contenidos.

---

## ✨ Características Principales (MVP)

* **📊 Visualización Dinámica:** Tableros de control renderizados nativamente que consumen y parsean datos reales (CSV) alojados en el portal de datos CKAN de forma asíncrona (Server-Side Fetching + Caché ISR).
* **📝 CMS Ligero:** Panel de administración de acceso restringido (mediante lista blanca de Google OAuth) para gestionar noticias y textos dinámicos de la Home.
* **📬 Buzón Ciudadano:** Canal de participación 100% anónimo para sugerencias, propuestas o quejas, protegido con Cloudflare Turnstile.
* **⚡ Alta Performance:** Estrategia de caché mediante Next.js para regeneración estática de páginas, blindando la infraestructura contra picos de tráfico.

---

## 🛠️ Stack Tecnológico

* **Frontend & Backend:** Next.js (App Router), React, TypeScript.
* **Estilos:** Tailwind CSS (basado en maquetas de Lovable).
* **Base de Datos:** PostgreSQL.
* **ORM:** Prisma.
* **Infraestructura Local:** Docker & Docker Compose.
* **Seguridad:** NextAuth.js (Google OAuth) y Cloudflare Turnstile.

---

## 🚦 Metodología y Estándares de Código

Para mantener el repositorio ordenado y escalable, el equipo sigue estas convenciones estrictas:

1. **Flujo de Trabajo (Gitflow):** * `main`: Exclusiva para código estable en producción (prohibido hacer commits directos).
   * `develop`: Para integración continua.
   * `feature/*`, `hotfix/*`, `release/*`: Ramas efímeras para desarrollo.
2. **Nomenclatura de Código:** Uso de `lowerCamelCase` para variables, funciones y métodos en TypeScript.
3. **Nomenclatura de Archivos:** Uso de `snake_case` para archivos y directorios (ej. `panel_administrador`, `api_router.ts`) para evitar problemas de compatibilidad en Docker.

---

## 🚀 Guía de Instalación y Entorno Local

Sigue estos pasos para levantar el proyecto en tu máquina local para desarrollo.

### Instalación Rápida (1 comando)
Desde la raíz de `Portal_Gobierno_Abierto` ejecuta:

```bash
pnpm bootstrap
```

Este comando ejecuta el script [scripts/bootstrap.mjs](scripts/bootstrap.mjs) y hace automáticamente:
- crea `.env.local` desde `.env.example` si no existe,
- instala dependencias con `pnpm install`,
- levanta PostgreSQL con `docker compose up -d`.

Luego solo inicia el servidor:

```bash
pnpm dev
```

### 1. Pre-requisitos
Asegúrate de tener instalados:
* Node.js (v18 o superior recomendado)
* Docker y Docker Compose
* Git

### 2. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd portal-gobierno-abierto
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto basándote en el archivo de ejemplo (`.env.example`) y configura tus variables, incluyendo la conexión a la base de datos local:
```env
DATABASE_URL=postgresql://admin_portal:change_me@localhost:5432/gobierno_abierto_db
```

### 4. Levantar la Base de Datos (Docker)
Inicia el contenedor de PostgreSQL en segundo plano:
```bash
docker compose up -d
```

### 5. Instalar Dependencias e Inicializar Prisma
Instala los paquetes de Node e impacta el esquema de la base de datos:
```bash
pnpm install
pnpm prisma db push
pnpm prisma generate
```

### 6. Iniciar el Servidor de Desarrollo
```bash
pnpm dev
```
¡Listo! La aplicación ya debería estar corriendo en `http://localhost:3000`.

### 7. Probar API con Swagger
Con el servidor levantado, abre:

- `http://localhost:3000/docs`

Swagger consumirá la especificación en `GET /api/openapi` y permite probar:

- CRUD de noticias: `/api/news` y `/api/news/{id}`
- CRUD de textos: `/api/texts` y `/api/texts/{id}` (alias disponibles también en `/api/webcontent`)

Para endpoints protegidos (`POST`, `PATCH`, `DELETE`), primero inicia sesión en la app con un usuario `ADMIN` o `EDITOR` y luego abre Swagger en la misma sesión del navegador.

### 8. Upload local similar a servidor municipal
Las imágenes de noticias se guardan en:

- `public/uploads/news`

Para simular mejor un servidor municipal local, se recomienda usar una carpeta persistente fuera del repo y enlazarla como junction de Windows:

1. Crear carpeta persistente:
   - `C:/srv/muni-uploads/news`
2. Si existe `public/uploads/news`, eliminarla (solo la carpeta, no el repo).
3. Crear junction desde la raíz del proyecto:
   - `cmd /c mklink /J public\\uploads\\news C:\\srv\\muni-uploads\\news`

Con eso, la app sigue devolviendo URLs públicas como `/uploads/news/imagen.jpg`, pero los archivos quedan físicamente en una ruta persistente estilo servidor.

---

## 📂 Estructura de la Base de Datos (Prisma)
El esquema inicial contempla 4 modelos principales:
* **`Administrador`**: Gestión de accesos autorizados (Whitelist).
* **`Noticia`**: Novedades del municipio.
* **`TextoHome`**: Contenido dinámico de la página principal.
* **`BuzonCiudadano`**: Almacenamiento seguro y privado de la participación ciudadana.

---

**Desarrollado por la Dirección de Innovación y Tecnología.**
