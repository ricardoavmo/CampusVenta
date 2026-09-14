# CampusVenta – Plataforma Web para Gestión y Visibilidad de Emprendimientos Estudiantiles
Una solución integral para la geolocalización interna, catálogo en vivo y coordinación de compras entre estudiantes de la Universidad Tecnológica del Perú (UTP Sede Piura).

![Java](https://img.shields.io/badge/Java%2017-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot%203.3-6DB33F?style=flat&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React%2018-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite%205-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=flat&logo=apachemaven&logoColor=white)
![JUnit 5](https://img.shields.io/badge/JUnit%205-25A162?style=flat&logo=junit5&logoColor=white)
![Mockito](https://img.shields.io/badge/Mockito-78A731?style=flat&logo=mockito&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=postman&logoColor=white)
![Meld](https://img.shields.io/badge/Meld-Merge%20Tool-0055A5?style=flat&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)
![UTP Piura](https://img.shields.io/badge/UTP-Sede%20Piura-A6192E?style=flat)

---

## 📌 Descripción del Proyecto
En la comunidad universitaria de la **UTP Sede Piura**, numerosos estudiantes impulsan emprendimientos independientes (postres, repostería casera, almuerzos, accesorios y asesorías académicas) para solventar sus gastos y estudios superiores. Sin embargo, este ecosistema comercial opera de manera informal y desorganizada mediante grupos masivos de WhatsApp, provocando incertidumbre sobre la disponibilidad real del vendedor, stock del momento y su ubicación exacta dentro del campus durante los recesos.

**CampusVenta** nace para digitalizar y centralizar este ecosistema. En esta primera fase (**Avance de Proyecto Final 1 - APF1**), se ha desarrollado una solución integral compuesta por una **API REST desacoplada en Spring Boot** y una **Single Page Application (SPA) en React con Tailwind CSS**, permitiendo ubicar en tiempo real a los emprendedores por torre y piso, explorar sus productos y agilizar el contacto directo sin cobro de comisiones.

---

## 🎯 Alcance de esta fase (APF1)
- **SÍ INCLUYE:**
  - Desarrollo del backend con API REST en Java 17 y Spring Boot 3.3.
  - Persistencia de datos relacionales en PostgreSQL mediante Spring Data JPA y Hibernate.
  - Frontend moderno y responsivo con React 18, Vite y Tailwind CSS adaptado a la identidad visual de UTP.
  - Marketplace en vivo con carrusel infinito, buscador predictivo y filtros combinados por categoría y ubicación física (Torre A, Torre B, Biblioteca, Canchas).
  - Ficha detallada por emprendimiento con catálogo de productos, calculadora de pedidos por WhatsApp y reseñas públicas con cálculo dinámico de calificación.
  - Pruebas unitarias de controladores y repositorio aplicando JUnit 5 y Mockito.
  - Control de versiones bajo metodología Git Flow con integración en GitHub y resolución visual de conflictos de 3 vías con Meld.
- **NO INCLUYE (Intencional para futuras fases):**
  - Pasarela de pagos bancarios en línea (las transacciones son presenciales o vía billetera digital Yape/Plin sin intermediarios).
  - Geolocalización satelital por GPS (la ubicación se gestiona por señalética universitaria interna: torres y pisos).
  - Autenticación OAuth2 / JWT con correo institucional (previsto para la fase de administración de cuentas estudiantiles).

---

## ⚡ Funcionalidades Implementadas
- **Directorio de Emprendimientos en Vivo:** Consulta general de puestos con indicación visual inmediata de estado (🟢 Activo ahora / ⚪ No disponible).
- **Filtros Multicriterio:** Búsqueda en tiempo real por texto predictivo, categoría (`POSTRES`, `COMIDA`, `ACCESORIOS`, `SERVICIOS`, `TECNOLOGIA`) y zona del campus (Torre A - 10 pisos, Torre B - 7 pisos, etc.).
- **Ficha y Catálogo de Productos:** Visualización de artículos con precios unitarios, descripción y disponibilidad.
- **Generador de Pedido a WhatsApp:** Botón automatizado que consolida el pedido seleccionado y abre el chat oficial del estudiante vendedor con el mensaje preformateado.
- **Sistema de Calificaciones y Reseñas:** Registro de valoraciones del 1 al 5 estrellas con recálculo automático de la calificación promedio del puesto.
- **Endpoints Especializados:** Consultas de alto rendimiento para el carrusel de puestos activos (`/activos`) y el ranking de mejores valorados (`/top`).
- **Manejo Global de Excepciones:** Control centralizado con `@RestControllerAdvice` retornando respuestas estructuradas y códigos HTTP estándar (400, 404, 500).

---

## 🏗️ Estructura del Proyecto

```text
📁 CampusVenta/
├── 📁 backend/                                 # API REST Spring Boot (Java 17)
│   ├── 📁 src/main/java/pe/edu/utp/campusventa/
│   │   ├── 📁 config/                          # DataInitializer y configuración CORS
│   │   ├── 📁 controller/                      # Controladores REST expuestos
│   │   │   └── EmprendimientoController.java
│   │   ├── 📁 dto/                             # Data Transfer Objects (ResenaCreateDTO)
│   │   ├── 📁 exception/                       # Manejo global de excepciones
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── 📁 model/                           # Entidades JPA y Enums de dominio
│   │   │   ├── Emprendimiento.java
│   │   │   ├── Producto.java
│   │   │   ├── Resena.java
│   │   │   └── Categoria.java
│   │   └── 📁 repository/                     # Interfaces Spring Data JPA
│   │       ├── EmprendimientoRepository.java
│   │       └── ResenaRepository.java
│   ├── 📁 src/main/resources/
│   │   └── application.properties             # Conexión a PostgreSQL y logging
│   └── 📁 src/test/java/                       # Pruebas unitarias con JUnit 5 y Mockito
│       └── EmprendimientoControllerTest.java
│
├── 📁 frontend/                                # Cliente Web SPA (React 18 + Vite)
│   ├── 📁 src/
│   │   ├── 📁 pages/
│   │   │   ├── Home.jsx                        # Marketplace en vivo, carrusel y filtros
│   │   │   └── Ficha.jsx                       # Detalle de tienda, productos y reseñas
│   │   ├── 📁 services/
│   │   │   └── api.js                          # Cliente HTTP centralizado (Axios)
│   │   ├── App.jsx                             # Configuración de rutas (React Router)
│   │   └── index.css                           # Directivas de Tailwind y diseño
│   ├── tailwind.config.js                      # Paleta institucional UTP (#A6192E) y brutalismo
│   └── package.json                            # Dependencias y scripts de construcción
│
└── 📄 README.md                                # Documentación general del repositorio
```

---

## 📊 Modelo de Datos

El sistema se compone de 4 entidades y tipos principales relacionados:

* **`Emprendimiento`**: Núcleo del puesto del estudiante. Contiene nombre comercial, descripción, categoría, estado de presencia en campus (`disponible`), ubicación física (torre y piso), contacto telefónico (WhatsApp) y calificación promedio calculada (`calificacionPromedio`). Posee relaciones `1:N` con sus productos y reseñas.
* **`Producto`**: Artículos individuales ofertados por cada puesto (nombre, descripción, precio unitario, disponibilidad y URL de imagen).
* **`Resena`**: Retroalimentación y comentarios emitidos por los compradores del campus con puntuación obligatoria de 1 a 5 estrellas y fecha de registro.
* **`Categoria`**: Enumeración que clasifica el rubro de atención: `POSTRES`, `COMIDA`, `ACCESORIOS`, `SERVICIOS`, `TECNOLOGIA`.

---

## 🔌 Endpoints Principales de la API REST

| Método | URL | Parámetros / Body | Descripción |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/emprendimientos` | `?categoria=&disponible=&search=` | Listar todos los emprendimientos con filtros opcionales |
| `GET` | `/api/emprendimientos/{id}` | `id` (Path variable) | Obtener información completa de un puesto (incluye productos y reseñas) |
| `POST` | `/api/emprendimientos` | JSON `Emprendimiento` | Registrar un nuevo emprendimiento estudiantil |
| `GET` | `/api/emprendimientos/activos` | — | Listar únicamente puestos con disponibilidad activa en campus |
| `GET` | `/api/emprendimientos/top` | — | Listar los emprendimientos con mejores calificaciones |
| `POST` | `/api/emprendimientos/{id}/resenas` | JSON `ResenaCreateDTO` | Registrar una nueva reseña y recalcular la calificación promedio |

*(Para inspeccionar y probar los endpoints de forma interactiva, se puede utilizar la colección de pruebas en Postman).*

---

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos
- **Java JDK 17** o superior.
- **Node.js 18+** y gestor de paquetes `npm`.
- Servidor **PostgreSQL** en ejecución en el puerto `5432` con la base de datos `campusventa_db` creada.

### 1. Iniciar el Backend (Spring Boot)
1. Abrir una terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Iniciar el servidor mediante el Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(En Windows PowerShell: `.\mvnw.cmd spring-boot:run`)*.
3. La API iniciará en `http://localhost:8080`. Se ejecutarán automáticamente los datos de prueba iniciales mediante `DataInitializer`.

### 2. Iniciar el Frontend (React + Vite)
1. Abrir otra terminal en la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instalar dependencias (solo la primera ejecución):
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador: `http://localhost:5173`.

---

## 🧪 Cómo Correr las Pruebas

El backend ha sido probado unitariamente utilizando **JUnit 5** y **Mockito** con **MockMvc**, aislando la capa web para verificar el retorno de códigos HTTP correctos, serialización de DTOs y validaciones de entrada:

```bash
cd backend
./mvnw test
```

---

## 🛠️ Herramientas Usadas en el Desarrollo

- **Git & GitHub**: Control de versiones distribuido bajo modelo Git Flow con repositorio remoto colaborativo.
- **Meld**: Herramienta visual de resolución de conflictos de código de 3 vías (`git mergetool`).
- **Postman**: Validación, diseño de payloads JSON y pruebas funcionales de los endpoints de la API REST.
- **Visual Studio Code / Antigravity IDE**: Entorno de desarrollo integrado con soporte para Java, React y extensiones de depuración.
- **Vite**: Empaquetador web ultrarrápido con Hot Module Replacement (HMR).

---

## 👥 Equipo de Trabajo (CampusVenta - UTP Piura)

| Integrante | Código UTP | Rol en el Proyecto |
| :--- | :---: | :--- |
| **Paola Elvira Mijahuanga Pingo** | U23227640 | Gerente General / Fundadora – Planificación estratégica y viabilidad |
| **Angel Junior Ancajima Juarez** | U23231284 | Tech Lead – Arquitectura de software y supervisión de código |
| **Toom Josue Vilela Carmen** | U23233736 | Frontend Lead – Desarrollo de interfaces React, Vite y diseño visual |
| **Ricardo Emanuel Avila Montalban** | U23247043 | Backend Lead – Desarrollo de API REST Spring Boot, JPA y Git Flow |
| **Kelvin Amaro Cienfuegos Morales** | U25209649 | QA / Testing – Pruebas unitarias, funcionales y aseguramiento de calidad |

---

*Proyecto desarrollado para la asignatura de **Herramientas de Desarrollo** · Universidad Tecnológica del Perú (UTP) · Sede Piura · Ciclo 2026.*
