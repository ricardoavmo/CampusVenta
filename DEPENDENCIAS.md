# Stack Tecnológico, Frameworks y Dependencias – CampusVenta

Documento técnico descriptivo de los componentes, frameworks, librerías y dependencias utilizadas en los diferentes módulos del proyecto **CampusVenta**.

---

## 🏛️ Arquitectura General

```text
┌────────────────────────┐
│ PostgreSQL 15+ (DB)    │
└───────────▲────────────┘
            │ JDBC / Spring Data JPA (Hibernate)
┌───────────┴────────────────────────┐
│ Backend API REST                   │
│ Spring Boot 3.4.3 | Java 21 (LTS)  │
└───────────▲────────────────────────┘
            │ HTTP / JSON REST
┌───────────┴────────────────────────┐       ┌────────────────────────┐
│ Frontend Web SPA                   │       │ Landing Informativa    │
│ React 18 | Vite 5 | Tailwind CSS   │       │ Astro 7                │
└────────────────────────────────────┘       └────────────────────────┘
```

---

## 1. Backend (`/backend` – API REST)

Ubicación del archivo de configuración: [`backend/pom.xml`](backend/pom.xml)  
**Entorno de ejecución**: Java 21 (LTS)  
**Framework base**: Spring Boot 3.4.3 (Maven)

| Dependencia / Framework | Identificador Maven | Categoría | Propósito y Función |
| :--- | :--- | :--- | :--- |
| **Spring Boot Starter Web** | `org.springframework.boot:spring-boot-starter-web` | Framework Web / API | Provee la infraestructura para construir servicios REST. Integra el servidor web embebido **Apache Tomcat**, el mapeador de rutas y controladores (`@RestController`, `@RequestMapping`), y **Jackson** para la serialización y deserialización automática bidireccional de JSON a objetos Java. |
| **Spring Data JPA** | `org.springframework.boot:spring-boot-starter-data-jpa` | Persistencia / ORM | Abstracción de acceso a datos que utiliza **Hibernate** como motor ORM. Mapea las clases de entidad (`Emprendimiento`, `Producto`, `Resena`) a tablas relacionales y proporciona interfaces como `JpaRepository` y `JpaSpecificationExecutor` para consultas tipadas y filtros dinámicos. |
| **Spring Boot Starter Validation** | `org.springframework.boot:spring-boot-starter-validation` | Validación | Implementa la especificación **Jakarta Bean Validation** con Hibernate Validator. Permite validar los datos entrantes del cliente mediante anotaciones declarativas (`@NotBlank`, `@NotNull`, `@Min`, `@Size`, `@Pattern`) en controladores y DTOs. |
| **PostgreSQL JDBC Driver** | `org.postgresql:postgresql` | Conectividad BD | Controlador JDBC oficial que permite la comunicación y el envío de consultas SQL de Hibernate al motor de base de datos **PostgreSQL**. Configurado con alcance `runtime`. |
| **Project Lombok** | `org.projectlombok:lombok` | Productividad / Herramienta | Procesador de anotaciones en tiempo de compilación. Genera automáticamente código repetitivo (*boilerplate*) como constructores (`@AllArgsConstructor`, `@NoArgsConstructor`), métodos de acceso (`@Getter`, `@Setter`), `equals`, `hashCode` y el patrón de diseño `@Builder`. |
| **Spring Boot Starter Test** | `org.springframework.boot:spring-boot-starter-test` | Calidad y Pruebas | Conjunto integral de herramientas de testing: <br>• **JUnit 5 (Jupiter)**: Motor principal de ejecución de pruebas unitarias y de integración.<br>• **Mockito**: Creación de dobles de prueba (*mocks*) e inyección simulada de repositorios (`@MockBean`).<br>• **MockMvc**: Ejecución de pruebas HTTP aisladas sobre los controladores REST sin levantar el servidor web completo.<br>• **Hamcrest / AssertJ**: Aserciones expresivas y legibles. |
| **Spring Boot Maven Plugin** | `org.springframework.boot:spring-boot-maven-plugin` | Empaquetado y Build | Facilita la ejecución en desarrollo mediante `./mvnw spring-boot:run` y compila la aplicación en un paquete ejecutable autónomo (*fat JAR*) que incluye todas las dependencias y el servidor embebido. |

---

## 2. Frontend Principal (`/frontend` – Aplicación Web SPA)

Ubicación del archivo de configuración: [`frontend/package.json`](frontend/package.json)  
**Tecnología base**: React 18 + Vite 5

### 2.1 Dependencias de Producción (`dependencies`)

| Librería | Versión | Tipo | Propósito y Función |
| :--- | :--- | :--- | :--- |
| **React** | `^18.3.1` | Core UI | Biblioteca fundamental para la construcción de interfaces de usuario basadas en componentes reutilizables, ciclo de vida y gestión reactiva de estado (`useState`, `useEffect`, `useMemo`). |
| **React DOM** | `^18.3.1` | Renderizado | Módulo de enlace entre el modelo de componentes de React y el DOM del navegador web. |
| **React Router DOM** | `^6.26.2` | Enrutamiento SPA | Gestor de navegación declarativa del lado del cliente. Permite navegar entre rutas (ej: `/` para el Marketplace/Catálogo principal y `/:id` para la Ficha del puesto) de forma fluida y sin recargas de página. |
| **Axios** | `^1.7.7` | Cliente HTTP | Cliente basado en promesas para realizar peticiones asíncronas (`GET`, `POST`) a la API REST de Spring Boot (`http://localhost:8080/api/...`), con soporte para interceptores, manejo de cabeceras y control estructurado de errores. |

### 2.2 Dependencias de Desarrollo (`devDependencies`)

| Herramienta | Versión | Tipo | Propósito y Función |
| :--- | :--- | :--- | :--- |
| **Vite** | `^5.4.6` | Bundler & DevServer | Entorno de desarrollo ultrarrápido basado en ES Modules nativos con *Hot Module Replacement (HMR)* instantáneo y generador de compilación para producción basado en Rollup. |
| **@vitejs/plugin-react** | `^4.3.1` | Plugin de Vite | Plugin oficial que habilita soporte para sintaxis JSX/TSX y recarga en caliente (*Fast Refresh*) de componentes React. |
| **Tailwind CSS** | `^3.4.11` | Framework CSS | Framework de diseño basado en clases utilitarias de bajo nivel. Utilizado para construir la interfaz moderna, responsiva y adaptable a la paleta institucional de la UTP (`#A6192E`). |
| **PostCSS** | `^8.4.47` | Procesador CSS | Herramienta de transformación de hojas de estilo que interpreta las reglas y directivas de Tailwind CSS. |
| **Autoprefixer** | `^10.4.20` | Post-procesador | Plugin de PostCSS que añade automáticamente prefijos propietarios de proveedores (`-webkit-`, `-moz-`) a las reglas CSS para garantizar compatibilidad entre diversos navegadores. |
| **Vite Plugin PWA** | `^1.3.0` | PWA / Offline | Genera el manifiesto web (`manifest.json`) y configura Service Workers mediante Workbox, permitiendo que la aplicación web pueda ser instalada en dispositivos móviles como Progressive Web App. |

---

## 3. Landing Informativa (`/landing/ventaCampus/landing`)

Ubicación del archivo de configuración: [`landing/ventaCampus/landing/package.json`](landing/ventaCampus/landing/package.json)  
**Tecnología base**: Astro 7

| Framework | Versión | Propósito y Función |
| :--- | :--- | :--- |
| **Astro** | `^7.3.2` | Framework web orientado a generación de sitios estáticos (SSG) de ultra alto rendimiento bajo arquitectura de islas (*Islands Architecture*). Se utiliza para la página informativa y comercial de presentación del proyecto con carga de JavaScript prácticamente nula en el cliente. |

---

## 4. Resumen por Rol en el Ecosistema

- **Persistencia**: PostgreSQL + Spring Data JPA (Hibernate).
- **Lógica de Negocio & Servicios REST**: Spring Boot 3.4.3 (Java 21 LTS).
- **Validaciones & Seguridad de Entrada**: Jakarta Bean Validation.
- **Frontend Interactivo**: React 18 + React Router 6.
- **Estilos & Diseño Responsivo**: Tailwind CSS + PostCSS + Autoprefixer.
- **Consumo de Servicios**: Axios.
- **Testing**: JUnit 5 + Mockito + MockMvc.
- **Landing Comercial**: Astro.
