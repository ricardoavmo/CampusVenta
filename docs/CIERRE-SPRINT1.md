# Informe de Cierre: Sprint 1 (APF1) – CampusVenta

**Fecha de Cierre:** 18 de Octubre de 2026 (Sprint con vencimiento formal: 20/10/2026)  
**Proyecto:** CampusVenta – Marketplace Estudiantil UTP Piura  
**Marco de Trabajo:** Scrumban (Sprints semanales de Lunes a Domingo, límite WIP de 2 tareas por persona)  
**Rama de Entrega:** `feature/sprint1-cierre` (creada a partir de `develop`)

---

## 1. Matriz de Cumplimiento de las 10 Tarjetas del Sprint 1

A continuación se detalla cómo se ha cubierto cada una de las 10 tarjetas comprometidas para este primer sprint:

| # | Tarjeta de Trello / Requerimiento | Archivo(s) de Entrega | Estado | Descripción del Entregable |
| :-: | :--- | :--- | :---: | :--- |
| **1** | **Documentación General y Equipo** | [`README.md`](../README.md) | ✅ Completo | Se eliminó la línea de prueba, se completó la tabla con los 5 integrantes y roles oficiales, se armonizaron versiones con `DEPENDENCIAS.md` y se añadió la sección de gestión del proyecto. |
| **2** | **Definición del Marco Scrumban** | [`docs/metodologia-scrumban.md`](metodologia-scrumban.md) | ✅ Completo | Documento formal con roles, 4 ceremonias semanales con duración sugerida, límite WIP <= 2, estimación Fibonacci (1, 2, 3, 5, 8), DoR, DoD, flujo de 5 listas y hoja de aprobación. |
| **3** | **Plantilla Estándar de Pull Request** | [`.github/pull_request_template.md`](../.github/pull_request_template.md) | ✅ Completo | Formato estandarizado en GitHub con descripción, tarjeta de Trello vinculada, tipo de cambio y checklist obligatorio de Definición de Terminado (DoD). |
| **4** | **Guía de Contribución y Flujo Git** | [`CONTRIBUTING.md`](../CONTRIBUTING.md) | ✅ Completo | Política de ramas (`feature/...` desde `develop`, `main` para releases), convención Conventional Commits en español y proceso de revisión por pares. |
| **5** | **Script de Protección de Ramas** | [`scripts/proteger-ramas.sh`](../scripts/proteger-ramas.sh) | ✅ Completo | Script bash autónomo que usa `gh api` para exigir PR, 1 aprobación y bloquear push directo en `main` y `develop`. Incluye advertencias sobre planes de GitHub. |
| **6** | **Integración y Alertas en Discord** | [`.github/workflows/discord-notify.yml`](../.github/workflows/discord-notify.yml)<br>[`docs/guia-discord.md`](guia-discord.md) | ✅ Completo | Workflow de GitHub Actions que envía embeds a `#eventos` mediante el secreto seguro `DISCORD_WEBHOOK_URL`, y guía completa de canales y configuración. |
| **7** | **Automatización Trello (Butler & GitHub)** | [`docs/trello-butler-reglas.md`](trello-butler-reglas.md) | ✅ Completo | Texto exacto en sintaxis Butler para PR abierto -> *En revisión*, PR fusionado -> *Hecho*, y alerta de exceso de límite WIP (> 2 tarjetas). Pasos para el Power-Up de GitHub. |
| **8** | **Calendario de Ceremonias (.ics)** | [`docs/calendario/ceremonias-sprint.ics`](calendario/ceremonias-sprint.ics)<br>[`docs/calendario/README.md`](calendario/README.md) | ✅ Completo | Archivo iCalendar RFC 5545 en zona `America/Lima` con recurrencias entre 19/10/2026 y 15/11/2026 (Planning, Daily, Review, Retro) y manual de importación. |
| **9** | **Pruebas de Integración en Postman** | [`docs/postman/CampusVenta.postman_collection.json`](postman/CampusVenta.postman_collection.json)<br>[`docs/postman/CampusVenta.postman_environment.json`](postman/CampusVenta.postman_environment.json) | ✅ Completo | Colección con los 12 endpoints reales de `EmprendimientoController`, payloads basados en modelos JPA, variables de entorno y scripts de aserción HTTP (200, 201, 204). |
| **10** | **Auditoría Front-API, Figma y Auth** | [`docs/auditoria-front-api.md`](auditoria-front-api.md)<br>[`docs/figma-orden.md`](figma-orden.md)<br>[`docs/api-auth-contract.md`](api-auth-contract.md) | ✅ Completo | Diagnóstico pantalla por pantalla, checklist para ordenar Figma con tokens UTP, contrato técnico de `/api/auth/login` y `/registro`, y backlog sugerido para Sprint 2. |

---

## 2. Estado de Entregables: Completo, Parcial y Acciones Manuales

### ✅ Lo que quedó 100% Completo en el Repositorio:
- Todos los documentos de arquitectura, metodología, guías técnicas, contratos y especificaciones.
- El workflow de GitHub Actions libre de credenciales expuestas.
- La plantilla de Pull Request y la guía de contribución.
- El script ejecutable para proteger las ramas.
- El archivo `.ics` de calendario y la colección/entorno de Postman listos para importación inmediata.
- Pruebas unitarias de controladores y contexto de Spring Boot pasando al 100%.

### ⚠️ Lo que quedó Parcial (Esperando datos externos):
- **Enlace al archivo de Figma:** Quedó un bloque `TODO` visible en `README.md` y `docs/figma-orden.md` para que el equipo de diseño inserte el enlace cuando el archivo sea compartido públicamente.
- **Códigos de estudiante UTP:** Se conservó el código verificado de Paola (`U23227640`) y se dejó como *"Pendiente"* el de Angel, Ricardo, Toom y Kelvin al no constar en los registros del repositorio.

### 🛠️ Acciones Manuales Requeridas por el Equipo (Fuera del Repositorio):
1. **Activar el Power-Up de GitHub en Trello:** Seguir los pasos de [`docs/trello-butler-reglas.md`](trello-butler-reglas.md) para vincular el repositorio `CampusVenta`.
2. **Cargar las 3 Reglas de Butler:** Copiar y pegar el texto exacto definido en el documento en el motor de Butler de Trello.
3. **Crear el Webhook en Discord:** Seguir [`docs/guia-discord.md`](guia-discord.md) en el canal `#eventos` y guardar la URL como secreto `DISCORD_WEBHOOK_URL` en GitHub Actions (*Settings -> Secrets and variables -> Actions*).
4. **Importar el Calendario (.ics):** Importar [`docs/calendario/ceremonias-sprint.ics`](calendario/ceremonias-sprint.ics) en Google Calendar o Outlook e invitar a los integrantes.
5. **Ejecutar el Script de Protección:** Correr `./scripts/proteger-ramas.sh ricardoavmo/CampusVenta` teniendo sesión iniciada en GitHub CLI con rol administrador.
6. **Tomar Capturas de Evidencia:** Capturar pantallas de Trello (con las listas y reglas), Discord (con la estructura de canales) y GitHub para el informe de la universidad.

---

## 3. Aspectos No Verificados (Pendientes de Confirmar)

En estricto apego al principio de no inventar información:
- **Códigos de estudiante UTP:** *Pendiente de verificar* para Angel Ancajima Juárez, Ricardo Avila Montalbán, Toom Josué Vilela Carmen y Kelvin Cienfuegos Morales.
- **URL pública de Figma:** *Pendiente de verificar* (no existe registro del enlace en los commits ni en archivos previos).
- **Tablero real de Trello y Servidor Discord:** *Pendiente de verificar* el estado de activación en vivo de los Power-Ups y webhooks, ya que residen en plataformas externas a las que el entorno de código no tiene acceso directo de lectura.

---

## 4. Resultado Real de las Pruebas Unitarias del Backend

Ejecución del comando `./mvnw.cmd test` en la raíz del backend (`c:\Users\LENOVO\Documents\CampusVenta\backend`):

```text
[INFO] Scanning for projects...
[INFO] 
[INFO] -------------------< pe.edu.utp:campusventa-backend >-------------------
[INFO] Building campusventa-backend 0.0.1-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] --- resources:3.3.1:resources (default-resources) @ campusventa-backend ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO] 
[INFO] --- compiler:3.13.0:compile (default-compile) @ campusventa-backend ---
[INFO] Nothing to compile - all classes are up to date.
[INFO] 
[INFO] --- resources:3.3.1:testResources (default-testResources) @ campusventa-backend ---
[INFO] Copying 0 resource from src\test\resources to target\test-classes
[INFO] 
[INFO] --- compiler:3.13.0:testCompile (default-testCompile) @ campusventa-backend ---
[INFO] Nothing to compile - all classes are up to date.
[INFO] 
[INFO] --- surefire:3.5.2:test (default-test) @ campusventa-backend ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running pe.edu.utp.campusventa.CampusventaBackendApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 7.553 s -- in pe.edu.utp.campusventa.CampusventaBackendApplicationTests
[INFO] Running pe.edu.utp.campusventa.controller.EmprendimientoControllerTest
2026-10-18T02:51:23.597-05:00  INFO 16112 --- [           main] p.e.u.c.c.EmprendimientoControllerTest   : Starting EmprendimientoControllerTest using Java 21.0.11 with PID 16112
2026-10-18T02:51:24.179-05:00  INFO 16112 --- [           main] p.e.u.c.c.EmprendimientoControllerTest   : Started EmprendimientoControllerTest in 0.599 seconds
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.180 s -- in pe.edu.utp.campusventa.controller.EmprendimientoControllerTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] --------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] --------------------------------------------------------
[INFO] Total time:  10.776 s
[INFO] Finished at: 2026-10-18T02:51:24-05:00
[INFO] --------------------------------------------------------
```

---

## 5. Resumen de Archivos Creados y Modificados en el Sprint

### Archivos Modificados:
- `README.md`: Tabla de 5 integrantes, versiones exactas armonizadas, eliminación de texto de prueba y nueva sección de gestión del proyecto.

### Archivos Creados:
- `.github/pull_request_template.md`: Plantilla estandarizada para Pull Requests.
- `.github/workflows/discord-notify.yml`: Automatización en GitHub Actions para notificaciones a Discord.
- `CONTRIBUTING.md`: Guía de contribución, política de ramas y formato de commits.
- `scripts/proteger-ramas.sh`: Script de automatización de reglas de protección de ramas con GitHub CLI.
- `docs/metodologia-scrumban.md`: Guía metodológica integral de Scrumban, DoR, DoD y firmas de compromiso.
- `docs/guia-discord.md`: Estructura de canales y manual para configurar el webhook seguro en GitHub Secrets.
- `docs/trello-butler-reglas.md`: Reglas textuales de automatización de Butler y activación del Power-Up de GitHub.
- `docs/calendario/ceremonias-sprint.ics`: Calendario iCalendar de ceremonias semanales recurrentes.
- `docs/calendario/README.md`: Manual de importación del calendario para Google Calendar y Outlook.
- `docs/postman/CampusVenta.postman_collection.json`: Colección completa de Postman con los 12 endpoints y tests.
- `docs/postman/CampusVenta.postman_environment.json`: Entorno local de Postman con variables base.
- `docs/auditoria-front-api.md`: Diagnóstico exhaustivo de integración frontend vs backend y backlog propuesto.
- `docs/figma-orden.md`: Guía de orden, estructura de páginas, nomenclatura de frames y tokens de color UTP.
- `docs/api-auth-contract.md`: Especificación formal de endpoints de autenticación para desbloquear el Sprint 2.
- `docs/CIERRE-SPRINT1.md`: Informe final de auditoría y cierre del Sprint 1.
