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
| **Angel Ancajima Juárez** | **Scrum Master (SM) / Tech Lead** | Facilitación de ceremonias, remoción de impedimentos, cumplimiento de DoR/DoD y arquitectura técnica. |
| **Ricardo Avila Montalbán** | **Backend Developer** | Desarrollo de API REST Spring Boot, capa de seguridad JWT, persistencia JPA en PostgreSQL y configuración de repositorio/CI. |
| **Toom Josué Vilela Carmen** | **Frontend Developer** | Diseño de interfaces en Figma, desarrollo SPA React + Vite + Tailwind CSS y diseño responsivo. |
| **Kelvin Cienfuegos Morales** | **QA Engineer** | Pruebas unitarias, pruebas de integración, colecciones de Postman, validación de criterios de aceptación y auditoría de pantallas. |

---

### 3. Ceremonias del Sprint (Ciclo de 2 Semanas)

1. **Sprint Planning (Planificación del Sprint):**
   * **Frecuencia:** Inicio de cada Sprint (Lunes 08:00 - 08:45, hora de Perú - `America/Lima`, 45 min).
   * **Objetivo:** Definir el Sprint Goal, seleccionar historias del Product Backlog que cumplan con la DoR y estimar el esfuerzo en puntos de historia.
2. **Daily Standup (Sincronización Diaria):**
   * **Frecuencia:** Lunes a Viernes (09:00, hora de Perú - `America/Lima`, asíncrono en Discord).
   * **Preguntas clave:** ¿Qué completé ayer? ¿Qué completaré hoy? ¿Qué impedimentos bloquean mi avance?
3. **Sprint Review (Demostración de Incremento):**
   * **Frecuencia:** Sábados (18:00 - 18:45, hora de Perú - `America/Lima`, 45 min).
   * **Objetivo:** Demostración en vivo del software funcional al Product Owner y stakeholders, validando criterios de aceptación.
4. **Sprint Retrospective (Retrospectiva del Equipo):**
   * **Frecuencia:** Domingos (19:00 - 19:30, hora de Perú - `America/Lima`, 30 min).
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
Una tarea o tarjeta solo puede moverse a la columna **"Hecho"** cuando:
- [x] Código desarrollado conforme a estándares del proyecto y en su rama de feature (`feature/*`).
- [x] Todas las pruebas unitarias pasan sin errores (`mvnw test` o `npm test`).
- [x] Build de producción exitoso sin fallos de compilación (`npm run build`).
- [x] Pull Request creado hacia `main`/`develop` usando la plantilla oficial.
- [x] Revisión de código (Code Review) aprobada por al menos un compañero de equipo.
- [x] Sin credenciales, contraseñas o tokens expuestos en el código fuente.
- [x] Criterios de aceptación verificados y validados por QA / Product Owner.

---

### 6. Políticas Kanban y Límites de Trabajo en Progreso (WIP Limits)

Conforme a lo establecido en la sección II.9 del informe técnico, el tablero de Trello se organiza en las siguientes listas con sus respectivos límites:

| Lista en Trello | WIP Limit | Política de Operación |
| :--- | :---: | :--- |
| **Product Backlog** | ∞ | Historias ordenadas por valor de negocio por el PO. |
| **Sprint Backlog** | 8 | Tareas comprometidas para el sprint actual que cumplen DoR. |
| **En proceso** | **6** | Máximo 2 tarjetas por persona y 6 en total para el equipo simultáneamente. |
| **En revisión** | **4** | Máximo 4 tarjetas en revisión de código o validación de pruebas QA. |
| **Hecho** | ∞ | Tareas que cumplen al 100% la Definition of Done con evidencia verificable. |

---

### 7. Reglas de Automatización de Butler (Trello + GitHub Power-Up)

Para sincronizar el flujo de trabajo entre GitHub y Trello sin intervención manual y respetando las listas exactas del tablero:

1. **Flujo de Apertura de Pull Request:**
   ```text
   when a pull request is attached to a card, move the card to the top of list "En revisión"
   ```
2. **Flujo de Fusión de Pull Request (Merge):**
   ```text
   when a pull request is merged on a card, move the card to the list "Hecho" and mark the due date as complete
   ```
3. **Control de Límite WIP en Desarrollo ("En proceso" > 6):**
   ```text
   when a card is added to list "En proceso" and the number of cards in list "En proceso" is greater than 6, post comment "⚠️ Atención: Se ha superado el WIP Limit en proceso (máximo 6 tareas simultáneas para el equipo)."
   ```
4. **Control de Límite WIP en Revisión ("En revisión" > 4):**
   ```text
   when a card is added to list "En revisión" and the number of cards in list "En revisión" is greater than 4, post comment "⚠️ Atención: Se ha superado el WIP Limit en revisión (máximo 4 tareas en revisión)."
   ```

