- **Screen Margins:** Móvil: `16px` (mínimo) a `20px`. Web/Tablet: Centrado max-width `1200px`.
- **Border Radius:**
  - Botones y Badges (`sm`): `8px`
  - Tarjetas de Restaurante / Producto (`md`): `16px`
  - Bottom Sheets y Modales (`lg`): `24px 24px 0 0`
  - Pills / Chips (`full`): `9999px`

---

## 5. Elevaciones y Sombras (Shadows)

Las sombras deben ser suaves, difusas y con tinte ligeramente cálido/neutro, evitando sombras negras duras.

- **`shadow-sm` (Cards de producto estándar):**
  `0px 2px 8px rgba(22, 24, 29, 0.04), 0px 1px 2px rgba(22, 24, 29, 0.02)`
- **`shadow-md` (Barra de búsqueda sticky, Floating Cart preview):**
  `0px 8px 24px rgba(22, 24, 29, 0.08), 0px 2px 6px rgba(22, 24, 29, 0.04)`
- **`shadow-lg` (Bottom Sheet flotante, Sticky Checkout Button):**
  `0px -4px 20px rgba(0, 0, 0, 0.06)`
- **`shadow-primary` (Branded Glow en botón CTA activo):**
  `0px 6px 18px rgba(255, 68, 31, 0.35)`

---

## 6. Reglas de Diseño de Componentes Clave

### 6.1 Tarjeta de Restaurante / Comercio (Merchant Card)
1. **Aspect Ratio de Portada:** `16:9` o `3:2`, con bordes redondeados superiores de `16px`.
2. **Badge Flotante de ETA y Distancia:** Ubicado en la esquina inferior izquierda de la imagen con fondo semitransparente oscuro o sólido blanco: `⏱ 20-30 min • 1.2 km`.
3. **Badge de Descuento:** Esquina superior izquierda con color primario `#FF441F` o `#00C1B2` para envío gratis.
4. **Calificación:** Número destacado en semibold + ícono de estrella amarilla `#FFB800` a la derecha del título.

### 6.2 Tarjeta de Producto (Food Item Card)
- **Diseño Horizontal en Lista:**
  - Lado Izquierdo: Nombre del plato (max 2 líneas, ellipsis), descripción corta gris, precio en negrita grande (`$ 24.90`), precio anterior tachado si aplica.
  - Lado Derecho: Imagen cuadrada (`88x88px` o `96x96px`) con botón flotante circular de adición rápida `+` superpuesto en la esquina inferior derecha.
- **Micro-interacción de Carrito:**
  - Al pulsar `+`, el botón se expande inmediatamente a un contador horizontal `[-] [ 1 ] [+]` sin recargar la página.

### 6.3 Botón de Checkout Flotante (Sticky Bottom Bar)
- **Comportamiento:** Siempre anclado al fondo en la vista del comercio o carrito.
- **Estructura en dos columnas:**
  - Izquierda: Conteo de ítems en círculo blanco + Total a pagar (`3 ítems | $ 48.50`).
  - Derecha: Etiqueta de acción ("Ver Carrito" o "Ir a Pagar" con flecha derecha `→`).
- **Feedback:** Animación hápica (vibración sutil) al cambiar de valor.

### 6.4 Vista de Rastreo en Vivo (Live Tracking View)
- **Top 50% de Pantalla:** Mapa interactivo con ruta limpia, marcador del comercio, icono del repartidor en movimiento y marcador de entrega.
- **Bottom 50% (Bottom Sheet deslizable):**
  - **Status Pill Dinámico:** "En preparación en el local" -> "El repartidor va en camino" -> "Llegando a tu puerta".
  - **Barra de Progreso Segmentada:** 4 pasos visuales fáciles de auditar.
  - **Tarjeta del Rider:** Foto del repartidor, nombre, modelo de vehículo / placa, calificación y botón rápido para llamada/chat seguro.

---

## 7. Directrices de UX & Copywriting

1. **Tono de Voz:** Cercano, ágil, servicial y directo. Evitar tecnicismos.
2. **Formato de Precios:**
   - Símbolo de moneda siempre visible pero sutil (`S/ 24.50` o `$24.50`).
   - Evitar ocultar impuestos o tarifas de servicio hasta el último paso; indicar "Tarifa de servicio incluida" o desglose claro en un toque.
3. **Manejo de Estados Vacíos (Empty States):**
   - Siempre acompañar con una ilustración apetitosa o amigable y un botón de acción claro ("Explorar restaurantes cerca", "Revisar promociones del día").
"""

with open("system.md", "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Archivo system.md generado correctamente.")