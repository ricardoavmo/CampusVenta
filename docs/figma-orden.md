# Guía y Checklist de Organización de Figma – CampusVenta

Este documento establece la estructura estándar, convenciones de nomenclatura, paleta cromática oficial y tipografías para mantener ordenado y estandarizado el archivo de diseño en **Figma** del proyecto **CampusVenta**.

---

## 🔗 Enlace al Archivo Oficial en Figma
> [!NOTE]
> **TODO: Pegar aquí el enlace oficial del archivo de Figma:**  
> `[https://www.figma.com/design/.../CampusVenta-UTP-Piura]` *(Pendiente de vinculación por el equipo de diseño).*

---

## 1. Estructura de Páginas del Archivo (Por Flujo)

Para evitar la saturación visual en un único lienzo (*canvas*), el archivo de Figma debe dividirse en las siguientes **6 páginas** bien definidas:

```text
📁 Archivo Figma: CampusVenta - Marketplace Estudiantil UTP
├── 1. 📌 Portada & Info del Proyecto
├── 2. 🎨 Design System & UI Kit
├── 3. 🛍️ Flujo 1: Comprador (Marketplace, Búsqueda, Ficha)
├── 4. 💼 Flujo 2: Vendedor (Panel de Control, Catálogo, Estado)
├── 5. 🔐 Flujo 3: Autenticación & Perfil de Estudiante
└── 6. 🖼️ Referencias & Mockups Históricos
```

### Contenido esperado por página:
1. **`1. 📌 Portada & Info del Proyecto`:**
   - Thumbnail oficial del proyecto para la vista previa en el dashboard de Figma.
   - Datos del equipo (integrantes, roles y asignatura).
   - Notas de versión del sprint y mapa del sitio.
2. **`2. 🎨 Design System & UI Kit`:**
   - Muestrario de estilos de color locales (Color Styles) con tokens institucionales.
   - Escala tipográfica (Text Styles) para Headings y Body.
   - Componentes maestros con variantes (*Auto-layout* activado): Botones, Inputs, Chips/Pills de filtros, Cards de puesto, Cards de producto y Modales.
3. **`3. 🛍️ Flujo 1: Comprador`:**
   - Pantalla de inicio / Marketplace en vivo.
   - Estados de búsqueda (vacía, con resultados, sin coincidencias).
   - Ficha detallada de la tienda con modal de producto y calculadora para WhatsApp.
4. **`4. 💼 Flujo 2: Vendedor`:**
   - Panel de administración de puesto en campus.
   - Modal de alta y edición de producto con zona de subida de foto local.
   - Modal de configuración de tienda (ubicación por torre/piso y disponibilidad).
5. **`5. 🔐 Flujo 3: Autenticación & Perfil`:**
   - Pantalla de inicio de sesión con validación de correo `@utp.edu.pe`.
   - Formulario de registro de estudiante.
   - Pantalla de perfil con avatar editable y canales de contacto.
6. **`6. 🖼️ Referencias & Mockups Históricos`:**
   - Diseños de referencia, benchmarking de interfaces de mockups previos y capturas de inspiración.

---

## 2. Convención de Nomenclatura de Frames y Componentes

Para facilitar la navegación en el panel de capas y la inspección para los desarrolladores, todo frame debe seguir la siguiente convención:

**Sintaxis:**
```text
[Dispositivo] / [Módulo] / [Pantalla] / [Estado o Variante]
```

### Ejemplos Válidos:
- `Móvil / Marketplace / Home / Default`
- `Móvil / Marketplace / Home / Filtro Activo (Torre A - Piso 4)`
- `Móvil / Ficha / Detalle Puesto / Modal Carrito Abierto`
- `Escritorio / Panel / Gestión Productos / Modal Nuevo Producto`
- `Escritorio / Perfil / Vista Pública / Modo Oscuro OLED`

### Nomenclatura de Componentes:
- `Button / Primary / Default`, `Button / Primary / Hover`, `Button / Primary / Disabled`
- `Badge / Estado / Activo (Verde)`, `Badge / Estado / Cerrado (Gris)`
- `Input / Text / Default`, `Input / Text / Focus`, `Input / Text / Error`

---

## 3. Tokens de Color Oficiales (Extraídos de `tailwind.config.js` y `desing.md`)

Todos los colores deben crearse como **Color Styles** en Figma con los siguientes valores hexadecimales exactos:

| Token Figma / Tailwind | Hexadecimal | Muestra | Uso en la Interfaz |
| :--- | :---: | :---: | :--- |
| **`Primary / UTP Crimson`** | `#A6192E` | 🔴 | Color institucional principal UTP: botones primarios de acción, acentos y marcas. |
| **`Primary / Crimson Hover`** | `#870E20` | 🍷 | Estado hover y active de botones de alta prioridad. |
| **`Primary / Container`** | `#FDF2F4` | 🌸 | Fondos suaves de badges y alertas informativas prioritarias. |
| **`Secondary / Slate`** | `#334155` | 🌑 | Textos de encabezados secundarios, subtítulos y badges neutros. |
| **`Secondary / Slate Hover`** | `#1E293B` | 🪨 | Fondos de tarjetas en modo oscuro y superficies secundarias. |
| **`Accent / Teal`** | `#0F766E` | 🌲 | Indicador de disponibilidad positiva, éxito y entrega rápida. |
| **`Rating / Amber`** | `#D97706` | ⭐ | Estrellas de calificación y reseñas destacadas. |
| **`Text / Main`** | `#0F172A` | ⬛ | Tipografía principal de lectura de alto contraste. |
| **`Text / Secondary`** | `#475569` | 🔘 | Descripciones, detalles de ubicación y referencias de pisos. |
| **`Text / Muted`** | `#94A3B8` | ▫️ | Textos deshabilitados, placeholders y leyendas de tiempo. |
| **`Surface / Background`** | `#F8FAFC` | 📄 | Fondo general de la aplicación en modo claro. |
| **`Dark / OLED Background`** | `#000000` | 🖤 | Fondo negro profundo para pantallas OLED en modo oscuro. |

---

## 4. Tipografías Oficiales del Proyecto

| Rol Tipográfico | Familia Tipográfica | Fuente de Google Fonts | Pesos Utilizados |
| :--- | :--- | :--- | :--- |
| **Títulos y Encabezados** | **Outfit** | [Google Fonts - Outfit](https://fonts.google.com/specimen/Outfit) | `SemiBold (600)`, `Bold (700)`, `ExtraBold (800)` |
| **Cuerpo de Texto y Datos** | **Plus Jakarta Sans** | [Google Fonts - Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | `Regular (400)`, `Medium (500)`, `SemiBold (600)` |

---

## 5. Checklist de Verificación de Calidad en Figma

Antes de dar por cerrado el archivo de diseño en cada sprint, el equipo de diseño y frontend debe verificar:

- [ ] **Páginas organizadas:** El archivo contiene exactamente las 6 páginas por flujo descritas en esta guía.
- [ ] **Frames etiquetados:** No existen frames con nombres por defecto (`Frame 142`, `Group 52`). Todos usan la convención `[Dispositivo] / [Módulo] / ...`.
- [ ] **Auto-layout implementado:** Todos los componentes, barras de navegación y tarjetas usan Auto-layout para responder a cambios de contenido y pantallas responsivas.
- [ ] **Variables y estilos aplicados:** No se utilizan colores hexadecimales "sueltos"; todos están vinculados a los estilos locales de color del Design System.
- [ ] **Prototipo interactivo básico:** Las transiciones clave entre el catálogo y la ficha del puesto cuentan con conexiones interactivas (*On click -> Navigate to*).
- [ ] **Enlace registrado:** La URL pública con permiso de visualización está pegada en el apartado superior de este documento y en el README.
