# Stock Enigma ⚡️

**Stock Enigma** es un sistema de gestión integral de inventario y stock diseñado específicamente para las necesidades de una librería y regalería (*stationery store*). La plataforma provee una experiencia de usuario moderna y responsiva orientada a dispositivos móviles (diseño *app-like*) sin descuidar la productividad en pantallas de escritorio.

---

## 🎯 Objetivo del Proyecto

El objetivo principal es facilitar el control diario y en tiempo real de artículos del catálogo (tales como cuadernos, lapiceras, cartulinas, tazas personalizadas, etc.), permitiendo la optimización de compras y minimizando las roturas de stock mediante alertas automáticas y flujos de trabajo dedicados.

---

## 🛠️ Tecnologías Utilizadas

El stack tecnológico de la aplicación está optimizado para proveer velocidad máxima y un despliegue sin servidores complejos:

- **Frontend & Routing:** [Qwik](https://qwik.dev/) y [Qwik City](https://qwik.dev/qwikcity/overview/) para lograr una reanudación (*resumability*) instantánea en el cliente y navegación ultrarrápida.
- **Base de Datos:** [Turso](https://turso.tech/) (SQLite en el Edge), brindando latencias mínimas a través de réplicas distribuidas.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) para un tipado estático robusto y consultas eficientes sobre SQLite.
- **Autenticación:** [Better-Auth](https://www.better-auth.com/) para el control de acceso seguro basado en email/contraseña.
- **Almacenamiento de Imágenes:** [Cloudinary](https://cloudinary.com/) para la subida, optimización y distribución eficiente de imágenes de los productos.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) y [DaisyUI](https://daisyui.com/) (diseño premium y adaptable a través de componentes consistentes en color marfil/hueso `#FDFBF7` y morados `#6B21A8`).
- **Hosting:** [Vercel](https://vercel.com/) (Edge Functions).

---

## ✨ Características Principales

1. **Autenticación Segura (Login)**
   - Formulario de login premium con visibilidad de contraseña e identidad persistente controlada por Better-Auth.
2. **Dashboard de Métricas (KPIs)**
   - Tarjetas informativas de Valor de Inventario, Productos Totales y Alertas Críticas calculadas en tiempo real.
3. **Gestión de Catálogo (CRUD de Productos)**
   - Listado interactivo con buscador y filtros dinámicos por categorías.
   - Modificación rápida de stock mediante botones interactivos `+` y `-` conectados directamente con la base de datos Turso.
   - Formulario de alta para nuevos productos con validación estricta a nivel de servidor.
4. **Diseño "App-like" Multidispositivo**
   - Menú lateral (Sidebar) fijo para pantallas de escritorio.
   - Navegación inferior persistente (Dock/Bottom-nav) y barra superior optimizada con buscador para la experiencia en teléfonos móviles.

---

## 💻 Configuración Local

### Requisitos Previos

Asegúrate de contar con Node.js (versión `>=18.17.0`) instalado.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/seol88/stock-enigma.git
   cd stock-enigma
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura el archivo `.env` en la raíz del proyecto basándote en las siguientes variables obligatorias:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `CLOUDINARY_URL`

### Scripts Disponibles

- **Iniciar servidor de desarrollo:**
  ```bash
  npm run dev
  ```
- **Sincronizar base de datos con Turso (Push de esquemas):**
  ```bash
  npm run db:push
  ```
- **Abrir interfaz interactiva de base de datos (Drizzle Studio):**
  ```bash
  npm run db:studio
  ```
- **Ejecutar análisis de código (Linter):**
  ```bash
  npm run lint
  ```
- **Compilar para producción:**
  ```bash
  npm run build
  ```
