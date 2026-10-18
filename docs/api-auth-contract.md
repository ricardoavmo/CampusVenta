# Contrato de API REST: Módulo de Autenticación y Cuentas de Usuario

> [!IMPORTANT]
> **Documento de Especificación Técnica (Sin código implementado en Sprint 1):**  
> Este documento define el contrato formal entre el equipo de Frontend (Toom) y Backend (Ricardo) para la implementación de la autenticación de usuarios en el **Sprint 2**. Permite desbloquear el diseño de interfaces y mockups sin alterar el código de negocio del Sprint 1.

---

## 1. Reglas de Validación de Negocio
1. **Dominio de Correo Obligatorio:** Todo registro debe utilizar estrictamente una dirección institucional que termine en `@utp.edu.pe`. Cualquier otro dominio (`@gmail.com`, `@outlook.com`) será rechazado con error `400 Bad Request`.
2. **Código de Estudiante:** Debe tener formato UTP (Letra `U` seguida de 8 dígitos numéricos, ej. `U23227640`).
3. **Contraseña:** Mínimo 6 caracteres. Se almacenará en la base de datos cifrada con algoritmo **BCrypt**.
4. **Roles Disponibles:**
   - `COMPRADOR`: Estudiante que explora el marketplace, califica puestos y envía pedidos a WhatsApp.
   - `VENDEDOR`: Estudiante con derecho a crear y administrar puestos, stock de productos y ubicación en vivo.

---

## 2. Especificación de Endpoints

### 2.1 Registro de Estudiante
Permite a un nuevo alumno de la UTP crear su cuenta en CampusVenta.

- **Método:** `POST`
- **Ruta:** `/api/auth/registro`
- **Cabeceras:** `Content-Type: application/json`

#### Request Body:
```json
{
  "nombre": "Valeria Mendoza",
  "email": "u20210045@utp.edu.pe",
  "codigo": "U20210045",
  "password": "Password123!",
  "rol": "VENDEDOR",
  "carrera": "Ingeniería de Sistemas",
  "ciclo": "6to Ciclo",
  "telefono": "972341311"
}
```

#### Respuesta Exitosa (`201 Created`):
```json
{
  "mensaje": "Estudiante registrado exitosamente",
  "usuario": {
    "id": 1,
    "nombre": "Valeria Mendoza",
    "email": "u20210045@utp.edu.pe",
    "codigo": "U20210045",
    "rol": "VENDEDOR",
    "carrera": "Ingeniería de Sistemas",
    "ciclo": "6to Ciclo",
    "telefono": "972341311",
    "avatar": null,
    "fechaCreacion": "2026-10-18T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sIjoiVkVOREVET1IiLCJlbWFpbCI6InUyMDIxMDA0NUB1dHAuZWR1LnBlIn0..."
}
```

#### Errores Posibles:
- **`400 Bad Request` (Dominio no permitido):**
  ```json
  {
    "timestamp": "2026-10-18T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Solo se permiten correos institucionales de la Universidad Tecnológica del Perú (@utp.edu.pe)",
    "path": "/api/auth/registro"
  }
  ```
- **`409 Conflict` (Usuario ya existente):**
  ```json
  {
    "timestamp": "2026-10-18T10:30:00Z",
    "status": 409,
    "error": "Conflict",
    "message": "El correo electrónico o código de estudiante ya se encuentra registrado",
    "path": "/api/auth/registro"
  }
  ```

---

### 2.2 Inicio de Sesión (Login)
Permite a un estudiante autenticarse mediante su correo o código y su contraseña.

- **Método:** `POST`
- **Ruta:** `/api/auth/login`
- **Cabeceras:** `Content-Type: application/json`

#### Request Body:
```json
{
  "identificador": "u20210045@utp.edu.pe",
  "password": "Password123!"
}
```
*(Nota: El campo `identificador` acepta tanto el correo completo como el código de estudiante `U20210045`).*

#### Respuesta Exitosa (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipoToken": "Bearer",
  "usuario": {
    "id": 1,
    "nombre": "Valeria Mendoza",
    "email": "u20210045@utp.edu.pe",
    "codigo": "U20210045",
    "rol": "VENDEDOR",
    "carrera": "Ingeniería de Sistemas",
    "ciclo": "6to Ciclo",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    "emprendimientoId": 1
  }
}
```

#### Errores Posibles:
- **`401 Unauthorized` (Credenciales inválidas):**
  ```json
  {
    "timestamp": "2026-10-18T10:30:00Z",
    "status": 401,
    "error": "Unauthorized",
    "message": "Credenciales inválidas. Verifica tu correo y contraseña institucional.",
    "path": "/api/auth/login"
  }
  ```

---

### 2.3 Perfil del Usuario Autenticado (Me)
Permite a la aplicación web recuperar la información del usuario a partir del token JWT guardado en sesión.

- **Método:** `GET`
- **Ruta:** `/api/auth/me`
- **Cabeceras:**
  - `Accept: application/json`
  - `Authorization: Bearer <TOKEN_JWT>`

#### Respuesta Exitosa (`200 OK`):
```json
{
  "id": 1,
  "nombre": "Valeria Mendoza",
  "email": "u20210045@utp.edu.pe",
  "codigo": "U20210045",
  "rol": "VENDEDOR",
  "carrera": "Ingeniería de Sistemas",
  "ciclo": "6to Ciclo",
  "telefono": "972341311",
  "bio": "Estudiante de 6to ciclo. Venta de postres caseros en Torre A durante recesos.",
  "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "emprendimientoId": 1,
  "redesSociales": [
    { "id": "1", "plataforma": "whatsapp", "handle": "972341311", "visible": true },
    { "id": "2", "plataforma": "instagram", "handle": "valeria_bakes", "visible": true }
  ]
}
```

#### Errores Posibles:
- **`401 Unauthorized`:** Token expirado o no enviado en la cabecera `Authorization`.

---

### 2.4 Cierre de Sesión (Logout)
Invalida la sesión activa del usuario.

- **Método:** `POST`
- **Ruta:** `/api/auth/logout`
- **Cabeceras:** `Authorization: Bearer <TOKEN_JWT>`

#### Respuesta Exitosa (`200 OK`):
```json
{
  "mensaje": "Sesión cerrada correctamente"
}
```

---

## 3. Plan de Integración Técnica en el Frontend (Sprint 2)
1. **Configurar interceptor de Axios:** En `frontend/src/services/api.js`, inyectar automáticamente la cabecera `Authorization: Bearer ${token}` cuando exista sesión en `localStorage`.
2. **Reemplazar `DEMO_USERS` en `AuthContext`:** Consumir `/api/auth/login` y almacenar el token devuelto.
3. **Manejo de expiración (401):** Si cualquier petición responde con error 401, limpiar el almacenamiento local y redirigir al usuario automáticamente a la pantalla de `/login`.
