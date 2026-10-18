# Guía de Contribución y Flujo de Trabajo Git – CampusVenta

¡Bienvenido al repositorio de **CampusVenta**! Para asegurar la calidad del código, un historial limpio y una integración fluida entre los integrantes del equipo, seguimos un modelo estandarizado de trabajo basado en ramas temáticas (*Feature Branch Workflow*) y revisiones por pares (*Code Review*).

---

## 1. Estructura y Política de Ramas

El repositorio utiliza una estrategia basada en dos ramas principales y ramas cortas de trabajo:

```text
main (solo releases estables y entregas evaluables)
 ▲
 │  (Pull Request al finalizar cada Sprint)
develop (rama activa de integración del equipo)
 ▲
 ├── feature/SP1-01-busqueda-predictiva   <── se crea desde develop
 ├── feature/SP1-02-modelo-emprendimiento <── se crea desde develop
 └── fix/SP1-03-error-cors                <── se crea desde develop
```

- **`main`:** Contiene exclusivamente código en estado de producción o entregas formales del sprint. **Prohibido hacer commits directos (*direct push*)**.
- **`develop`:** Rama base de integración diaria. Todo el trabajo nuevo converge aquí a través de Pull Requests aprobados.
- **`feature/<tarea>-descripcion`:** Ramas de trabajo individuales para cada tarjeta del tablero de Trello.
  - Ejemplo: `feature/SP1-04-subida-foto-local`
  - Ejemplo: `fix/SP1-08-espaciado-buscador`
  - Ejemplo: `docs/SP1-10-cierre-sprint`

---

## 2. Convención para Mensajes de Commit

Aplicamos una versión simplificada de **Conventional Commits**. Cada commit debe ser atómico, conciso y redactado en español:

**Formato:**
```text
tipo: descripción breve en minúsculas y modo imperativo
```

### Tipos Permitidos:
- **`feat:`** Una nueva característica o funcionalidad visible para el usuario.  
  *Ejemplo:* `feat: agregar filtro por categoria de postres en marketplace`
- **`fix:`** Corrección de un fallo o error en el sistema.  
  *Ejemplo:* `fix: corregir solapamiento del boton buscar en movil`
- **`docs:`** Cambios exclusivamente en archivos de documentación (`README.md`, `docs/`, comentarios).  
  *Ejemplo:* `docs: actualizar tabla de integrantes y roles`
- **`chore:`** Tareas de mantenimiento, configuración de dependencias, scripts o herramientas.  
  *Ejemplo:* `chore: configurar plugin pwa y manifiesto web`
- **`refactor:`** Modificaciones internas del código que no alteran la funcionalidad ni arreglan bugs.  
  *Ejemplo:* `refactor: simplificar logica de filtros en componente home`
- **`test:`** Creación o actualización de pruebas unitarias o de integración.  
  *Ejemplo:* `test: agregar pruebas unitarias para controlador de emprendimientos`

---

## 3. Flujo Paso a Paso para Desarrollar una Tarjeta

### Paso 1: Tomar la tarjeta en Trello
1. Mover la tarjeta desde *Lista de tareas* a *En proceso* (máximo 2 tarjetas activas por persona).
2. Asignarte como miembro en la tarjeta.

### Paso 2: Crear tu rama local desde `develop`
```bash
# Asegurarse de tener la versión más reciente de develop
git checkout develop
git pull origin develop

# Crear tu rama de trabajo con el nombre de la tarea
git checkout -b feature/mi-tarea-descripcion
```

### Paso 3: Realizar commits pequeños
Desarrolla la funcionalidad realizando commits frecuentes y claros:
```bash
git add archivo-modificado.jsx
git commit -m "feat: implementar selector de fotos local"
```

### Paso 4: Validar antes de subir
Antes de enviar tus cambios al servidor remoto, asegúrate de que el proyecto compile y pase las pruebas:
- **Backend:**
  ```bash
  cd backend
  ./mvnw test
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm run build
  ```

### Paso 5: Subir tu rama y abrir el Pull Request
```bash
git push -u origin feature/mi-tarea-descripcion
```
1. Entra a GitHub y abre un Pull Request dirigido hacia la rama **`develop`** (nunca hacia `main`).
2. Completa la plantilla de PR obligatoria con el enlace a Trello y el checklist de DoD.
3. Asigna al menos a un compañero de equipo como revisor (*Reviewer*).

### Paso 6: Revisión por Pares (Code Review)
- El revisor debe inspeccionar el código, verificar que no incluya secretos y confirmar que no rompa la compilación.
- Una vez recibida la aprobación formal (al menos 1 aprobación), el autor o el revisor realiza el **Merge** hacia `develop`.
- Butler en Trello moverá automáticamente la tarjeta a la columna *Hecho*.
