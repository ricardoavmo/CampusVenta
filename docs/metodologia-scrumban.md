# Marco de Trabajo Metodológico: Scrumban – CampusVenta

Este documento describe el marco de trabajo ágil adaptado que rige el desarrollo del proyecto **CampusVenta** (UTP Sede Piura). Combina la predictibilidad de sprints semanales de Scrum con la flexibilidad, visualización del flujo y control de sobrecarga de Kanban.

---

## 1. Roles y Responsabilidades

El equipo multidisciplinario está conformado por 5 integrantes con responsabilidades claras:

| Integrante | Rol Ágil | Responsabilidades Principales |
| :--- | :--- | :--- |
| **Paola Elvira Mijahuanga Pingo** | **Product Owner (PO)** / Gerente General | • Define la visión del producto y valor de negocio.<br>• Mantiene, prioriza y desglosa el *Product Backlog* en Trello.<br>• Define los criterios de aceptación y valida que los entregables cumplan con la necesidad estudiantil.<br>• Es el enlace principal con los usuarios (estudiantes y emprendedores de la UTP). |
| **Angel Ancajima Juárez** | **Scrum Master (SM)** / Tech Lead | • Facilita el cumplimiento de las ceremonias Scrumban.<br>• Vela por el respeto del límite de trabajo en proceso (*WIP limits*).<br>• Remueve impedimentos técnicos y de coordinación del equipo.<br>• Define la arquitectura de software y supervisa las buenas prácticas de Git y CI/CD. |
| **Ricardo Avila Montalbán** | **Desarrollador Backend** | • Diseña e implementa la API REST con Spring Boot 3.4 y Java 21.<br>• Modela y gestiona la persistencia de datos en PostgreSQL con JPA/Hibernate.<br>• Construye endpoints seguros, validaciones de entrada y pruebas unitarias de controladores. |
| **Toom Josué Vilela Carmen** | **Desarrollador Frontend** | • Implementa la interfaz SPA responsiva con React 18, Vite y Tailwind CSS.<br>• Traduce los prototipos de Figma en componentes interactivos y accesibles.<br>• Gestiona la integración con la API REST y el almacenamiento local de estado. |
| **Kelvin Cienfuegos Morales** | **Ingeniero de Calidad (QA)** | • Diseña casos de prueba funcionales y matrices de verificación.<br>• Ejecuta y audita pruebas automatizadas de backend (`JUnit 5`, `Mockito`) y exploratorias de interfaz.<br>• Asegura que cada tarjeta cumpla estrictamente con la Definición de Terminado (DoD) antes de pasar a producción. |

---

## 2. Ceremonias Semanales

El proyecto opera en **sprints semanales de lunes a domingo**. Se han fijado ceremonias concisas para maximizar el tiempo de desarrollo activo:

| Ceremonia | Cuándo se realiza | Duración Sugerida | Canal / Medio | Objetivo y Dinámica |
| :--- | :--- | :---: | :--- | :--- |
| **Sprint Planning** | Lunes (19:00 - 20:00) | 45 - 60 min | Sala de Voz Discord (*General*) | • El PO presenta los objetivos del sprint y las tarjetas priorizadas del Backlog.<br>• El equipo técnico estima el esfuerzo en puntos y compromete las tarjetas a la *Lista de tareas*.<br>• Se verifica que cada tarjeta cumpla con la Definición de Listo (DoR). |
| **Daily Standup (Asíncrono)** | Lunes a Viernes (09:00 - 09:15) | 5 - 10 min de lectura | Discord (`#general`) | Cada integrante publica tres puntos clave:<br>1. *¿Qué completé ayer?*<br>2. *¿En qué trabajaré hoy?*<br>3. *¿Tengo algún bloqueo o impedimento?* |
| **Sprint Review** | Domingo (18:00 - 18:45) | 30 - 45 min | Sala de Voz Discord (*General*) | • Demostración en vivo de los incrementos de software terminados.<br>• El PO valida si los criterios de aceptación se cumplieron para aceptar formalmente las tarjetas. |
| **Sprint Retrospective** | Domingo (18:45 - 19:30) | 30 - 45 min | Sala de Voz Discord (*General*) | • Reflexión del equipo sobre el proceso:<br>  - *¿Qué funcionó bien?*<br>  - *¿Qué podemos mejorar?*<br>  - *Acciones concretas para el siguiente sprint.* |

---

## 3. Estimación por Puntos de Historia

Para estimar el esfuerzo, complejidad e incertidumbre de cada tarjeta se utiliza una escala simplificada de la serie **Fibonacci**:

- **1 Punto:** Tarea muy sencilla, rutinaria y sin riesgo (ej: ajuste de un texto, cambio menor de estilo, documentación breve).
- **2 Puntos:** Tarea sencilla con alcance bien acotado (ej: nuevo campo en un formulario existente, script auxiliar).
- **3 Puntos:** Tarea de complejidad media con lógica conocida (ej: nuevo endpoint CRUD estándar, componente React con estado).
- **5 Puntos:** Tarea compleja que requiere interacción entre múltiples módulos o investigación (ej: filtro multicriterio con búsqueda, modal con flujo de subida de archivos y validación).
- **8 Puntos:** Tarea de alta complejidad o incertidumbre. Se sugiere analizar si puede dividirse en dos o más tarjetas más pequeñas antes de iniciar.

---

## 4. Control de Flujo y Límite WIP (Work In Progress)

El principio rector de Kanban en Scrumban es **"Dejar de empezar y empezar a terminar"**:

- **Límite WIP en "En proceso":** Máximo **2 tarjetas por persona** simultáneamente.
- **Regla:** Ningún integrante puede tomar una tercera tarjeta de la *Lista de tareas* si ya tiene 2 tarjetas activas en *En proceso*. Si una tarjeta se bloquea, se debe solicitar apoyo en Discord (`#dudas-tecnicas`) o apoyar a otro compañero a desbloquear su revisión antes de iniciar trabajo nuevo.

---

## 5. Tablero Trello: Estructura de Listas y Transición de Tarjetas

El tablero de Trello cuenta con 5 columnas oficiales. El movimiento de cada tarjeta responde a estados objetivos del código:

```text
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌───────────────┐    ┌───────────┐
│   Backlog   │ ──>│ Lista de tareas │ ──>│  En proceso  │ ──>│  En revisión  │ ──>│   Hecho   │
└─────────────┘    └─────────────────┘    └──────────────┘    └───────────────┘    └───────────┘
```

1. **Backlog (Pila del Producto):**
   - Repositorio general de ideas, historias de usuario, requerimientos y deuda técnica.
   - Es administrado por la Product Owner. Las tarjetas aquí aún no tienen fecha de sprint comprometida.
2. **Lista de tareas (Sprint Backlog / Por hacer):**
   - Tarjetas comprometidas durante la *Sprint Planning* para el sprint en curso.
   - Cumplen estrictamente con la **Definición de Listo (DoR)**.
3. **En proceso (WIP máximo 2 por persona):**
   - Trabajo activo. El desarrollador asignado crea la rama `feature/<tarea>-descripcion` desde `develop` y mueve la tarjeta a esta columna.
4. **En revisión (Code Review & QA):**
   - Se mueve aquí cuando el desarrollador abre un Pull Request hacia `develop`.
   - Se activa automáticamente mediante la automatización Butler de Trello.
   - Requiere revisión de código por otro integrante y validación de pruebas por QA.
5. **Hecho (Done):**
   - Se mueve cuando el Pull Request ha sido aprobado y fusionado en `develop`.
   - Cumple plenamente con la **Definición de Terminado (DoD)**.
   - Butler marca automáticamente la fecha de vencimiento como cumplida.

---

## 6. Definición de Listo (Definition of Ready - DoR)

Una tarjeta puede moverse del *Backlog* a la *Lista de tareas* únicamente si cumple con los siguientes requisitos:

- [ ] **Título claro y descriptivo:** Expresa la funcionalidad o corrección concreta.
- [ ] **Descripción y contexto:** Explica el *por qué* y para *quién* se realiza.
- [ ] **Criterios de Aceptación definidos:** Lista verificable de condiciones que debe cumplir el resultado.
- [ ] **Estimación asignada:** Cuenta con puntuación en Fibonacci (1, 2, 3, 5 u 8).
- [ ] **Dependencias resueltas:** No está bloqueada por otra tarea inconclusa.
- [ ] **Diseño / Contrato disponible (si aplica):** Si requiere interfaz, existe referencia visual o mockup; si requiere endpoint, existe el contrato de datos.

---

## 7. Definición de Terminado (Definition of Done - DoD)

Una tarjeta puede considerarse formalmente en la columna *Hecho* únicamente si satisface todos los siguientes puntos:

- [ ] **Código implementado y probado:** La lógica funciona según los criterios de aceptación.
- [ ] **Pruebas unitarias ejecutadas:** En backend, `./mvnw test` compila y pasa sin errores; en frontend, `npm run build` construye exitosamente.
- [ ] **Cero secretos expuestos:** Ningún archivo contiene contraseñas, tokens de acceso ni URLs de webhooks privadas.
- [ ] **Revisión por pares (Code Review):** El Pull Request en GitHub cuenta con al menos 1 aprobación de otro miembro del equipo.
- [ ] **Fusión limpia:** El PR fue fusionado en la rama `develop` sin conflictos.
- [ ] **Documentación actualizada:** Se actualizaron guías, contratos o notas de versión si el cambio afectó la arquitectura o APIs.

---

## 8. Aprobación y Compromiso del Equipo

Al firmar esta sección, cada integrante del equipo valida y se compromete a respetar las normas de convivencia, ceremonias, límites WIP y definiciones de calidad acordadas para el desarrollo de **CampusVenta**:

- [ ] **Paola Elvira Mijahuanga Pingo** (Product Owner / Gerente General)
- [ ] **Angel Ancajima Juárez** (Scrum Master / Tech Lead)
- [ ] **Ricardo Avila Montalbán** (Backend Developer)
- [ ] **Toom Josué Vilela Carmen** (Frontend Developer)
- [ ] **Kelvin Cienfuegos Morales** (QA Engineer)
