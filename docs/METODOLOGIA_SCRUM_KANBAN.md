# Metodología de Desarrollo: Scrumban (Scrum + Kanban)
## Proyecto: CampusVenta – UTP Sede Piura

---

### 1. Marco Metodológico
Para el desarrollo de **CampusVenta**, se adopta un modelo híbrido **Scrumban**, combinando la estructura de roles, ceremonias y time-boxes de **Scrum** con la flexibilidad, visualización continua y límites de trabajo en progreso (WIP Limits) de **Kanban**.

---

### 2. Estructura de Roles del Equipo

| Integrante | Rol Metodológico | Responsabilidades Principales |
| :--- | :--- | :--- |
| **Paola Elvira Mijahuanga Pingo** | **Product Owner (PO)** | Visión del producto, priorización del Backlog, validación del valor de negocio, gestión de stakeholders y criterios de aceptación. |
| **Angel Junior Ancajima Juárez** | **Scrum Master (SM) / Tech Lead** | Facilitación de ceremonias, remoción de impedimentos, cumplimiento de DoR/DoD y arquitectura técnica. |
| **Ricardo Emanuel Avila Montalbán** | **Backend Lead** | Desarrollo de API REST Spring Boot, capa de seguridad JWT, persistencia JPA en PostgreSQL y configuración de repositorio/CI. |
| **Toom Josué Vilela Carmen** | **Frontend Lead** | Diseño de interfaces en Figma, desarrollo SPA React + Vite + Tailwind CSS y diseño responsivo. |
| **Kelvin Cienfuegos Morales** | **QA Engineer** | Pruebas unitarias, pruebas de integración, colecciones de Postman, validación de criterios de aceptación y auditoría de pantallas. |

---

### 3. Ceremonias del Sprint (Ciclo de 2 Semanas)

1. **Sprint Planning (Planificación del Sprint):**
   * **Frecuencia:** Inicio de cada Sprint (Lunes 08:30 - 10:00 COT).
   * **Objetivo:** Definir el Sprint Goal, seleccionar historias del Product Backlog que cumplan con la DoR y estimar el esfuerzo en puntos de historia.
2. **Daily Standup (Sincronización Diaria):**
   * **Frecuencia:** Lunes a Viernes (09:00 - 09:15 COT, 15 min vía Discord).
   * **Preguntas clave:** ¿Qué completé ayer? ¿Qué completaré hoy? ¿Qué impedimentos bloquean mi avance?
3. **Sprint Review (Demostración de Incremento):**
   * **Frecuencia:** Fin de cada Sprint (Viernes 16:00 - 17:00 COT).
   * **Objetivo:** Demostración en vivo del software funcional al Product Owner y stakeholders, validando criterios de aceptación.
4. **Sprint Retrospective (Retrospectiva del Equipo):**
   * **Frecuencia:** Inmediatamente posterior al Sprint Review (Viernes 17:00 - 18:00 COT).
   * **Objetivo:** Analizar qué funcionó bien, qué debe mejorar y definir acuerdos de mejora continua accionables para el siguiente sprint.

---

### 4. Definition of Ready (DoR) – Definición de Preparado
Una tarjeta o historia de usuario solo puede moverse al **Sprint Backlog** si cumple:
- [x] Título claro siguiendo el formato estándar de Historia de Usuario o Tarea Técnica.
- [x] Descripción detallada con contexto y motivación de la necesidad.
- [x] Criterios de aceptación explícitos y verificables (Gherkin o checklist funcional).
- [x] Estimación consensuada por el equipo de desarrollo.
- [x] Mockup o especificación visual adjunta (si aplica a UI/UX).
- [x] Dependencias técnicas y endpoints requeridos identificados.

---

### 5. Definition of Done (DoD) – Definición de Terminado
Una tarea o tarjeta solo puede moverse a la columna **"Hecho" (Done)** cuando:
- [x] Código desarrollado conforme a estándares del proyecto y en su rama de feature (`feature/*`).
- [x] Todas las pruebas unitarias pasan sin errores (`mvnw test` o `npm test`).
- [x] Build de producción exitoso sin fallos de compilación (`npm run build`).
- [x] Pull Request creado hacia `main`/`develop` usando la plantilla oficial.
- [x] Revisión de código (Code Review) aprobada por al menos un compañero de equipo.
- [x] Sin credenciales, contraseñas o tokens expuestos en el código fuente.
- [x] Criterios de aceptación verificados y validados por QA / Product Owner.

---

### 6. Políticas Kanban y Límites de Trabajo en Progreso (WIP Limits)

El tablero de Trello se organiza en las siguientes columnas con sus límites:

| Columna | WIP Limit | Política de Operación |
| :--- | :---: | :--- |
| **📋 Product Backlog** | ∞ | Historias ordenadas por valor de negocio por el PO. |
| **🎯 Sprint Backlog** | 8 | Tareas comprometidas para el sprint actual que cumplen DoR. |
| **⚙️ En Proceso (In Progress)** | **3** | Máximo 3 tareas simultáneas en desarrollo en todo el equipo para evitar cuellos de botella y dispersión de foco. |
| **🔍 En Revisión / QA** | **2** | Máximo 2 tareas esperando code review o validación de pruebas. |
| **✅ Hecho (Done)** | ∞ | Tareas que cumplen al 100% la Definition of Done con evidencia verificable. |
