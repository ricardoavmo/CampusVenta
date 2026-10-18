# Reglas de Butler y Configuración del Power-Up de GitHub en Trello

Este documento detalla la configuración de automatizaciones mediante **Butler** y la integración del **Power-Up de GitHub** en el tablero Scrumban de **CampusVenta**.

---

## 1. Activación del Power-Up de GitHub en Trello

El Power-Up oficial de GitHub permite vincular ramas, commits y Pull Requests directamente a las tarjetas de Trello, habilitando que las reglas de Butler reaccionen a eventos del repositorio.

### Pasos de Activación:
1. Abre el tablero oficial de Trello de **CampusVenta**.
2. En la barra superior derecha del tablero, haz clic en el botón **Power-Ups** (o el ícono de cohete).
3. Selecciona **Agregar Power-Ups** y busca `GitHub` en la barra de búsqueda de integraciones.
4. Ubica el Power-Up oficial desarrollado por **GitHub** y haz clic en **Agregar**.
5. Haz clic en **Configuración del Power-Up** y luego en **Autorizar cuenta de GitHub**.
6. Inicia sesión con tu cuenta de GitHub y autoriza a Trello para acceder al repositorio `ricardoavmo/CampusVenta`.
7. En la configuración del Power-Up, selecciona el repositorio `CampusVenta` como el repositorio predeterminado para el tablero.

---

## 2. Reglas de Automatización de Butler (Texto Exacto)

Para acceder al motor de automatización en Trello:
1. En la esquina superior derecha del tablero, haz clic en **Automatización** (ícono de rayo) y luego en **Reglas**.
2. Haz clic en **Crear regla** y configura los siguientes disparadores (*Triggers*) y acciones (*Actions*):

---

### Regla 1: Mover tarjeta al abrir un Pull Request
**Propósito:** Cuando un desarrollador abre un PR en GitHub vinculando la tarjeta, esta debe transicionar automáticamente a la columna de revisión de código.

- **Texto en lenguaje Butler (Inglés estándar de Trello):**
  ```text
  when a pull request is opened in github on a card, move the card to the top of list "En revisión"
  ```
- **Equivalente en interfaz en Español:**
  - **Disparador:** *Cuando se abre una solicitud de extracción en GitHub en una tarjeta*
  - **Acción:** *Mover la tarjeta a la parte superior de la lista "En revisión"*

---

### Regla 2: Mover a Hecho y marcar fecha al fusionar el Pull Request
**Propósito:** Cuando el PR es aprobado y fusionado (*merged*) en `develop`, la tarjeta se considera terminada y se valida su fecha de cumplimiento.

- **Texto en lenguaje Butler (Inglés estándar de Trello):**
  ```text
  when a pull request is merged in github on a card, move the card to the top of list "Hecho" and mark the due date as complete
  ```
- **Equivalente en interfaz en Español:**
  - **Disparador:** *Cuando se fusiona una solicitud de extracción en GitHub en una tarjeta*
  - **Acción:** *Mover la tarjeta a la parte superior de la lista "Hecho" y marcar la fecha de vencimiento como completada*

---

### Regla 3: Alerta de Infracción del Límite WIP (> 2 tarjetas por persona)
**Propósito:** Asegurar el cumplimiento estricto del límite WIP de Scrumban (máximo 2 tareas activas por persona en "En proceso"). Si un integrante intenta jalar una 3ra tarea, Butler emite una alerta pública en la tarjeta.

- **Texto en lenguaje Butler (Inglés estándar de Trello):**
  ```text
  when a card is moved into list "En proceso", if the member has more than 2 cards in list "En proceso", post comment "⚠️ Alerta de límite WIP excedido: @{memberusername} tienes más de 2 tareas en proceso simultáneamente en este tablero. Por favor enfócate en terminar o destrabar tus tareas activas antes de jalar nuevo trabajo."
  ```
- **Equivalente en interfaz en Español:**
  - **Disparador:** *Cuando se mueve una tarjeta a la lista "En proceso"*
  - **Condición:** *Si el miembro asignado tiene más de 2 tarjetas en la lista "En proceso"*
  - **Acción:** *Publicar un comentario de advertencia mencionando al usuario con la plantilla de texto indicada arriba.*

---

## 3. Guía de Vinculación Manual de PR a Tarjeta
Para que Butler y el Power-Up asocien un Pull Request con su tarjeta de Trello:
- **Opción A (Desde GitHub):** Incluir la URL de la tarjeta de Trello en la descripción del Pull Request (nuestra plantilla `.github/pull_request_template.md` ya tiene un campo específico para ello).
- **Opción B (Desde Trello):** Abrir la tarjeta, hacer clic en el botón **GitHub** en la barra lateral derecha y seleccionar **Adjuntar Pull Request**.
