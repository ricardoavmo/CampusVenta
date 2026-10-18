# Guía de Integración y Canales de Discord – CampusVenta

El servidor de **Discord** es la sede principal de comunicación, coordinación ágil y notificaciones automáticas del equipo de ingeniería de **CampusVenta**.

---

## 1. Arquitectura y Canales del Servidor

El servidor está organizado temáticamente para evitar el ruido y canalizar las discusiones al espacio adecuado:

| Tipo | Canal | Propósito y Contenido Permitido |
| :---: | :--- | :--- |
| 💬 Texto | **`#general`** | • Anuncios formales y recordatorios del proyecto.<br>• **Daily Standup asíncrono:** Todos los días entre 09:00 y 09:15 AM cada integrante publica su reporte rápido de 3 líneas. |
| 💬 Texto | **`#backend`** | • Discusión de lógica de negocio, arquitectura Spring Boot 3.4 y Java 21.<br>• Esquemas de base de datos PostgreSQL, JPA y Hibernate.<br>• Contratos de controladores y diseño de endpoints REST. |
| 💬 Texto | **`#frontend`** | • Desarrollo SPA en React 18, Vite y componentes.<br>• Maquetación responsiva con Tailwind CSS y experiencia de usuario (UX).<br>• Integración de consumo de servicios HTTP (Axios) y gestión de estados. |
| 💬 Texto | **`#diseño`** | • Coordinación de prototipos en Figma y sistema de diseño visual.<br>• Paleta institucional UTP, tipografías (`Outfit`, `Plus Jakarta Sans`) y mockups.<br>• Exportación y validación de assets gráficos. |
| 💬 Texto | **`#dudas-tecnicas`** | • Solicitud de ayuda ante bloqueos técnicos o errores de compilación.<br>• Apoyo entre compañeros para no detener el límite WIP. |
| 🤖 Texto | **`#eventos`** | • **Canal exclusivo de automatizaciones y bots:** Aquí llegan automáticamente las notificaciones de GitHub (Pull Requests abiertos y fusionados). *No se utiliza para conversaciones manuales.* |
| 🔊 Voz | **`General` (Sala de voz)** | • Ceremonias semanales en vivo:<br>  - **Sprint Planning** (Lunes 19:00)<br>  - **Sprint Review** (Domingo 18:00)<br>  - **Sprint Retrospective** (Domingo 18:45) |

---

## 2. Configuración del Webhook para Notificaciones Automáticas

Para que el workflow de GitHub Actions (`.github/workflows/discord-notify.yml`) envíe alertas automáticas cada vez que se abre o fusiona un Pull Request, se debe crear un Webhook vinculado al canal **`#eventos`**.

### Paso 1: Crear el Webhook en Discord
1. Abre Discord y dirígete al servidor de **CampusVenta**.
2. Pasa el cursor sobre el canal de texto **`#eventos`** y haz clic en el ícono de engranaje (**Editar canal**).
3. En el menú lateral izquierdo, selecciona **Integraciones**.
4. Haz clic en **Webhooks** y luego en el botón **Nuevo Webhook**.
5. Configura los datos:
   - **Nombre:** `GitHub CampusVenta`
   - **Canal asignado:** `#eventos`
   - **Avatar (opcional):** Logo de GitHub o de CampusVenta.
6. Haz clic en **Copiar URL del Webhook**.
   *(La URL tendrá el formato `https://discord.com/api/webhooks/123456789/abcde...`).*
7. Guarda los cambios.

> [!CAUTION]
> **Seguridad Crítica:** Nunca pegues la URL del webhook en el código, en archivos markdown ni en commits públicos. Quien posea la URL puede enviar mensajes no autorizados al servidor.

---

### Paso 2: Registrar el Secreto en GitHub
1. Abre el repositorio del proyecto en GitHub: `https://github.com/ricardoavmo/CampusVenta`.
2. En la barra superior de pestañas, haz clic en **Settings** (Configuración del repositorio).
3. En la barra lateral izquierda, despliega la sección **Secrets and variables** y selecciona **Actions**.
4. En la pestaña *Repository secrets*, haz clic en el botón verde **New repository secret**.
5. Completa los campos:
   - **Name:** `DISCORD_WEBHOOK_URL` *(Debe ser exactamente este nombre en mayúsculas).*
   - **Secret:** Pega la URL del webhook que copiaste en Discord en el Paso 1.
6. Haz clic en **Add secret**.

---

## 3. Comprobación y Verificación

Una vez configurado el secreto:
1. Al abrir un nuevo Pull Request desde una rama `feature/...` hacia `develop`, GitHub Actions ejecutará automáticamente el workflow y enviará una tarjeta de notificación al canal **`#eventos`** con el autor, el título y el enlace directo.
2. Al fusionar (*Merge*) el Pull Request, llegará automáticamente la notificación de celebración indicando que el código fue integrado exitosamente.
