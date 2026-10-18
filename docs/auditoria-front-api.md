# Auditoría Técnica de Integración: Frontend SPA ↔ API REST

Este documento presenta el diagnóstico exhaustivo del estado de integración entre las pantallas del cliente web (React 18 / Vite) y los servicios expuestos por el backend (Spring Boot 3.4.3 / PostgreSQL) para el cierre del **Sprint 1 (Avance de Proyecto Final 1 - APF1)**.

---

## 1. Resumen Ejecutivo del Diagnóstico

El backend de **CampusVenta** cuenta con una API REST robusta y probada para la entidad central (`Emprendimiento`), su catálogo de (`Producto`) y sus valoraciones (`Resena`). Sin embargo, debido a que el alcance inicial de APF1 no contemplaba autenticación con Spring Security ni JWT, el frontend ha implementado una capa híbrida inteligente:
1. **Llamadas HTTP reales a la API REST:** En catálogo general, filtros multicriterio, vista detallada, agregado de reseñas y CRUD de productos en el panel.
2. **Capa de resiliencia con datos de prueba (`seedData.js`):** Permite que la interfaz nunca se rompa si el backend se encuentra temporalmente detenido o en mantenimiento.
3. **Persistencia local en `localStorage` y `AuthContext`:** Utilizada para simular el ciclo de vida del usuario (vendedor vs comprador), favoritos y configuración del sistema.

---

## 2. Auditoría Detallada por Pantalla / Módulo

### 2.1 Pantalla de Inicio / Marketplace (`frontend/src/pages/Home.jsx`)
- **Mecanismo de Datos:** **Híbrido (API Real con Fallback Gracioso).**
- **Endpoints Consumidos:**
  - `GET /api/emprendimientos`: Búsqueda predictiva y filtros combinados (`categoria`, `disponible`, `search`).
  - `GET /api/emprendimientos/activos`: Alimentación del radar de presencia en torres/pisos y carrusel continuo.
- **Datos Demo / Fallback:** En caso de error de red o timeout de Axios, carga `seedData.js` sin bloquear la experiencia de usuario.
- **Brechas Detectadas:**
  - El filtrado por ubicación física (Torre A, Torre B, Pisos) se procesa en el cliente sobre el listado obtenido, ya que el backend actualmente filtra por texto y categoría mediante Specification.
- **Prioridad de Mejora:** **Baja** (Funciona de forma fluida y óptima en producción).

---

### 2.2 Ficha del Emprendimiento (`frontend/src/pages/Ficha.jsx`)
- **Mecanismo de Datos:** **Híbrido (API Real + LocalStorage).**
- **Endpoints Consumidos:**
  - `GET /api/emprendimientos/{id}`: Consulta de puesto, productos y reseñas históricas.
  - `POST /api/emprendimientos/{id}/resenas`: Creación de reseñas y recálculo en vivo de la calificación promedio.
- **Datos Demo / Fallback:** Si el ID solicitado no existe en la base de datos PostgreSQL, busca en los puestos locales de `seedData.js`. Favoritos guardados en `localStorage` (`campusventa_favoritos`).
- **Brechas Detectadas:**
  - La calculadora de pedidos consolida ítems en el navegador y deriva la transacción directamente a la API de WhatsApp (`wa.me`). No existe entidad `Orden` ni endpoint de pedidos en backend (esto es intencional según el alcance del proyecto para evitar comisiones bancarias).
- **Prioridad de Mejora:** **Media** (Evaluar en Sprint 2 si se desea almacenar un historial de pedidos enviados para métricas del vendedor).

---

### 2.3 Panel del Emprendedor (`frontend/src/pages/Panel.jsx`)
- **Mecanismo de Datos:** **Híbrido (API REST + Persistencia Local).**
- **Endpoints Consumidos:**
  - `PATCH /api/emprendimientos/{id}`: Actualización en vivo de torre, piso, disponibilidad y datos generales.
  - `POST /api/emprendimientos/{id}/productos`: Creación de productos con carga de foto en Base64.
  - `PUT /api/emprendimientos/{id}/productos/{productoId}`: Edición de stock, precio y etiquetas.
  - `DELETE /api/emprendimientos/{id}/productos/{productoId}`: Eliminación de ítems del catálogo.
  - `DELETE /api/emprendimientos/{id}`: Eliminación del puesto completo.
- **Datos Demo / Fallback:** Utiliza `localStorage` (`campusventa_mis_puestos`) para reflejar los cambios instantáneamente y persistir sesiones demo cuando el backend está ausente.
- **Brechas Detectadas:**
  - El panel asume la identidad del vendedor mediante el contexto del cliente (`user.emprendimientoId`), sin validar un token JWT de autorización en las cabeceras HTTP (`Authorization: Bearer ...`).
- **Prioridad de Mejora:** **Alta** (Requiere integración con el módulo de autenticación formal en Sprint 2).

---

### 2.4 Perfil de Usuario (`frontend/src/pages/Perfil.jsx`)
- **Mecanismo de Datos:** **LocalStorage + AuthContext.**
- **Endpoints Consumidos:**
  - No consume endpoints directos de usuario.
  - Puede invocar `POST /api/emprendimientos` al utilizar la opción *"Abrir Puesto en Campus"*.
- **Datos Demo / Fallback:** Lee y escribe en la clave `campusventa_session` del navegador. Permite alternar roles entre *"Vendedor"* (Valeria Mendoza) y *"Comprador"* (Carlos Morales).
- **Brechas Detectadas:**
  - Falta un controlador de usuarios en backend (`UsuarioController`) que permita persistir datos del estudiante (carrera, ciclo, biografía, redes sociales y avatar) en PostgreSQL.
- **Prioridad de Mejora:** **Alta**.

---

### 2.5 Registro de Nuevo Emprendimiento (`frontend/src/pages/NuevoEmprendimiento.jsx`)
- **Mecanismo de Datos:** **API Real + LocalStorage.**
- **Endpoints Consumidos:**
  - `POST /api/emprendimientos`: Creación del nuevo puesto estudiantil.
- **Datos Demo / Fallback:** Guarda el ID generado en la lista de puestos administrados del usuario en `localStorage` y actualiza la sesión activa.
- **Brechas Detectadas:**
  - No vincula el puesto con un ID de usuario autenticado en base de datos; almacena el nombre del vendedor como una cadena simple (`vendedorNombre`).
- **Prioridad de Mejora:** **Media**.

---

### 2.6 Inicio de Sesión y Registro (`frontend/src/pages/Login.jsx`)
- **Mecanismo de Datos:** **Datos Demo / Simulación Local.**
- **Endpoints Consumidos:** **Ninguno.**
- **Datos Demo / Fallback:** Valida expresiones regulares de correo institucional (`@utp.edu.pe` o formato de código `U...`), genera una sesión local y la persiste en `localStorage`. Ofrece botones de acceso rápido como demo vendedor y demo comprador.
- **Brechas Detectadas:**
  - Ausencia de endpoints de autenticación en backend (`/api/auth/login`, `/api/auth/registro`).
- **Prioridad de Mejora:** **Alta** (Es el principal desbloqueador de seguridad para el Sprint 2).

---

### 2.7 Configuración del Sistema (`frontend/src/pages/Configuracion.jsx`)
- **Mecanismo de Datos:** **LocalStorage.**
- **Endpoints Consumidos:** **Ninguno.**
- **Datos Demo / Fallback:** Administra preferencias de interfaz (modo oscuro profundo, notificaciones push PWA y limpieza de caché).
- **Brechas Detectadas:**
  - Preferencias meramente locales. No impacta en la lógica del negocio.
- **Prioridad de Mejora:** **Baja**.

---

## 3. Matriz Resumen de Pantallas vs API

| Pantalla | Archivo Fuente | Consumo API Real | LocalStorage / Demo | Endpoints Asociados | Brecha Principal | Prioridad |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| **Marketplace (Home)** | `pages/Home.jsx` | ✅ Sí | ✅ Fallback | `GET /api/emprendimientos`<br>`GET /api/emprendimientos/activos` | Filtros de torre/piso en memoria cliente | Baja |
| **Ficha de Puesto** | `pages/Ficha.jsx` | ✅ Sí | ✅ Favoritos | `GET /api/emprendimientos/{id}`<br>`POST /api/emprendimientos/{id}/resenas` | Sin persistencia de pedidos | Media |
| **Panel de Gestión** | `pages/Panel.jsx` | ✅ Sí | ✅ Fallback | `PATCH /api/emprendimientos/{id}`<br>CRUD `/api/emprendimientos/{id}/productos` | Sin verificación de token de vendedor | **Alta** |
| **Perfil Estudiante** | `pages/Perfil.jsx` | ⚠️ Solo al crear puesto | ✅ 100% | Opcional `POST /api/emprendimientos` | Sin entidad `Usuario` en base de datos | **Alta** |
| **Nuevo Puesto** | `pages/NuevoEmprendimiento.jsx` | ✅ Sí | ✅ Copia local | `POST /api/emprendimientos` | Puesto no enlazado a tabla de usuarios | Media |
| **Login / Registro** | `pages/Login.jsx` | ❌ No | ✅ Simulación | Ninguno | Falta controlador de autenticación REST | **Alta** |
| **Configuración** | `pages/Configuracion.jsx` | ❌ No | ✅ Preferencias | Ninguno | Preferencias locales del navegador | Baja |

---

## 4. Tarjetas de Trabajo Sugeridas para Trello (Sprint 2)

Con base en la auditoría realizada, se proponen las siguientes tarjetas para ser agregadas y priorizadas en el Product Backlog de Trello:

| ID | Título de la Tarjeta | Módulo | Prioridad | Estimación (Pts) | Criterio de Éxito Principal |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **SP2-01** | Implementar entidad `Usuario` y repositorio en Spring Boot | Backend | **Alta** | 5 | Modelo JPA para estudiante con código UTP, correo, contraseña cifrada (BCrypt) y rol. |
| **SP2-02** | Desarrollar endpoints de autenticación `/api/auth/login` y `/registro` | Backend | **Alta** | 5 | API responde token/sesión y valida dominio institucional `@utp.edu.pe`. |
| **SP2-03** | Conectar pantalla de Login y Registro del frontend con API de Auth | Frontend | **Alta** | 3 | Reemplazar simulación de `Login.jsx` por llamadas HTTP a `/api/auth/login`. |
| **SP2-04** | Vincular `Emprendimiento` a un `Usuario` propietario (FK relacional) | Backend | **Alta** | 3 | Foreign Key `usuario_id` en tabla `emprendimientos` para restringir edición solo al dueño. |
| **SP2-05** | Agregar endpoint de perfil de usuario `GET/PUT /api/usuarios/me` | Backend | Media | 3 | Permite actualizar biografía, redes sociales y foto de perfil en la base de datos. |
| **SP2-06** | Sincronizar pantalla de Perfil con el nuevo endpoint de usuario | Frontend | Media | 2 | `Perfil.jsx` carga y guarda datos reales del estudiante desde la API REST. |
| **SP2-07** | Incorporar filtros por Torre y Piso en consultas Specification de Spring Data | Backend | Baja | 2 | Parámetros `?torre=&piso=` en `GET /api/emprendimientos` para reducir carga en el cliente. |
| **SP2-08** | Implementar registro de pedidos locales para historial del vendedor | Fullstack | Baja | 5 | Tabla `pedidos` para consultar métricas de ventas antes de derivar a WhatsApp. |
